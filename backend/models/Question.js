const mongoose = require('mongoose');
const QuestionSchema = new mongoose.Schema({
  project:  { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  askedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  answers:  [{
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer:     { type: String },
    createdAt:  { type: Date, default: Date.now }
  }],
}, { timestamps: true });
module.exports = mongoose.model('Question', QuestionSchema);
