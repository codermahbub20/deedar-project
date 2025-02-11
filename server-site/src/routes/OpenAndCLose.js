const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Restaurant model (simplified)
const Restaurant = mongoose.model("Restauranttime", new mongoose.Schema({
  isOpen: { type: Boolean, default: true },
  NewopeningTime: { type: String, default: "08:00" },  // 24-hour format
  NewclosingTime: { type: String, default: "22:00" },  // 24-hour format
  today: { type: Date, default: Date.now }
}));

// Endpoint to update restaurant status
router.post("/api/restaurant/status", async (req, res) => {
  try {
    const { isOpen, NewopeningTime, NewclosingTime } = req.body;
    
    // Validate time format (optional but recommended for strict validation)
    if (!/^\d{2}:\d{2}$/.test(NewopeningTime) || !/^\d{2}:\d{2}$/.test(NewclosingTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:mm." });
    }

    // Update 'today' field to the current date when setting the opening/closing time
    const today = new Date();

    const restaurant = await Restaurant.findOneAndUpdate(
      {},
      { isOpen, NewopeningTime, NewclosingTime, today },
      { new: true, upsert: true }
    );

    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant status." });
  }
});

// Endpoint to get the current restaurant status
router.get("/api/restaurant/status", async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant status not found." });
    }
    res.status(200).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant status." });
  }
});

module.exports = router;
