const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   String,
  message: { type: String, required: true },
  type:    { type: String, enum: ['request_received','new_request','request_accepted','request_rejected','project_closed','friend_request','message','announcement','general'], default: 'general' },
  read:    { type: Boolean, default: false },
  link:    String,
  relatedId: String,
}, { timestamps: true });
module.exports = mongoose.model('Notification', NotificationSchema);
