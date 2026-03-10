const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['certificate', 'project', 'internship', 'publication', 'award', 'course', 'other'],
    default: 'certificate'
  },
  issuer: String,
  description: String,
  skills: [String],
  date: String,
  url: String,
  imageBase64: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
