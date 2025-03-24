const express = require('express');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'Authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Create Event
router.post('/create', authMiddleware, async (req, res) => {
  const { name, description, date, category, reminder } = req.body;
  const event = new Event({ name, description, date, category, reminder, user: req.user });
  await event.save();
  res.status(201).json(event);
});

// Get Events
router.get('/upcoming', authMiddleware, async (req, res) => {
  const events = await Event.find({ user: req.user })
    .sort({ date: 1 })
    .exec();
  res.json(events);
});

module.exports = router;
