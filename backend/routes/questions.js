const express = require('express');
const router  = express.Router();
const Question   = require('../models/Question');
const Notification = require('../models/Notification');
const Project    = require('../models/Project');
const { protect } = require('../middleware/auth');

// Get questions for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const questions = await Question.find({ project: req.params.projectId })
      .populate('askedBy', 'name role department year')
      .populate('answers.answeredBy', 'name role designation')
      .sort('-createdAt');
    res.json(questions);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Ask a question
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, question } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: 'Question cannot be empty' });
    const project = await Project.findById(projectId).populate('faculty','name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const q = await Question.create({ project: projectId, askedBy: req.user._id, question: question.trim() });
    // Notify faculty
    await Notification.create({
      user: project.faculty._id,
      message: `${req.user.name} asked a question on "${project.title}"`,
      type: 'general',
      relatedId: projectId,
      link: `/projects/${projectId}`
    });
    const populated = await Question.findById(q._id).populate('askedBy','name role department year');
    res.status(201).json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

// Answer a question
router.post('/:id/answer', protect, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) return res.status(400).json({ message: 'Answer cannot be empty' });
    const q = await Question.findById(req.params.id).populate('askedBy','name');
    if (!q) return res.status(404).json({ message: 'Question not found' });
    q.answers.push({ answeredBy: req.user._id, answer: answer.trim() });
    await q.save();
    // Notify question asker
    await Notification.create({
      user: q.askedBy._id,
      message: `${req.user.name} answered your question`,
      type: 'general',
      relatedId: q.project.toString(),
      link: `/projects/${q.project}`
    });
    const populated = await Question.findById(q._id)
      .populate('askedBy','name role department year')
      .populate('answers.answeredBy','name role designation');
    res.json(populated);
  } catch(err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
