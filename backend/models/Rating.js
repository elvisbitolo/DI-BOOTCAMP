const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  responseFromRated: {
    type: String,
    maxlength: [500, 'Response cannot exceed 500 characters']
  },
  responseDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
ratingSchema.index({ order: 1 });
ratingSchema.index({ rater: 1 });
ratingSchema.index({ rated: 1 });
ratingSchema.index({ rating: -1 });
ratingSchema.index({ isVerified: 1 });

// Ensure one rating per user per order
ratingSchema.index({ order: 1, rater: 1 }, { unique: true });

// Pre-save middleware to validate rating
ratingSchema.pre('save', function(next) {
  // Ensure rater and rated are different users
  if (this.rater.toString() === this.rated.toString()) {
    return next(new Error('Users cannot rate themselves'));
  }
  
  // Calculate average rating if categories are provided
  if (this.categories && Object.values(this.categories).every(val => val !== undefined)) {
    const values = Object.values(this.categories);
    this.rating = Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
  }
  
  next();
});

// Static method to get user's average rating
ratingSchema.statics.getUserAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { rated: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$rated',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalRatings: result[0].totalRatings
  } : {
    averageRating: 0,
    totalRatings: 0
  };
};

// Static method to get user's category ratings
ratingSchema.statics.getUserCategoryRatings = async function(userId) {
  const result = await this.aggregate([
    { $match: { rated: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$rated',
        communication: { $avg: '$categories.communication' },
        punctuality: { $avg: '$categories.punctuality' },
        professionalism: { $avg: '$categories.professionalism' },
        quality: { $avg: '$categories.quality' }
      }
    }
  ]);
  
  return result.length > 0 ? {
    communication: Math.round(result[0].communication * 10) / 10,
    punctuality: Math.round(result[0].punctuality * 10) / 10,
    professionalism: Math.round(result[0].professionalism * 10) / 10,
    quality: Math.round(result[0].quality * 10) / 10
  } : {
    communication: 0,
    punctuality: 0,
    professionalism: 0,
    quality: 0
  };
};

// Static method to get recent ratings for a user
ratingSchema.statics.getRecentRatings = function(userId, limit = 10) {
  return this.find({ rated: userId })
    .populate('rater', 'name profileImage')
    .populate('order', 'orderNumber orderTime')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Rating', ratingSchema);
