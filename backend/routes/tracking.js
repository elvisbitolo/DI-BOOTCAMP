const express = require('express');
const { body, validationResult } = require('express-validator');
const LocationTracking = require('../models/LocationTracking');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/tracking/start
// @desc    Start location tracking for an order
router.post('/start', [
  auth,
  authorize('rider'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.body;

    // Check if order exists and belongs to rider
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.rider || order.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Order not assigned to you' });
    }

    if (order.status !== 'accepted' && order.status !== 'picked_up') {
      return res.status(400).json({ error: 'Cannot start tracking for this order status' });
    }

    // Check if tracking already exists
    let tracking = await LocationTracking.getActiveTracking(req.user._id);
    if (tracking) {
      return res.status(400).json({ error: 'Tracking already active for another order' });
    }

    // Create new tracking session
    tracking = new LocationTracking({
      rider: req.user._id,
      order: orderId
    });

    await tracking.save();
    await tracking.populate('order', 'orderNumber status pickupLocation deliveryLocation');

    res.status(201).json({
      message: 'Location tracking started',
      tracking
    });
  } catch (error) {
    console.error('Start tracking error:', error);
    res.status(500).json({ error: 'Server error starting tracking' });
  }
});

// @route   POST /api/tracking/update
// @desc    Update rider location
router.post('/update', [
  auth,
  authorize('rider'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('speed').optional().isFloat({ min: 0, max: 200 }).withMessage('Speed must be between 0 and 200 km/h'),
  body('heading').optional().isFloat({ min: 0, max: 360 }).withMessage('Heading must be between 0 and 360 degrees'),
  body('accuracy').optional().isFloat({ min: 0 }).withMessage('Accuracy must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { longitude, latitude, speed = 0, heading = 0, accuracy = 10 } = req.body;

    const tracking = await LocationTracking.getActiveTracking(req.user._id);
    if (!tracking) {
      return res.status(404).json({ error: 'No active tracking session found' });
    }

    await tracking.addLocation([longitude, latitude], speed, heading, accuracy);

    // Get Socket.io instance for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${tracking.order}`).emit('location_update', {
        riderId: req.user._id,
        coordinates: [longitude, latitude],
        speed,
        heading,
        timestamp: new Date(),
        estimatedArrival: tracking.estimatedArrival,
        totalDistance: tracking.totalDistance
      });
    }

    res.json({
      message: 'Location updated successfully',
      coordinates: [longitude, latitude],
      totalDistance: tracking.totalDistance,
      estimatedArrival: tracking.estimatedArrival
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error updating location' });
  }
});

// @route   POST /api/tracking/stop
// @desc    Stop location tracking
router.post('/stop', [auth, authorize('rider')], async (req, res) => {
  try {
    const tracking = await LocationTracking.getActiveTracking(req.user._id);
    if (!tracking) {
      return res.status(404).json({ error: 'No active tracking session found' });
    }

    await tracking.endTracking();
    await tracking.populate('order', 'orderNumber status');

    res.json({
      message: 'Location tracking stopped',
      tracking: {
        orderId: tracking.order._id,
        orderNumber: tracking.order.orderNumber,
        totalDistance: tracking.totalDistance,
        duration: tracking.endedAt - tracking.startedAt
      }
    });
  } catch (error) {
    console.error('Stop tracking error:', error);
    res.status(500).json({ error: 'Server error stopping tracking' });
  }
});

// @route   GET /api/tracking/order/:orderId
// @desc    Get tracking data for an order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user has permission to view this order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.userType === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.userType === 'rider' && (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tracking = await LocationTracking.getOrderTracking(orderId);
    
    if (!tracking) {
      return res.status(404).json({ error: 'No tracking data found for this order' });
    }

    // Get recent locations for live tracking
    const recentLocations = tracking.locations.slice(-50); // Last 50 locations
    
    res.json({
      tracking: {
        ...tracking.toObject(),
        locations: recentLocations
      }
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({ error: 'Server error fetching tracking data' });
  }
});

// @route   GET /api/tracking/live/:orderId
// @desc    Get live tracking data (for real-time map)
router.get('/live/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.userType === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tracking = await LocationTracking.findOne({ 
      order: orderId, 
      isActive: true 
    }).populate('rider', 'name vehicleType');

    if (!tracking) {
      return res.status(404).json({ error: 'No active tracking found' });
    }

    // Get the latest location
    const latestLocation = tracking.locations[tracking.locations.length - 1];
    
    res.json({
      rider: {
        id: tracking.rider._id,
        name: tracking.rider.name,
        vehicleType: tracking.rider.vehicleType
      },
      location: {
        coordinates: latestLocation.coordinates.coordinates,
        timestamp: latestLocation.timestamp,
        speed: latestLocation.speed,
        heading: latestLocation.heading
      },
      estimatedArrival: tracking.estimatedArrival,
      totalDistance: tracking.totalDistance,
      isActive: tracking.isActive
    });
  } catch (error) {
    console.error('Get live tracking error:', error);
    res.status(500).json({ error: 'Server error fetching live tracking' });
  }
});

// @route   GET /api/tracking/history/:riderId
// @desc    Get tracking history for a rider (admin only)
router.get('/history/:riderId', [auth, authorize('admin')], async (req, res) => {
  try {
    const { riderId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trackingHistory = await LocationTracking.find({ rider: riderId })
      .populate('order', 'orderNumber status deliveryFee')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LocationTracking.countDocuments({ rider: riderId });

    res.json({
      trackingHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tracking history error:', error);
    res.status(500).json({ error: 'Server error fetching tracking history' });
  }
});

module.exports = router;
