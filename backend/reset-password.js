const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

async function resetPassword(email, newPassword) {
  try {
    // Validate inputs
    if (!email || !newPassword) {
      console.log('❌ Error: Email and password required');
      console.log('Usage: node reset-password.js <email> <newpassword>');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('❌ Error: Password must be at least 6 characters');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civik_shield');
    console.log('✅ Connected to database\n');

    // Find user
    console.log(`🔍 Finding user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('Check the email and try again');
      process.exit(1);
    }

    // Hash and update password
    console.log('🔐 Updating password...');
    user.password = newPassword;
    await user.save();

    console.log('\n✅ Password reset successfully!\n');
    console.log('📋 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   New Password: ${newPassword}\n`);

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

resetPassword(email, password);
