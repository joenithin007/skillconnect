const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  skillMatchScore: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  facultyNote: String,
  createdAt: { type: Date, default: Date.now }
});

// One request per student per project
RequestSchema.index({ project: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Request', RequestSchema);
