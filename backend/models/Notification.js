const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['request_received', 'request_accepted', 'request_rejected', 'project_closed', 'general'], default: 'general' },
  read: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
