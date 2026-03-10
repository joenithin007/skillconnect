const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Request = require('../models/Request');
const { protect, authorize } = require('../middleware/auth');

// Admin dashboard stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalStaff, totalProjects, totalRequests, openProjects, pendingRequests] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' }),
      Project.countDocuments(),
      Request.countDocuments(),
      Project.countDocuments({ status: 'open' }),
      Request.countDocuments({ status: 'pending' })
    ]);
    res.json({ totalUsers, totalStudents, totalStaff, totalProjects, totalRequests, openProjects, pendingRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle user active status
router.put('/users/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all projects (admin)
router.get('/projects', protect, authorize('admin'), async (req, res) => {
  try {
    const projects = await Project.find().populate('faculty', 'name department').sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user (admin)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
