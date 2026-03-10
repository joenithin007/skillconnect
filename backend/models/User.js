const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },

  // Student fields
  department: String,
  year: { type: String, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  skills: [String],
  github: String,
  portfolio: String,
  bio: String,
  gpa: { type: Number, min: 0, max: 10 },

  // Staff fields
  designation: String,
  expertise: [String],
  researchInterests: [String],

  avatar: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
