const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['mpesa', 'card', 'wallet', 'cash']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  externalTransactionId: {
    type: String,
    default: null // For external payment gateway references
  },
  paymentGateway: {
    type: String,
    enum: ['mpesa', 'stripe', 'paypal', 'flutterwave', 'wallet'],
    default: null
  },
  paymentDetails: {
    // M-Pesa specific
    phoneNumber: String,
    mpesaReceipt: String,
    
    // Card specific
    last4: String,
    brand: String,
    exp_month: Number,
    exp_year: Number,
    
    // Wallet specific
    walletType: String,
    walletBalance: Number,
    
    // Common
    fee: Number,
    tax: Number,
    total: Number
  },
  refundDetails: {
    amount: Number,
    reason: String,
    refundId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    processedAt: Date
  },
  metadata: {
    ip: String,
    userAgent: String,
    deviceId: String
  },
  failureReason: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ order: 1 });
paymentSchema.index({ payer: 1 });
paymentSchema.index({ payee: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ externalTransactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate transaction ID
paymentSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    const Payment = this.constructor;
    const count = await Payment.countDocuments();
    this.transactionId = `PAY${Date.now()}${String(count + 1).padStart(3, '0')}`;
  }
  
  // Set expiry for pending payments (24 hours)
  if (this.isNew && this.paymentStatus === 'pending') {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Method to process payment
paymentSchema.methods.processPayment = async function(gatewayResponse) {
  this.paymentStatus = 'completed';
  this.externalTransactionId = gatewayResponse.transactionId;
  this.processedAt = new Date();
  
  // Update payment details based on gateway response
  if (gatewayResponse.mpesaReceipt) {
    this.paymentDetails.mpesaReceipt = gatewayResponse.mpesaReceipt;
  }
  
  if (gatewayResponse.fee) {
    this.paymentDetails.fee = gatewayResponse.fee;
  }
  
  await this.save();
  return this;
};

// Method to fail payment
paymentSchema.methods.failPayment = function(reason) {
  this.paymentStatus = 'failed';
  this.failureReason = reason;
  this.processedAt = new Date();
  return this.save();
};

// Method to refund payment
paymentSchema.methods.refundPayment = async function(amount, reason) {
  if (this.paymentStatus !== 'completed') {
    throw new Error('Can only refund completed payments');
  }
  
  if (amount > this.amount) {
    throw new Error('Refund amount cannot exceed payment amount');
  }
  
  this.refundDetails = {
    amount,
    reason,
    refundId: `REF${Date.now()}`,
    status: 'pending'
  };
  
  // TODO: Process actual refund through payment gateway
  
  this.refundDetails.status = 'completed';
  this.refundDetails.processedAt = new Date();
  
  await this.save();
  return this;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(userId, userType = 'payer') {
  const matchQuery = userType === 'payer' ? { payer: userId } : { payee: userId };
  
  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = { count: stat.count, totalAmount: stat.totalAmount };
    return acc;
  }, {});
};

// Static method to get revenue analytics
paymentSchema.statics.getRevenueAnalytics = async function(startDate, endDate) => {
  const matchQuery = {
    paymentStatus: 'completed',
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  const analytics = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransactionValue: { $avg: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
  
  return analytics;
};

module.exports = mongoose.model('Payment', paymentSchema);
