const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const { protect } = require('../middleware/auth');

// Send friend request
router.post('/request', protect, async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (receiverId === req.user._id.toString()) return res.status(400).json({ message: 'Cannot send request to yourself' });
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: req.user._id, receiver: receiverId },
        { sender: receiverId, receiver: req.user._id }
      ]
    });
    if (existing) return res.status(400).json({ message: 'Request already exists', status: existing.status });
    const fr = await FriendRequest.create({ sender: req.user._id, receiver: receiverId });
    res.status(201).json(fr);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my friends and requests
router.get('/my', protect, async (req, res) => {
  try {
    const me = req.user._id;
    const all = await FriendRequest.find({
      $or: [{ sender: me }, { receiver: me }]
    }).populate('sender', 'name role department year designation')
      .populate('receiver', 'name role department year designation');
    res.json(all);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get status between me and another user
router.get('/status/:userId', protect, async (req, res) => {
  try {
    const me = req.user._id;
    const other = req.params.userId;
    const fr = await FriendRequest.findOne({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me }
      ]
    });
    if (!fr) return res.json({ status: 'none' });
    res.json({
      status: fr.status,
      direction: fr.sender.toString() === me.toString() ? 'sent' : 'received',
      id: fr._id
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Accept / reject request
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const fr = await FriendRequest.findById(req.params.id);
    if (!fr) return res.status(404).json({ message: 'Not found' });
    if (fr.receiver.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    fr.status = status;
    await fr.save();
    res.json(fr);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove / cancel request
router.delete('/:id', protect, async (req, res) => {
  try {
    const fr = await FriendRequest.findById(req.params.id);
    if (!fr) return res.status(404).json({ message: 'Not found' });
    if (fr.sender.toString() !== req.user._id.toString() && fr.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await fr.deleteOne();
    res.json({ message: 'Removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
