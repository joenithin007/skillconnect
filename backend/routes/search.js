const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.trim().length < 2) return res.json({ users:[], projects:[], announcements:[] });
    const regex = new RegExp(q, 'i');
    const [users, projects, announcements] = await Promise.all([
      User.find({ $or:[{name:regex},{department:regex},{skills:{$elemMatch:{$regex:q,$options:'i'}}}] }).select('name role department year designation skills').limit(8),
      Project.find({ $or:[{title:regex},{description:regex},{skillsRequired:{$elemMatch:{$regex:q,$options:'i'}}}] }).populate('faculty','name').limit(8),
      Announcement.find({ $or:[{title:regex},{content:regex}] }).limit(5),
    ]);
    res.json({ users, projects, announcements });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
