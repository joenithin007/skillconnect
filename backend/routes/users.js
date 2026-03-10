const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get current user profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'department', 'year', 'skills', 'github', 'portfolio', 'bio', 'gpa', 'designation', 'expertise', 'researchInterests', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all students (staff/admin only)
router.get('/students', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true }).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all faculty
router.get('/faculty', protect, async (req, res) => {
  try {
    const faculty = await User.find({ role: 'staff', isActive: true }).select('-password');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
