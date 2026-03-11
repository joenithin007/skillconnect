const mongoose = require('mongoose');
const AnnouncementSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  type:     { type: String, enum: ['general','event','hackathon','deadline','urgent'], default: 'general' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pinned:   { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Announcement', AnnouncementSchema);
