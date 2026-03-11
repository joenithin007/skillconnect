const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

// Get all announcements (everyone)
router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name role')
      .sort({ pinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create announcement (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, content, type, pinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content required' });
    const announcement = await Announcement.create({
      title, content, type, pinned: pinned || false, postedBy: req.user._id
    });
    const populated = await Announcement.findById(announcement._id).populate('postedBy', 'name role');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update announcement (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Not found' });
    const fields = ['title', 'content', 'type', 'pinned'];
    fields.forEach(f => { if (req.body[f] !== undefined) announcement[f] = req.body[f]; });
    await announcement.save();
    res.json(announcement);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete announcement (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
