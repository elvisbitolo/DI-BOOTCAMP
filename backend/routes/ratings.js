const express = require('express');
const { body, validationResult } = require('express-validator');
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/ratings
// @desc    Create a new rating
router.post('/', [
  auth,
  body('order').isMongoId().withMessage('Valid order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters'),
  body('categories.communication').optional().isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
  body('categories.punctuality').optional().isInt({ min: 1, max: 5 }).withMessage('Punctuality rating must be between 1 and 5'),
  body('categories.professionalism').optional().isInt({ min: 1, max: 5 }).withMessage('Professionalism rating must be between 1 and 5'),
  body('categories.quality').optional().isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order, rating, review, categories } = req.body;

    // Check if order exists and is delivered
    const orderDoc = await Order.findById(order);
    if (!orderDoc) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderDoc.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only rate delivered orders' });
    }

    // Check if user is part of this order
    if (orderDoc.seller.toString() !== req.user._id.toString() && 
        (!orderDoc.rider || orderDoc.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'You can only rate orders you participated in' });
    }

    // Check if user has already rated this order
    const existingRating = await Rating.findOne({ order, rater: req.user._id });
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this order' });
    }

    // Determine who is being rated
    let ratedUser;
    if (orderDoc.seller.toString() === req.user._id.toString()) {
      ratedUser = orderDoc.rider;
    } else {
      ratedUser = orderDoc.seller;
    }

    if (!ratedUser) {
      return res.status(400).json({ error: 'Cannot rate this order' });
    }

    // Create rating
    const ratingDoc = new Rating({
      order,
      rater: req.user._id,
      rated: ratedUser,
      rating,
      review,
      categories
    });

    await ratingDoc.save();

    // Update user's average rating
    const ratedUserDoc = await User.findById(ratedUser);
    await ratedUserDoc.updateRating(rating);

    await ratingDoc.populate('rater', 'name profileImage');
    await ratingDoc.populate('rated', 'name profileImage');
    await ratingDoc.populate('order', 'orderNumber');

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: ratingDoc
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Server error creating rating' });
  }
});

// @route   GET /api/ratings/user/:userId
// @desc    Get ratings for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ratings = await Rating.find({ rated: userId })
      .populate('rater', 'name profileImage')
      .populate('order', 'orderNumber orderTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ rated: userId });

    // Get user's average rating and category ratings
    const [averageRating, categoryRatings] = await Promise.all([
      Rating.getUserAverageRating(userId),
      Rating.getUserCategoryRatings(userId)
    ]);

    res.json({
      ratings,
      averageRating,
      categoryRatings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Server error fetching user ratings' });
  }
});

// @route   GET /api/ratings/my-ratings
// @desc    Get ratings created by current user
router.get('/my-ratings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ rater: req.user._id })
      .populate('rated', 'name profileImage')
      .populate('order', 'orderNumber orderTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments({ rater: req.user._id });

    res.json({
      ratings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my ratings error:', error);
    res.status(500).json({ error: 'Server error fetching your ratings' });
  }
});

// @route   GET /api/ratings/order/:orderId
// @desc    Get ratings for a specific order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and user has permission
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is part of this order
    if (order.seller.toString() !== req.user._id.toString() && 
        (!order.rider || order.rider.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const ratings = await Rating.find({ order: orderId })
      .populate('rater', 'name profileImage')
      .populate('rated', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({ ratings });
  } catch (error) {
    console.error('Get order ratings error:', error);
    res.status(500).json({ error: 'Server error fetching order ratings' });
  }
});

// @route   PUT /api/ratings/:id/respond
// @desc    Respond to a rating (rated user only)
router.put('/:id/respond', [
  auth,
  body('response').trim().notEmpty().withMessage('Response is required'),
  body('response').trim().isLength({ max: 500 }).withMessage('Response cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { response } = req.body;
    const { id } = req.params;

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Check if user is the one being rated
    if (rating.rated.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the rated user can respond to this rating' });
    }

    rating.responseFromRated = response;
    rating.responseDate = new Date();
    await rating.save();

    await rating.populate('rater', 'name profileImage');
    await rating.populate('rated', 'name profileImage');
    await rating.populate('order', 'orderNumber');

    res.json({
      message: 'Response added successfully',
      rating
    });
  } catch (error) {
    console.error('Respond to rating error:', error);
    res.status(500).json({ error: 'Server error responding to rating' });
  }
});

// @route   GET /api/ratings/stats/:userId
// @desc    Get rating statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [averageRating, categoryRatings, recentRatings] = await Promise.all([
      Rating.getUserAverageRating(userId),
      Rating.getUserCategoryRatings(userId),
      Rating.getRecentRatings(userId, 5)
    ]);

    // Calculate rating distribution
    const ratingDistribution = await Rating.aggregate([
      { $match: { rated: user._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      averageRating,
      categoryRatings,
      ratingDistribution,
      recentRatings,
      totalRatings: user.totalRatings,
      credibilityScore: user.credibilityScore
    });
  } catch (error) {
    console.error('Get rating stats error:', error);
    res.status(500).json({ error: 'Server error fetching rating statistics' });
  }
});

module.exports = router;
