const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const email = process.env.ADMIN_EMAIL || 'admin@activesetu.com';
const password = process.env.ADMIN_PASSWORD || 'admin123';

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    let user = await User.findOne({ email });
    if (user) {
      user.password = password;
      user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log(`Reset admin account: ${email}`);
    } else {
      user = await User.create({
        name: 'Admin User',
        email,
        password,
        phone: '9999999999',
        role: 'admin',
        isActive: true
      });
      console.log(`Created admin account: ${email}`);
    }
  } catch (error) {
    console.error('Unable to reset admin account:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

resetAdmin();
