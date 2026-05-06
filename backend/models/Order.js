const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Delivery details
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true // [longitude, latitude]
      }
    }
  },
  deliveryLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true // [longitude, latitude]
      }
    }
  },
  // Package details
  packageDescription: {
    type: String,
    required: true,
    maxlength: [500, 'Package description cannot exceed 500 characters']
  },
  packageWeight: {
    type: Number,
    required: true,
    min: [0.1, 'Package weight must be at least 0.1 kg'],
    max: [100, 'Package weight cannot exceed 100 kg']
  },
  packageDimensions: {
    length: {
      type: Number,
      required: true,
      min: [1, 'Length must be at least 1 cm']
    },
    width: {
      type: Number,
      required: true,
      min: [1, 'Width must be at least 1 cm']
    },
    height: {
      type: Number,
      required: true,
      min: [1, 'Height must be at least 1 cm']
    }
  },
  packageImages: [{
    type: String,
    required: false
  }],
  // Pricing
  deliveryFee: {
    type: Number,
    required: true,
    min: [50, 'Delivery fee must be at least KES 50']
  },
  currency: {
    type: String,
    default: 'KES'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mpesa', 'card'],
    default: 'cash'
  },
  // Time tracking
  orderTime: {
    type: Date,
    default: Date.now
  },
  acceptedTime: {
    type: Date,
    default: null
  },
  pickupTime: {
    type: Date,
    default: null
  },
  deliveryTime: {
    type: Date,
    default: null
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  // Special instructions
  specialInstructions: {
    type: String,
    maxlength: [300, 'Special instructions cannot exceed 300 characters']
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'standard', 'high', 'urgent'],
    default: 'standard'
  },
  // Distance
  distance: {
    type: Number,
    required: true // in kilometers
  },
  // Tracking
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Cancellation details
  cancellationReason: {
    type: String,
    maxlength: [300, 'Cancellation reason cannot exceed 300 characters']
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Notes
  sellerNotes: {
    type: String,
    maxlength: [500, 'Seller notes cannot exceed 500 characters']
  },
  riderNotes: {
    type: String,
    maxlength: [500, 'Rider notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
orderSchema.index({ seller: 1 });
orderSchema.index({ rider: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderTime: -1 });
orderSchema.index({ pickupLocation: '2dsphere' });
orderSchema.index({ deliveryLocation: '2dsphere' });
orderSchema.index({ priority: 1 });
orderSchema.index({ distance: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const Order = this.constructor;
    const count = await Order.countDocuments();
    this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Pre-save middleware to generate tracking number when order is accepted
orderSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'accepted' && !this.trackingNumber) {
    const crypto = require('crypto');
    this.trackingNumber = `TRK${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  next();
});

// Virtual for calculating estimated delivery time based on distance
orderSchema.virtual('estimatedDeliveryMinutes').get(function() {
  const baseTime = 30; // 30 minutes base time
  const timePerKm = 5; // 5 minutes per kilometer
  return Math.round(baseTime + (this.distance * timePerKm));
});

// Method to accept order
orderSchema.methods.acceptOrder = async function(riderId) {
  this.rider = riderId;
  this.status = 'accepted';
  this.acceptedTime = Date.now();
  this.estimatedDeliveryTime = new Date(Date.now() + this.estimatedDeliveryMinutes * 60 * 1000);
  await this.save();
};

// Method to update status
orderSchema.methods.updateStatus = async function(newStatus, notes = '') {
  const validTransitions = {
    'pending': ['accepted', 'cancelled'],
    'accepted': ['picked_up', 'cancelled'],
    'picked_up': ['in_transit', 'cancelled'],
    'in_transit': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  
  switch (newStatus) {
    case 'picked_up':
      this.pickupTime = Date.now();
      break;
    case 'delivered':
      this.deliveryTime = Date.now();
      this.paymentStatus = 'paid';
      break;
  }

  if (notes) {
    this.riderNotes = notes;
  }

  await this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = async function(cancelledBy, reason = '') {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.paymentStatus = 'refunded';
  await this.save();
};

// Static method to find available orders for riders
orderSchema.statics.findAvailableOrders = function(riderLocation, maxDistance = 10) {
  return this.find({
    status: 'pending',
    'pickupLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: riderLocation
        },
        $maxDistance: maxDistance * 1000 // Convert to meters
      }
    }
  }).populate('seller', 'name phone businessName businessLocation');
};

module.exports = mongoose.model('Order', orderSchema);
