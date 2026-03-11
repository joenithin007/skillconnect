const express = require('express');
const router  = express.Router();
const Project = require('../models/Project');
const User    = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// GET all projects (with optional filters)
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.postedByRole) filter.postedByRole = req.query.postedByRole;
    const projects = await Project.find(filter)
      .populate('faculty', 'name department designation')
      .populate('postedBy', 'name department year role')
      .populate('acceptedStudents', 'name department year')
      .sort('-createdAt');
    res.json(projects);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET my projects (staff) or projects I'm in (student)
router.get('/my', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      projects = await Project.find({ faculty: req.user._id })
        .populate('acceptedStudents','name department year')
        .sort('-createdAt');
    } else {
      projects = await Project.find({ postedBy: req.user._id })
        .populate('faculty','name department designation')
        .sort('-createdAt');
    }
    res.json(projects);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET projects by user id
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    let projects;
    if (user?.role === 'staff') {
      projects = await Project.find({ faculty: req.params.userId }).sort('-createdAt');
    } else {
      projects = await Project.find({ acceptedStudents: req.params.userId })
        .populate('faculty','name').sort('-createdAt');
    }
    res.json(projects);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// GET single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('faculty','name department designation email')
      .populate('postedBy','name department year role')
      .populate('acceptedStudents','name department year skills')
      .populate('invitedStudents','name department year');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST create project (staff or student)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, requiredSkills, tags, duration, stipend, prerequisites, maxStudents } = req.body;
    const isStaff = req.user.role === 'staff' || req.user.role === 'admin';
    const project = await Project.create({
      title, description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills||'').split(',').map(s=>s.trim()).filter(Boolean),
      tags: Array.isArray(tags) ? tags : (tags||'').split(',').map(s=>s.trim()).filter(Boolean),
      duration, stipend, prerequisites,
      maxStudents: Number(maxStudents)||5,
      faculty:      isStaff ? req.user._id : null,
      postedBy:     req.user._id,
      postedByRole: isStaff ? 'staff' : 'student',
    });
    res.status(201).json(project);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// PUT update project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    const isOwner = project.faculty?.toString()===req.user._id.toString() || project.postedBy?.toString()===req.user._id.toString();
    if (!isOwner && req.user.role!=='admin') return res.status(403).json({ message: 'Not authorized' });
    const fields = ['title','description','requiredSkills','tags','duration','stipend','prerequisites','maxStudents','status'];
    fields.forEach(f => { if (req.body[f] !== undefined) project[f] = req.body[f]; });
    await project.save();
    res.json(project);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// DELETE project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    const isOwner = project.faculty?.toString()===req.user._id.toString() || project.postedBy?.toString()===req.user._id.toString();
    if (!isOwner && req.user.role!=='admin') return res.status(403).json({ message: 'Not authorized' });
    await project.deleteOne();
    res.json({ message: 'Deleted' });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// POST invite student to project (staff only)
router.post('/:id/invite', protect, authorize('staff','admin'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.faculty?.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (!project.invitedStudents.includes(studentId)) {
      project.invitedStudents.push(studentId);
      await project.save();
    }
    const student = await User.findById(studentId);
    await Notification.create({
      user: studentId,
      message: `${req.user.name} invited you to join "${project.title}"!`,
      type: 'general',
      relatedId: project._id.toString(),
      link: `/projects/${project._id}`
    });
    res.json({ message: `Invited ${student.name}` });
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
