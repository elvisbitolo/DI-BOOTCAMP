const router = require("express").Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

/* ROUTE MODEL */
const Route = mongoose.models.Route || mongoose.model("Route", new mongoose.Schema({
  userId: String,
  from: String,
  to: String,
  price: Number,
  date: Date
}));

/* AUTH MIDDLEWARE */
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

/* SMART PRICE ENGINE (REALISTIC SIMULATION) */
function calculatePrice(from, to) {
  let base = 200;

  const hour = new Date().getHours();
  const day = new Date().getDay();

  // rush hour
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
    base *= 1.5;
  }

  // weekend surge
  if (day === 0 || day === 6) {
    base *= 1.2;
  }

  // randomness simulating distance + traffic
  const trafficFactor = Math.random() * 2 + 1;

  return Math.round(base * trafficFactor);
}

/* PREDICT ROUTE */
router.post("/pay", auth, async (req, res) => {
  const routeId = req.body.routeId;

  const route = await Route.findById(routeId);
  if (!route) return res.status(404).json({ error: "Route not found" });

  const User = mongoose.model("User");
  const user = await User.findById(req.user.id);

  if (user.balance < route.price) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  user.balance -= route.price;
  route.paid = true;

  await user.save();
  await route.save();

  router.get("/balance", auth, async (req, res) => {
  const User = mongoose.model("User");
  const user = await User.findById(req.user.id);

  res.json({ balance: user.balance });
});
});
/* HISTORY */
router.get("/history", auth, async (req, res) => {
  const data = await Route.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(data);
});

/* DRIVER BOOKING (SIMULATION) */
router.post("/book", auth, async (req, res) => {
  const drivers = [
    { name: "John Mwangi", car: "Toyota Axio", plate: "KDA 234X" },
    { name: "Peter Kimani", car: "Honda Fit", plate: "KDB 778L" },
    { name: "Amina Noor", car: "Nissan Note", plate: "KDC 889P" }
  ];

  const driver = drivers[Math.floor(Math.random() * drivers.length)];

  res.json({
    message: "Driver assigned successfully",
    driver,
    eta: "3–6 minutes"
  });
});

module.exports = router;