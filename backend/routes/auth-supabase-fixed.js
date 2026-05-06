const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPasswordResetTemplate, getPasswordResetSuccessTemplate, getWelcomeEmailTemplate, getOrderConfirmationTemplate, getOrderAcceptedTemplate } = require('../services/emailTemplates');
const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { email } = req.body;
      const supabase = req.app.get('supabase');

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(400).json({ error: 'No account found with this email address' });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      // Store reset token in database
      const { error: updateError } = await supabase
        .from('password_resets')
        .insert([{
          email,
          token: resetToken,
          expires_at: resetExpires,
          created_at: new Date().toISOString()
        }]);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to generate reset token' });
      }

      // Send email with reset link
      const emailService = req.app.get('emailService');
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      await emailService.sendEmail(
        email,
        'Password Reset Request - Delivery System',
        getPasswordResetTemplate(resetUrl)
      );

      res.json({
        message: 'Password reset instructions sent to your email',
        email: email // Return email for testing
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    return value === req.body.password || 'Passwords do not match';
  }).withMessage('Passwords do not match')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { token, password } = req.body;
      const supabase = req.app.get('supabase');

      // Find valid reset token
      const { data: resetData, error: resetError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (resetError || !resetData) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', resetData.email)
        .single();

      if (userError || !user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to reset password' });
      }

      // Mark token as used
      await supabase
        .from('password_resets')
        .update({ used: true })
        .eq('id', resetData.id);

      // Send confirmation email
      const emailService = req.app.get('emailService');
      await emailService.sendEmail(
        resetData.email,
        'Password Reset Successful - Delivery System',
        getPasswordResetSuccessTemplate()
      );

      res.json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
module.exports.googleAuth = require('./google-auth');
