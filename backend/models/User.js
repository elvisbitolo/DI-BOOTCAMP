const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: ['seller', 'rider'],
    default: 'seller'
  },
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // Seller specific fields
  businessName: {
    type: String,
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Business location cannot exceed 200 characters']
  },
  // Rider specific fields
  vehicleType: {
    type: String,
    enum: ['motorcycle', 'bicycle', 'car', 'van'],
    default: 'motorcycle'
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    }
  },
  // Rating system
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Credibility metrics
  completedOrders: {
    type: Number,
    default: 0
  },
  cancelledOrders: {
    type: Number,
    default: 0
  },
  responseTime: {
    type: Number, // in minutes
    default: 0
  },
  // Preferences
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'sw', 'ki', 'lu', 'lo', 'ka', 'me', 'kj'] // English, Swahili, Kikuyu, Luhya, Luo, Kalenjin, Meru, Kamba
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ isAvailable: 1 });
userSchema.index({ currentLocation: '2dsphere' });
userSchema.index({ averageRating: -1 });

// Virtual for calculating credibility score
userSchema.virtual('credibilityScore').get(function() {
  const ratingWeight = 0.4;
  const completionWeight = 0.3;
  const responseWeight = 0.2;
  const experienceWeight = 0.1;
  
  const ratingScore = this.averageRating / 5;
  const completionScore = this.completedOrders / Math.max(1, this.completedOrders + this.cancelledOrders);
  const responseScore = Math.max(0, 1 - (this.responseTime / 60)); // Normalize to 0-1 (60 minutes = 0)
  const experienceScore = Math.min(1, this.completedOrders / 100); // 100 orders = full experience score
  
  return Math.round((ratingScore * ratingWeight + 
                    completionScore * completionWeight + 
                    responseScore * responseWeight + 
                    experienceScore * experienceWeight) * 100);
});

// Method to update rating
userSchema.methods.updateRating = async function(newRating) {
  const totalRatingPoints = this.averageRating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.averageRating = totalRatingPoints / this.totalRatings;
  await this.save();
};

// Method to increment completed orders
userSchema.methods.incrementCompletedOrders = async function() {
  this.completedOrders += 1;
  await this.save();
};

// Method to increment cancelled orders
userSchema.methods.incrementCancelledOrders = async function() {
  this.cancelledOrders += 1;
  await this.save();
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const bcrypt = require('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification code
userSchema.methods.generateVerificationCode = function() {
  const crypto = require('crypto');
  this.verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  this.verificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return this.verificationCode;
};

module.exports = mongoose.model('User', userSchema);
