const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: {
    type: String,
    required: true,
    enum: ['super_admin', 'admin', 'support', 'analyst'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'users_view', 'users_edit', 'users_delete',
      'orders_view', 'orders_edit', 'orders_delete',
      'payments_view', 'payments_edit', 'payments_refund',
      'analytics_view', 'analytics_export',
      'system_config', 'system_logs',
      'support_tickets', 'support_chat'
    ]
  }],
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  sessionToken: {
    type: String,
    default: null
  },
  sessionExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

// Virtual for checking if account is locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate session token
adminSchema.methods.generateSessionToken = function() {
  const crypto = require('crypto');
  this.sessionToken = crypto.randomBytes(32).toString('hex');
  this.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  this.lastLogin = new Date();
  return this.sessionToken;
};

// Method to check if admin has permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Static method to find admin by session token
adminSchema.statics.findBySessionToken = function(token) {
  return this.findOne({
    sessionToken: token,
    sessionExpiry: { $gt: Date.now() },
    isActive: true
  }).select('-password');
};

module.exports = mongoose.model('Admin', adminSchema);
