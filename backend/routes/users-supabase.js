const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone format'),
  body('area').optional().trim(),
  body('vehicleNumber').optional().trim()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, area, vehicleNumber } = req.body;
    const supabase = req.app.get('supabase');

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (area && req.user.user_type === 'rider') updateData.area = area;
    if (vehicleNumber && req.user.user_type === 'rider') updateData.vehicle_number = vehicleNumber;
    updateData.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/availability
// @desc    Update user availability (riders only)
router.put('/availability', [
  body('isAvailable').isBoolean().withMessage('Availability must be boolean')
], auth, authorize('rider'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isAvailable } = req.body;
    const supabase = req.app.get('supabase');

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update availability' });
    }

    // Emit availability change via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('user_availability_changed', {
        userId: req.user.id,
        isAvailable: isAvailable
      });
    }

    res.json({
      message: 'Availability updated successfully',
      user
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/online
// @desc    Get online users by type
router.get('/online', auth, async (req, res) => {
  try {
    const { userType } = req.query;
    const supabase = req.app.get('supabase');

    let query = supabase
      .from('users')
      .select('id, name, email, user_type, rider_type, area, vehicle_number, average_rating, is_online')
      .eq('is_online', true);

    if (userType && ['seller', 'rider'].includes(userType)) {
      query = query.eq('user_type', userType);
    }

    const { data: users, error } = await query.order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch online users' });
    }

    res.json(users);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name or area
router.get('/search', auth, async (req, res) => {
  try {
    const { q: query, userType, area } = req.query;
    const supabase = req.app.get('supabase');

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    let dbQuery = supabase
      .from('users')
      .select('id, name, email, user_type, rider_type, area, vehicle_number, average_rating, is_online')
      .ilike('name', `%${query}%`);

    if (userType && ['seller', 'rider'].includes(userType)) {
      dbQuery = dbQuery.eq('user_type', userType);
    }

    if (area) {
      dbQuery = dbQuery.ilike('area', `%${area}%`);
    }

    const { data: users, error } = await dbQuery.order('name', { ascending: true }).limit(20);

    if (error) {
      return res.status(500).json({ error: 'Failed to search users' });
    }

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = req.app.get('supabase');

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, user_type, rider_type, area, vehicle_number, average_rating, total_ratings, completed_orders, total_earnings, is_online')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/users/online-status
// @desc    Update online status (internal use)
router.put('/online-status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    const supabase = req.app.get('supabase');

    const { data: user, error } = await supabase
      .from('users')
      .update({ 
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update online status' });
    }

    // Emit status change via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('user_status_changed', {
        userId: req.user.id,
        isOnline: isOnline,
        lastSeen: new Date().toISOString()
      });
    }

    res.json({
      message: 'Online status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
