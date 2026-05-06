const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const Admin = require('../models/Admin');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const admin = await Admin.findBySessionToken(token);
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    if (admin.isLocked) {
      return res.status(423).json({ error: 'Account is locked. Please contact support.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Server error in authentication.' });
  }
};

// Check admin permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    if (admin.isLocked) {
      return res.status(423).json({ error: 'Account is locked. Please try again later.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      await admin.incLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts and generate session token
    await admin.resetLoginAttempts();
    const sessionToken = admin.generateSessionToken();
    await admin.save();

    res.json({
      message: 'Login successful',
      token: sessionToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
router.get('/dashboard', [adminAuth, checkPermission('analytics_view')], async (req, res) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      activeUsers,
      pendingOrders,
      completedOrders,
      totalRatings
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Payment.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.countDocuments({ isOnline: true, isActive: true }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Rating.countDocuments()
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    // Get user distribution by type
    const userDistribution = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get monthly revenue (last 6 months)
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue: revenue,
        activeUsers,
        pendingOrders,
        completedOrders,
        totalRatings
      },
      distributions: {
        users: userDistribution,
        orders: orderStatusDistribution
      },
      monthlyRevenue
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
router.get('/users', [adminAuth, checkPermission('users_view')], async (req, res) => {
  try {
    const { page = 1, limit = 20, userType, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (userType) {
      query.userType = userType;
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
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
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
router.put('/users/:id/status', [
  adminAuth,
  checkPermission('users_edit'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isActive, isOnline: isActive ? false : false } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Server error updating user status' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with pagination and filters
router.get('/orders', [adminAuth, checkPermission('orders_view')], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userType, dateRange } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.orderTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('seller', 'name email userType')
      .populate('rider', 'name email userType')
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

// @route   GET /api/admin/payments
// @desc    Get all payments with pagination and filters
router.get('/payments', [adminAuth, checkPermission('payments_view')], async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentMethod, dateRange } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.paymentStatus = status;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .populate('order', 'orderNumber')
      .populate('payer', 'name email')
      .populate('payee', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error fetching payments' });
  }
});

// @route   GET /api/admin/analytics/revenue
// @desc    Get revenue analytics
router.get('/analytics/revenue', [adminAuth, checkPermission('analytics_view')], async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const matchQuery = {
      paymentStatus: 'completed'
    };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default: // day
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const revenueAnalytics = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    // Get payment method breakdown
    const paymentMethodBreakdown = await Payment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      }
    ]);

    res.json({
      revenueAnalytics,
      paymentMethodBreakdown
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Server error fetching revenue analytics' });
  }
});

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics
router.get('/analytics/users', [adminAuth, checkPermission('analytics_view')], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // User growth over time
    const userGrowth = await User.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: 1 },
          sellers: {
            $sum: { $cond: [{ $eq: ['$userType', 'seller'] }, 1, 0] }
          },
          riders: {
            $sum: { $cond: [{ $eq: ['$userType', 'rider'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // User activity
    const userActivity = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          online: { $sum: { $cond: ['$isOnline', 1, 0] } },
          sellers: {
            $sum: { $cond: [{ $eq: ['$userType', 'seller'] }, 1, 0] }
          },
          riders: {
            $sum: { $cond: [{ $eq: ['$userType', 'rider'] }, 1, 0] }
          }
        }
      }
    ]);

    // Top performers
    const topSellers = await User.find({ userType: 'seller', isActive: true })
      .sort({ completedOrders: -1 })
      .limit(10)
      .select('name businessName completedOrders averageRating credibilityScore');

    const topRiders = await User.find({ userType: 'rider', isActive: true })
      .sort({ completedOrders: -1 })
      .limit(10)
      .select('name vehicleType completedOrders averageRating credibilityScore');

    res.json({
      userGrowth,
      userActivity: userActivity[0] || {},
      topPerformers: {
        sellers: topSellers,
        riders: topRiders
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Server error fetching user analytics' });
  }
});

// @route   POST /api/admin/logout
// @desc    Admin logout
router.post('/logout', adminAuth, async (req, res) => {
  try {
    req.admin.sessionToken = null;
    req.admin.sessionExpiry = null;
    await req.admin.save();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

module.exports = router;
