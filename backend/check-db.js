const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- Database Users ---');
    const users = await User.find({});
    users.forEach(u => {
      console.log(`Email: ${u.email}, Role: ${u.role}, Active: ${u.isActive}, Verified: ${u.email_verified}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkUsers();
