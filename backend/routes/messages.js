const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all conversations (list of people I chatted with)
router.get('/conversations', protect, async (req, res) => {
  try {
    const me = req.user._id;
    const msgs = await Message.find({ $or: [{ sender: me }, { receiver: me }] })
      .sort('-createdAt')
      .populate('sender', 'name role department')
      .populate('receiver', 'name role department');

    // Build unique conversation list
    const seen = {};
    msgs.forEach(m => {
      const other = m.sender._id.toString() === me.toString() ? m.receiver : m.sender;
      const oid = other._id.toString();
      if (!seen[oid]) {
        seen[oid] = {
          user: other,
          lastMessage: m.text,
          lastTime: m.createdAt,
          unread: (!m.read && m.receiver._id.toString() === me.toString()) ? 1 : 0,
        };
      } else if (!m.read && m.receiver._id.toString() === me.toString()) {
        seen[oid].unread++;
      }
    });
    res.json(Object.values(seen));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get messages between me and another user
router.get('/:userId', protect, async (req, res) => {
  try {
    const me = req.user._id;
    const other = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me }
      ]
    }).sort('createdAt').populate('sender', 'name role');

    // Mark as read
    await Message.updateMany({ sender: other, receiver: me, read: false }, { read: true });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });
    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'User not found' });
    const message = await Message.create({ sender: req.user._id, receiver: receiverId, text: text.trim() });
    const populated = await Message.findById(message._id).populate('sender', 'name role');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Unread count
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiver: req.user._id, read: false });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
