const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function changeRole(email, newRole) {
  try {
    // Validate inputs
    if (!email || !newRole) {
      console.log('❌ Error: Email and role required');
      console.log('Usage: node change-role.js <email> <role>');
      console.log('Roles: citizen, admin');
      process.exit(1);
    }

    if (!['citizen', 'admin'].includes(newRole)) {
      console.log(`❌ Error: Invalid role "${newRole}"`);
      console.log('Allowed roles: citizen, admin');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civik_shield');
    console.log('✅ Connected to database\n');

    // Find and update user
    console.log(`🔍 Finding user: ${email}`);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: newRole },
      { new: true }
    );

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log('\n✅ Role changed successfully!\n');
    console.log('📋 User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}\n`);

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const role = process.argv[3];

changeRole(email, role);
