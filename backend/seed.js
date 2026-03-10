// Production Admin Seeder for SIST SkillConnect
// Run this ONCE to create the admin account
// node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillconnect';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const User = require('./models/User');

  // Only create admin if doesn't exist
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) {
    console.log('Admin already exists:', adminExists.email);
    console.log('Skipping seed.');
    process.exit(0);
  }

  // Create admin account
  const admin = await User.create({
    name: 'SIST Admin',
    email: 'admin@sathyabama.ac.in',
    password: await bcrypt.hash('SISTAdmin@2026', 10),
    role: 'admin',
    department: 'Administration',
    isActive: true
  });

  console.log('\n✅ Admin account created!');
  console.log('Email:    admin@sathyabama.ac.in');
  console.log('Password: SISTAdmin@2026');
  console.log('\n⚠️  IMPORTANT: Change this password after first login!');
  console.log('\nReal students and faculty can now register at your app URL.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
