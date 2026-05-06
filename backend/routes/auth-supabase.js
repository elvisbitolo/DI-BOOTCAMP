const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user with Supabase and send welcome email
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('userType').isIn(['seller', 'rider']).withMessage('User type must be seller or rider')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, userType, riderType, area, vehicleNumber } = req.body;
    const supabase = req.app.get('supabase');
    const emailService = req.app.get('emailService');

    // Check if user already exists in Supabase
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .eq('user_type', userType)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          user_type: userType
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: 'Failed to create authentication account' });
    }

    // Create user profile in database
    const userData = {
      id: authData.user.id,
      name: name,
      email: email,
      phone: phone,
      user_type: userType,
      is_online: false,
      created_at: new Date().toISOString()
    };

    if (userType === 'rider') {
      userData.rider_type = riderType || 'motorcycle';
      userData.area = area || '';
      userData.vehicle_number = vehicleNumber || '';
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert([userData]);

    if (insertError) {
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, name, userType);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken(authData.user.id);

    res.status(201).json({
      message: 'User registered successfully! Please check your email.',
      token,
      user: {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        userType: userData.user_type
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('userType').isIn(['seller', 'rider']).withMessage('User type must be seller or rider')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, userType } = req.body;
    const supabase = req.app.get('supabase');

    // Check if user exists in database
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('user_type', userType)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!existingUser) {
      return res.status(401).json({ error: 'No account found with these credentials' });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update user status to online
    await supabase
      .from('users')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', existingUser.id);

    // Generate JWT token
    const token = generateToken(existingUser.id);

    res.json({
      message: 'Login successful',
      token,
      user: existingUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supabase = req.app.get('supabase');

    // Update user status to offline
    await supabase
      .from('users')
      .update({ is_online: false })
      .eq('id', decoded.userId);

    // Sign out from Supabase
    await supabase.auth.signOut();

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supabase = req.app.get('supabase');

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
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

module.exports = router;
