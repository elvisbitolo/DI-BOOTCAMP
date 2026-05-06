const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// @route   POST /api/auth/google
// @desc    Google OAuth login
router.post('/google', [
  body('token').notEmpty().withMessage('Google token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { token } = req.body;
      const supabase = req.app.get('supabase');

      // Verify Google token (simplified - in production, use proper verification)
      const { data: googleUser, error: googleError } = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (googleError || !googleUser) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }

      // Check if user exists in our system
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', googleUser.email)
        .single();

      if (existingUser) {
        // Update last login and login
        await supabase
          .from('users')
          .update({ 
            last_login: new Date().toISOString(),
            is_online: true
          })
          .eq('id', existingUser.id);

        // Generate JWT
        const jwt = require('jsonwebtoken');
        const userToken = jwt.sign({ 
          userId: existingUser.id,
          email: existingUser.email 
        }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || '7d'
        });

        res.json({
          message: 'Login successful',
          token: userToken,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            user_type: existingUser.user_type,
            avatar: googleUser.picture
          }
        });
      } else {
        // Create new user from Google account
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            name: googleUser.name,
            email: googleUser.email,
            user_type: 'seller', // Default to seller, can be updated
            avatar: googleUser.picture,
            is_online: true,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          return res.status(500).json({ error: 'Failed to create user account' });
        }

        // Generate JWT
        const jwt = require('jsonwebtoken');
        const userToken = jwt.sign({ 
          userId: newUser.id,
          email: newUser.email 
        }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRE || '7d'
        });

        res.status(201).json({
          message: 'Account created successfully',
          token: userToken,
          user: newUser
        });
      }
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
