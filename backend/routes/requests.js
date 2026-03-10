const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Skill match algorithm
const calcSkillMatch = (studentSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;
  if (!studentSkills || studentSkills.length === 0) return 0;
  const sLower = studentSkills.map(s => s.toLowerCase());
  const rLower = requiredSkills.map(s => s.toLowerCase());
  const matched = rLower.filter(skill => sLower.some(ss => ss.includes(skill) || skill.includes(ss)));
  return Math.round((matched.length / rLower.length) * 100);
};

// Send join request (student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { projectId, message } = req.body;
    const project = await Project.findById(projectId).populate('faculty');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ message: 'Project is closed' });
    if (project.acceptedStudents.length >= project.maxStudents) {
      return res.status(400).json({ message: 'Project is full' });
    }

    const existing = await Request.findOne({ project: projectId, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already applied to this project' });

    const skillMatchScore = calcSkillMatch(req.user.skills, project.requiredSkills);
    const request = await Request.create({
      project: projectId, student: req.user._id,
      faculty: project.faculty._id, message, skillMatchScore
    });

    // Notify faculty
    await Notification.create({
      user: project.faculty._id,
      title: 'New Join Request',
      message: `${req.user.name} applied to "${project.title}" (${skillMatchScore}% skill match)`,
      type: 'request_received',
      link: `/requests/${request._id}`
    });

    res.status(201).json({ ...request.toObject(), skillMatchScore });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already applied to this project' });
    res.status(500).json({ message: err.message });
  }
});

// Get requests for current user
router.get('/my', protect, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'student') {
      requests = await Request.find({ student: req.user._id })
        .populate('project', 'title description requiredSkills tags status')
        .populate('faculty', 'name department designation')
        .sort('-createdAt');
    } else {
      requests = await Request.find({ faculty: req.user._id })
        .populate('project', 'title description requiredSkills')
        .populate('student', 'name email department year skills github portfolio bio gpa')
        .sort('-createdAt');
    }
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get requests for a specific project (faculty)
router.get('/project/:projectId', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const requests = await Request.find({ project: req.params.projectId })
      .populate('student', 'name email department year skills github portfolio bio gpa')
      .sort('-skillMatchScore');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept or reject request (faculty)
router.put('/:id', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { status, facultyNote } = req.body;
    const request = await Request.findById(req.params.id).populate('project').populate('student');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status === 'accepted') {
      const project = await Project.findById(request.project._id);
      if (project.acceptedStudents.length >= project.maxStudents) {
        return res.status(400).json({ message: 'Project is full' });
      }
      project.acceptedStudents.push(request.student._id);
      if (project.acceptedStudents.length >= project.maxStudents) project.status = 'closed';
      await project.save();
    }

    request.status = status;
    if (facultyNote) request.facultyNote = facultyNote;
    await request.save();

    // Notify student
    await Notification.create({
      user: request.student._id,
      title: status === 'accepted' ? '🎉 Request Accepted!' : 'Request Update',
      message: status === 'accepted'
        ? `Your request for "${request.project.title}" was accepted! Welcome to the team.`
        : `Your request for "${request.project.title}" was not accepted. ${facultyNote || ''}`,
      type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
      link: `/projects/${request.project._id}`
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
