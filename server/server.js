const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("../client"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB error:", err));

app.use("/auth", require("./routes/auth"));
app.use("/predict", require("./routes/predict"));

app.get("/", (req, res) => {
  res.send("SmartFare API running");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});