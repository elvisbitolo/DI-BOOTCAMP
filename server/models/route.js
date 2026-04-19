const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  userId: String,
  from: String,
  to: String,
  price: Number,
  paid: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Route", routeSchema);