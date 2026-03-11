const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  description:      { type: String, required: true },
  requiredSkills:   [String],
  tags:             [String],
  duration:         String,
  stipend:          String,
  prerequisites:    String,
  maxStudents:      { type: Number, default: 5 },
  status:           { type: String, enum: ['open','closed'], default: 'open' },
  // Can be posted by staff OR student
  faculty:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedByRole:     { type: String, enum: ['staff','student'], default: 'staff' },
  acceptedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Staff can invite students directly
  invitedStudents:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
module.exports = mongoose.model('Project', ProjectSchema);
