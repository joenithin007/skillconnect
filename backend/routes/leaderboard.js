const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const Request = require('../models/Request');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const students = await User.find({ role:'student' }).select('name department year skills');
    const achievements = await Achievement.find();
    const requests = await Request.find({ status:'accepted' });

    const achMap = {};
    achievements.forEach(a => {
      if (!achMap[a.user]) achMap[a.user] = 0;
      achMap[a.user]++;
    });

    const reqMap = {};
    requests.forEach(r => {
      if (!reqMap[r.student]) reqMap[r.student] = 0;
      reqMap[r.student]++;
    });

    const ranked = students.map(s => ({
      _id: s._id,
      name: s.name,
      department: s.department,
      year: s.year,
      skills: s.skills || [],
      achievements: achMap[s._id] || 0,
      projects: reqMap[s._id] || 0,
      score: ((achMap[s._id]||0) * 10) + ((reqMap[s._id]||0) * 20) + ((s.skills||[]).length * 2),
    })).sort((a,b) => b.score - a.score);

    res.json(ranked);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
