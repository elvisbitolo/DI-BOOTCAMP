const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', [
  auth,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Please provide a valid phone number'),
  body('businessName').optional().trim().isLength({ max: 100 }).withMessage('Business name cannot exceed 100 characters'),
  body('businessLocation').optional().trim().isLength({ max: 200 }).withMessage('Business location cannot exceed 200 characters'),
  body('vehicleType').optional().isIn(['motorcycle', 'bicycle', 'car', 'van']).withMessage('Invalid vehicle type'),
  body('vehicleNumber').optional().trim().isLength({ max: 20 }).withMessage('Vehicle number cannot exceed 20 characters'),
  body('preferredLanguage').optional().isIn(['en', 'sw', 'ki', 'lu', 'lo', 'ka', 'me', 'kj']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = [
      'name', 'phone', 'businessName', 'businessLocation', 
      'vehicleType', 'vehicleNumber', 'preferredLanguage',
      'emailNotifications', 'pushNotifications'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate user type specific fields
    if (req.user.userType === 'seller') {
      delete updates.vehicleType;
      delete updates.vehicleNumber;
    } else if (req.user.userType === 'rider') {
      delete updates.businessName;
      delete updates.businessLocation;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// @route   PUT /api/users/location
// @desc    Update user location (rider only)
router.put('/location', [
  auth,
  authorize('rider'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { longitude, latitude, isAvailable } = req.body;

    const updates = {
      currentLocation: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      isOnline: true
    };

    if (isAvailable !== undefined) {
      updates.isAvailable = isAvailable;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Location updated successfully',
      user
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error updating location' });
  }
});

// @route   PUT /api/users/availability
// @desc    Update rider availability
router.put('/availability', [
  auth,
  authorize('rider'),
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { isAvailable, isOnline: isAvailable } },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Availability updated successfully',
      user
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Server error updating availability' });
  }
});

// @route   GET /api/users/nearby
// @desc    Get nearby riders (for sellers)
router.get('/nearby', [
  auth,
  authorize('seller')
], async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Location coordinates are required' });
    }

    const nearbyRiders = await User.find({
      userType: 'rider',
      isAvailable: true,
      isOnline: true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance * 1000 // Convert to meters
        }
      }
    })
    .select('name profileImage averageRating credibilityScore vehicleType currentLocation')
    .sort({ credibilityScore: -1, averageRating: -1 })
    .limit(20);

    res.json({ riders: nearbyRiders });
  } catch (error) {
    console.error('Get nearby riders error:', error);
    res.status(500).json({ error: 'Server error fetching nearby riders' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q, userType, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (userType) {
      query.userType = userType;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { businessName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email userType profileImage businessName averageRating credibilityScore')
      .sort({ credibilityScore: -1, averageRating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error searching users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name userType profileImage businessName businessLocation vehicleType averageRating totalRatings credibilityScore completedOrders cancelledOrders responseTime');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

// @route   POST /api/users/upload-profile-image
// @desc    Upload profile image
router.post('/upload-profile-image', [
  auth,
  body('image').notEmpty().withMessage('Image is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { image } = req.body;

    // TODO: Implement image upload to Cloudinary
    // For now, just store the base64 string
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profileImage: image } },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image updated successfully',
      user
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ error: 'Server error uploading profile image' });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { isActive: false, isOnline: false, isAvailable: false } },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Account deactivated successfully',
      user
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ error: 'Server error deactivating account' });
  }
});

module.exports = router;
