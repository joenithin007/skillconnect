const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requiredSkills: [String],
  tags: [String],
  maxStudents: { type: Number, default: 5 },
  acceptedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  duration: String,
  stipend: String,
  prerequisites: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
