const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  balance: { type: Number, default: 5000 } // starting M-Pesa balance
});

module.exports = mongoose.model("User", userSchema);