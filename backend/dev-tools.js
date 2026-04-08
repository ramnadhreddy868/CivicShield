const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

// Define all commands
const commands = {
  'create-admin': createAdmin,
  'reset-password': resetPassword,
  'change-role': changeRole,
  'list-users': listUsers,
  'find-user': findUser,
  'delete-user': deleteUser,
  'activate-user': activateUser,
  'deactivate-user': deactivateUser
};

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civik_shield');
}

// ✅ CREATE ADMIN
async function createAdmin(email, password, name = 'Admin User') {
  if (!email || !password) {
    console.log('❌ Email and password required');
    return;
  }
  if (password.length < 6) {
    console.log('❌ Password must be at least 6 characters');
    return;
  }

  console.log('📝 Creating admin account...');
  try {
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      role: 'admin'
    });
    await user.save();
    console.log('✅ Admin created successfully!\n');
    console.log('📋 Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ${password}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// 🔑 RESET PASSWORD
async function resetPassword(email, newPassword) {
  if (!email || !newPassword) {
    console.log('❌ Email and password required');
    return;
  }
  if (newPassword.length < 6) {
    console.log('❌ Password must be at least 6 characters');
    return;
  }

  console.log('🔑 Resetting password...');
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }
    user.password = newPassword;
    await user.save();
    console.log('✅ Password reset successfully!\n');
    console.log('📋 Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   New Password: ${newPassword}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// 👤 CHANGE ROLE
async function changeRole(email, role) {
  if (!email || !role) {
    console.log('❌ Email and role required');
    return;
  }
  if (!['citizen', 'admin'].includes(role)) {
    console.log(`❌ Invalid role. Use: citizen or admin`);
    return;
  }

  console.log('👤 Changing role...');
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role },
      { new: true }
    );
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }
    console.log('✅ Role changed successfully!\n');
    console.log('📋 Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   New Role: ${user.role}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// 📋 LIST ALL USERS
async function listUsers() {
  console.log('📋 All Users in System:\n');
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('   (No users found)\n');
      return;
    }

    console.log('─'.repeat(80));
    console.log('EMAIL                      NAME                   ROLE      ACTIVE');
    console.log('─'.repeat(80));
    
    users.forEach(u => {
      const email = u.email.padEnd(26);
      const name = (u.name || 'N/A').substring(0, 20).padEnd(22);
      const role = u.role.padEnd(9);
      const active = u.isActive ? '✅ Yes' : '❌ No';
      console.log(`${email} ${name} ${role} ${active}`);
    });
    
    console.log('─'.repeat(80));
    console.log(`\nTotal Users: ${users.length}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// 🔍 FIND SPECIFIC USER
async function findUser(email) {
  if (!email) {
    console.log('❌ Email required');
    return;
  }

  console.log('🔍 Finding user...\n');
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('-password');
    
    if (!user) {
      console.log(`❌ User not found: ${email}\n`);
      return;
    }

    console.log('📋 User Details:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Phone: ${user.phone || '(not set)'}`);
    console.log(`   Active: ${user.isActive ? '✅ Yes' : '❌ No'}`);
    console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
    console.log(`   Updated: ${new Date(user.updatedAt).toLocaleString()}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// 🗑️ DELETE USER
async function deleteUser(email) {
  if (!email) {
    console.log('❌ Email required');
    return;
  }

  console.log('🗑️  Deleting user...');
  try {
    const result = await User.deleteOne({ email: email.toLowerCase() });
    
    if (result.deletedCount === 0) {
      console.log(`❌ User not found: ${email}\n`);
      return;
    }

    console.log('✅ User deleted successfully!\n');
    console.log(`   Email: ${email}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// ✅ ACTIVATE USER
async function activateUser(email) {
  if (!email) {
    console.log('❌ Email required');
    return;
  }

  console.log('✅ Activating user...');
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: true },
      { new: true }
    );
    
    if (!user) {
      console.log(`❌ User not found: ${email}\n`);
      return;
    }

    console.log('✅ User activated successfully!\n');
    console.log(`   Email: ${user.email}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// ❌ DEACTIVATE USER
async function deactivateUser(email) {
  if (!email) {
    console.log('❌ Email required');
    return;
  }

  console.log('❌ Deactivating user...');
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: false },
      { new: true }
    );
    
    if (!user) {
      console.log(`❌ User not found: ${email}\n`);
      return;
    }

    console.log('✅ User deactivated successfully!\n');
    console.log(`   Email: ${user.email}\n`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// Print help
function printHelp() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   🛠️  DEVELOPER TOOLS - User & Admin Management                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('📍 AVAILABLE COMMANDS:\n');

  console.log('1️⃣  CREATE ADMIN');
  console.log('   node dev-tools.js create-admin <email> <password> [name]');
  console.log('   Example: node dev-tools.js create-admin admin@example.com secret123 "Admin User"\n');

  console.log('2️⃣  RESET PASSWORD');
  console.log('   node dev-tools.js reset-password <email> <newpassword>');
  console.log('   Example: node dev-tools.js reset-password user@example.com newpass123\n');

  console.log('3️⃣  CHANGE ROLE');
  console.log('   node dev-tools.js change-role <email> <role>');
  console.log('   Example: node dev-tools.js change-role user@example.com admin\n');

  console.log('4️⃣  LIST ALL USERS');
  console.log('   node dev-tools.js list-users\n');

  console.log('5️⃣  FIND USER');
  console.log('   node dev-tools.js find-user <email>');
  console.log('   Example: node dev-tools.js find-user admin@example.com\n');

  console.log('6️⃣  DELETE USER');
  console.log('   node dev-tools.js delete-user <email>');
  console.log('   Example: node dev-tools.js delete-user olduser@example.com\n');

  console.log('7️⃣  ACTIVATE USER');
  console.log('   node dev-tools.js activate-user <email>');
  console.log('   Example: node dev-tools.js activate-user user@example.com\n');

  console.log('8️⃣  DEACTIVATE USER');
  console.log('   node dev-tools.js deactivate-user <email>');
  console.log('   Example: node dev-tools.js deactivate-user user@example.com\n');

  console.log('─'.repeat(68) + '\n');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = args.slice(1);

  if (!command || !commands[command]) {
    printHelp();
    process.exit(1);
  }

  try {
    await connectDB();
    await commands[command](...params);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

main();
