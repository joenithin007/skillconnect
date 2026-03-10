const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Request = require('../models/Request');
const { protect, authorize } = require('../middleware/auth');

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    const projects = await Project.find(query).populate('faculty', 'name department designation').sort('-createdAt');
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get MY projects (faculty/staff)
router.get('/my', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const projects = await Project.find({ faculty: req.user._id })
      .populate('acceptedStudents', 'name department year skills')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get projects by any user ID (for profile view)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const projects = await Project.find({ faculty: req.params.userId })
      .populate('faculty', 'name department designation')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('faculty', 'name department designation expertise')
      .populate('acceptedStudents', 'name department year skills');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create project (staff only)
router.post('/', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { title, description, requiredSkills, tags, duration, stipend, prerequisites, maxStudents } = req.body;
    const project = await Project.create({ title, description, requiredSkills, tags, duration, stipend, prerequisites, maxStudents, faculty: req.user._id });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update project
router.put('/:id', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const allowed = ['title','description','requiredSkills','tags','status','duration','stipend','prerequisites','maxStudents'];
    allowed.forEach(f => { if (req.body[f] !== undefined) project[f] = req.body[f]; });
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete project
router.delete('/:id', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await project.deleteOne();
    await Request.deleteMany({ project: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
