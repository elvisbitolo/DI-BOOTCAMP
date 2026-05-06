const mongoose = require('mongoose');

const locationTrackingSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  locations: [{
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
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    speed: {
      type: Number,
      default: 0 // in km/h
    },
    heading: {
      type: Number,
      default: 0 // in degrees
    },
    accuracy: {
      type: Number,
      default: 10 // in meters
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  totalDistance: {
    type: Number,
    default: 0 // in meters
  },
  estimatedArrival: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
locationTrackingSchema.index({ rider: 1 });
locationTrackingSchema.index({ order: 1 });
locationTrackingSchema.index({ 'locations.timestamp': -1 });
locationTrackingSchema.index({ isActive: 1 });

// Method to add new location point
locationTrackingSchema.methods.addLocation = function(coordinates, speed = 0, heading = 0, accuracy = 10) {
  const newLocation = {
    coordinates: {
      type: 'Point',
      coordinates
    },
    timestamp: new Date(),
    speed,
    heading,
    accuracy
  };

  // Calculate distance from last location
  if (this.locations.length > 0) {
    const lastLocation = this.locations[this.locations.length - 1];
    const distance = this.calculateDistance(
      lastLocation.coordinates.coordinates,
      coordinates
    );
    this.totalDistance += distance;
  }

  this.locations.push(newLocation);
  
  // Update estimated arrival time
  this.updateEstimatedArrival();
  
  return this.save();
};

// Method to calculate distance between two points (Haversine formula)
locationTrackingSchema.methods.calculateDistance = function(coord1, coord2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1[1] * Math.PI / 180; // φ, λ in radians
  const φ2 = coord2[1] * Math.PI / 180;
  const Δφ = (coord2[1] - coord1[1]) * Math.PI / 180;
  const Δλ = (coord2[0] - coord1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in meters
};

// Method to update estimated arrival time
locationTrackingSchema.methods.updateEstimatedArrival = function() {
  if (this.locations.length < 2) return;

  const recentLocations = this.locations.slice(-5); // Last 5 locations
  let avgSpeed = 0;
  
  for (let i = 1; i < recentLocations.length; i++) {
    const timeDiff = recentLocations[i].timestamp - recentLocations[i-1].timestamp;
    const distance = this.calculateDistance(
      recentLocations[i-1].coordinates.coordinates,
      recentLocations[i].coordinates.coordinates
    );
    const speed = distance / (timeDiff / 1000) * 3.6; // Convert to km/h
    avgSpeed += speed;
  }
  
  avgSpeed = avgSpeed / (recentLocations.length - 1);
  
  if (avgSpeed > 0) {
    // Get remaining distance (this would need to be calculated from order data)
    const remainingDistance = 5000; // Placeholder - should be calculated
    const timeToArrival = (remainingDistance / 1000) / avgSpeed * 60 * 60 * 1000; // in milliseconds
    this.estimatedArrival = new Date(Date.now() + timeToArrival);
  }
};

// Method to end tracking
locationTrackingSchema.methods.endTracking = function() {
  this.isActive = false;
  this.endedAt = new Date();
  return this.save();
};

// Static method to get active tracking for rider
locationTrackingSchema.statics.getActiveTracking = function(riderId) {
  return this.findOne({ rider: riderId, isActive: true })
    .populate('order', 'orderNumber status pickupLocation deliveryLocation');
};

// Static method to get tracking history for order
locationTrackingSchema.statics.getOrderTracking = function(orderId) {
  return this.findOne({ order: orderId })
    .populate('rider', 'name vehicleType')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('LocationTracking', locationTrackingSchema);
