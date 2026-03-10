const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');
const { protect } = require('../middleware/auth');

// Get MY achievements
router.get('/my', protect, async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id }).sort('-createdAt');
    res.json(achievements);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get achievements by user ID (visible to all logged-in users)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.params.userId }).sort('-createdAt');
    res.json(achievements);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add achievement
router.post('/', protect, async (req, res) => {
  try {
    const { title, type, issuer, description, skills, date, url, imageBase64 } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const achievement = await Achievement.create({
      user: req.user._id, title, type, issuer, description,
      skills: skills || [], date, url, imageBase64
    });
    res.status(201).json(achievement);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update achievement
router.put('/:id', protect, async (req, res) => {
  try {
    const achievement = await Achievement.findOne({ _id: req.params.id, user: req.user._id });
    if (!achievement) return res.status(404).json({ message: 'Not found' });
    const fields = ['title','type','issuer','description','skills','date','url','imageBase64'];
    fields.forEach(f => { if (req.body[f] !== undefined) achievement[f] = req.body[f]; });
    await achievement.save();
    res.json(achievement);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete achievement
router.delete('/:id', protect, async (req, res) => {
  try {
    await Achievement.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
