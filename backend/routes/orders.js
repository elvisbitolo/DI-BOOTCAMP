const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order (seller only)
router.post('/', [
  auth,
  authorize('seller'),
  body('pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('pickupLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Pickup coordinates must be [longitude, latitude]'),
  body('deliveryLocation.address').notEmpty().withMessage('Delivery address is required'),
  body('deliveryLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Delivery coordinates must be [longitude, latitude]'),
  body('packageDescription').trim().notEmpty().withMessage('Package description is required'),
  body('packageWeight').isFloat({ min: 0.1, max: 100 }).withMessage('Package weight must be between 0.1kg and 100kg'),
  body('packageDimensions.length').isFloat({ min: 1 }).withMessage('Length is required'),
  body('packageDimensions.width').isFloat({ min: 1 }).withMessage('Width is required'),
  body('packageDimensions.height').isFloat({ min: 1 }).withMessage('Height is required'),
  body('deliveryFee').isFloat({ min: 50 }).withMessage('Delivery fee must be at least KES 50'),
  body('distance').isFloat({ min: 0.1 }).withMessage('Distance is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickupLocation,
      deliveryLocation,
      packageDescription,
      packageWeight,
      packageDimensions,
      packageImages,
      deliveryFee,
      paymentMethod,
      specialInstructions,
      priority,
      distance
    } = req.body;

    // Calculate estimated delivery time
    const baseTime = 30; // 30 minutes base time
    const timePerKm = 5; // 5 minutes per kilometer
    const estimatedDeliveryMinutes = Math.round(baseTime + (distance * timePerKm));
    const estimatedDeliveryTime = new Date(Date.now() + estimatedDeliveryMinutes * 60 * 1000);

    const order = new Order({
      seller: req.user._id,
      pickupLocation,
      deliveryLocation,
      packageDescription,
      packageWeight,
      packageDimensions,
      packageImages: packageImages || [],
      deliveryFee,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions,
      priority: priority || 'standard',
      distance,
      estimatedDeliveryTime
    });

    await order.save();
    await order.populate('seller', 'name phone businessName businessLocation');

    // TODO: Send notification to nearby riders

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get orders (different for sellers and riders)
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    let populateFields = 'seller rider';

    if (req.user.userType === 'seller') {
      query.seller = req.user._id;
    } else if (req.user.userType === 'rider') {
      // Riders can see available orders and their assigned orders
      query.$or = [
        { status: 'pending' },
        { rider: req.user._id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate(populateFields, 'name phone businessName vehicleType')
      .sort({ orderTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

// @route   GET /api/orders/available
// @desc    Get available orders for riders
router.get('/available', [auth, authorize('rider')], async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Location coordinates are required' });
    }

    const availableOrders = await Order.findAvailableOrders(
      [parseFloat(longitude), parseFloat(latitude)],
      parseFloat(maxDistance)
    );

    res.json({ orders: availableOrders });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({ error: 'Server error fetching available orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('seller', 'name phone businessName businessLocation')
      .populate('rider', 'name phone vehicleType vehicleNumber');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (req.user.userType === 'seller' && order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.userType === 'rider' && order.rider && order.rider._id.toString() !== req.user._id.toString() && order.status !== 'pending') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error fetching order' });
  }
});

// @route   PUT /api/orders/:id/accept
// @desc    Accept an order (rider only)
router.put('/:id/accept', [auth, authorize('rider')], async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is no longer available' });
    }

    if (order.rider) {
      return res.status(400).json({ error: 'Order has already been accepted by another rider' });
    }

    await order.acceptOrder(req.user._id);
    await order.populate('seller rider', 'name phone businessName vehicleType');

    // Update rider's response time
    const responseTime = Math.round((Date.now() - order.orderTime) / (1000 * 60)); // in minutes
    req.user.responseTime = Math.round((req.user.responseTime + responseTime) / 2);
    await req.user.save();

    // TODO: Send notification to seller
    // TODO: Send real-time notification via Socket.io

    res.json({
      message: 'Order accepted successfully',
      order
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ error: 'Server error accepting order' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
router.put('/:id/status', [
  auth,
  body('status').isIn(['picked_up', 'in_transit', 'delivered']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.userType === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.userType === 'rider' && (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate status transitions
    if (req.user.userType === 'rider') {
      const validTransitions = {
        'accepted': ['picked_up'],
        'picked_up': ['in_transit'],
        'in_transit': ['delivered']
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).json({ error: `Cannot transition from ${order.status} to ${status}` });
      }
    }

    await order.updateStatus(status, notes);
    await order.populate('seller rider', 'name phone businessName vehicleType');

    // Update user statistics if order is delivered
    if (status === 'delivered') {
      await order.seller.incrementCompletedOrders();
      await order.rider.incrementCompletedOrders();
    }

    // TODO: Send notifications
    // TODO: Send real-time notification via Socket.io

    res.json({
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
router.put('/:id/cancel', [
  auth,
  body('reason').trim().isLength({ max: 300 }).withMessage('Cancellation reason cannot exceed 300 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (req.user.userType === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.userType === 'rider' && (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    await order.cancelOrder(req.user._id, reason);
    await order.populate('seller rider', 'name phone businessName vehicleType');

    // Update cancellation statistics
    if (req.user.userType === 'seller') {
      await order.seller.incrementCancelledOrders();
    } else if (req.user.userType === 'rider') {
      await order.rider.incrementCancelledOrders();
    }

    // TODO: Send notifications
    // TODO: Send real-time notification via Socket.io

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Server error cancelling order' });
  }
});

module.exports = router;
