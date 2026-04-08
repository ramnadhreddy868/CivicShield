# 🔐 Admin Account & Password Management Guide

## Table of Contents
1. [Create Admin Accounts](#create-admin-accounts)
2. [Change/Reset Passwords](#changerest-passwords)
3. [Manage User Roles](#manage-user-roles)
4. [Development Tools](#development-tools)
5. [Database Direct Access](#database-direct-access)

---

## Create Admin Accounts

### Method 1: Via API (Easiest - Recommended)

#### Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@civicshield.com",
    "password": "admin123",
    "name": "System Administrator",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@civicshield.com",
    "name": "System Administrator",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-03-11T12:00:00.000Z"
  }
}
```

#### Using Node.js (create-admin.js):
```javascript
const http = require('http');

const adminData = {
  email: 'neadadmin@civicshield.com',
  password: 'securepassword123',
  name: 'New Admin User',
  role: 'admin',
  phone: '+1234567890'
};

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('✅ Admin Created:', response.user);
  });
});

req.write(JSON.stringify(adminData));
req.end();
```

#### Using Frontend (Direct Registration):
1. Go to http://localhost:5174/citizen-login
2. Click "Sign up"
3. Fill form with:
   - Email: `newadmin@example.com`
   - Password: `securepass123`
   - Name: `New Admin`
   - Phone: (optional)
4. **BUT** you'll get "citizen" role

**To make them admin:**
- Use MongoDB to change their role (see Database section)
- Or delete and recreate via API with `"role": "admin"`

---

### Method 2: Direct MongoDB Insert

#### If you have MongoDB access:

```javascript
// In MongoDB CLI (mongosh) or GUI:
db.users.insertOne({
  email: "admin2@civicshield.com",
  password: "$2a$10$ZIUhQ9z1.RVtNbvH7XYthu8JZ7lLn5CqZhVvyKhFt/sKF/t0j2Yvm", // bcrypt hash
  name: "Admin User 2",
  role: "admin",
  phone: "+1234567890",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  __v: 0
})
```

**Problem:** You need the bcrypt hash. Use Method 1 instead (easier).

#### Using MongoDB Compass (GUI):
1. Open MongoDB Compass
2. Connect to your database
3. Go to `civik_shield` → `users` collection
4. Click "Insert Document"
5. Paste this template:
```json
{
  "email": "admin@example.com",
  "password": "$2a$10$...", // Use bcrypt hash from elsewhere
  "name": "Admin Name",
  "role": "admin",
  "phone": "",
  "isActive": true,
  "createdAt": {"$date": {"$numberLong": "1678512000000"}},
  "updatedAt": {"$date": {"$numberLong": "1678512000000"}},
  "__v": 0
}
```

---

## Change/Reset Passwords

### Method 1: Reset via Database (Fastest)

#### Using MongoDB GUI (Compass):
1. Open MongoDB Compass
2. Go to `civik_shield` → `users` collection
3. Find the user by email
4. Click the document to edit
5. Delete the `password` field
6. Add new password field with bcrypt hash (get from online bcrypt generator)
7. Click "Update"

**⚠️ Problem:** Hard to hash password manually

### Method 2: Use a Reset Script

Create a file: `backend/reset-password.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

async function resetPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civik_shield');
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Save
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`New Password: ${newPassword}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node reset-password.js <email> <newpassword>');
  console.log('Example: node reset-password.js admin@civicshield.com newpass123');
  process.exit(1);
}

resetPassword(email, password);
```

**Run it:**
```bash
cd backend
node reset-password.js admin@civicshield.com newpassword123
```

**Output:**
```
✅ Password reset successfully!
Email: admin@civicshield.com
New Password: newpassword123
```

### Method 3: API Endpoint (if user knows current password)

```bash
curl -X PATCH http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newpassword123"
  }'
```

⚠️ **Note:** Current API doesn't have password change route. You'd need to add it.

---

## Manage User Roles

### Change User Role to Admin

Create file: `backend/change-role.js`

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function changeRole(email, newRole) {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civik_shield');
    
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: newRole },
      { new: true }
    );
    
    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }
    
    console.log('✅ Role changed successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`New Role: ${user.role}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

const email = process.argv[2];
const role = process.argv[3];

if (!email || !role) {
  console.log('Usage: node change-role.js <email> <role>');
  console.log('Roles: citizen, admin');
  console.log('Example: node change-role.js user@example.com admin');
  process.exit(1);
}

if (!['citizen', 'admin'].includes(role)) {
  console.log('❌ Invalid role. Must be: citizen or admin');
  process.exit(1);
}

changeRole(email, role);
```

**Run it:**
```bash
cd backend
node change-role.js user@example.com admin
```

**Output:**
```
✅ Role changed successfully!
Email: user@example.com
Name: John Doe
New Role: admin
```

---

## Development Tools

### Create a Developer Utility Script

Create: `backend/dev-tools.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const commands = {
  'create-admin': createAdmin,
  'reset-password': resetPassword,
  'change-role': changeRole,
  'list-users': listUsers,
  'delete-user': deleteUser,
  'activate-user': activateUser
};

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civik_shield');
}

async function createAdmin(email, password, name) {
  console.log('📝 Creating admin account...');
  const user = new User({
    email: email.toLowerCase(),
    password,
    name,
    role: 'admin'
  });
  await user.save();
  console.log('✅ Admin created:', user.email);
}

async function resetPassword(email, newPassword) {
  console.log('🔑 Resetting password...');
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new Error('User not found');
  user.password = newPassword;
  await user.save();
  console.log('✅ Password reset for:', email);
}

async function changeRole(email, role) {
  console.log('👤 Changing role...');
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role },
    { new: true }
  );
  if (!user) throw new Error('User not found');
  console.log(`✅ Role changed to ${role}:`, email);
}

async function listUsers() {
  console.log('📋 All users:');
  const users = await User.find().select('-password');
  users.forEach(u => {
    console.log(`  • ${u.name} (${u.email}) - Role: ${u.role} - Active: ${u.isActive}`);
  });
}

async function deleteUser(email) {
  console.log('🗑️  Deleting user...');
  const result = await User.deleteOne({ email: email.toLowerCase() });
  if (result.deletedCount === 0) throw new Error('User not found');
  console.log('✅ User deleted:', email);
}

async function activateUser(email, active = true) {
  console.log(`${active ? '✅' : '🚫'} ${active ? 'Activating' : 'Deactivating'} user...`);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isActive: active },
    { new: true }
  );
  if (!user) throw new Error('User not found');
  console.log(`✅ User ${active ? 'activated' : 'deactivated'}:`, email);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = args.slice(1);

  if (!command || !commands[command]) {
    console.log('❌ Invalid command\n');
    console.log('Available commands:');
    console.log('  create-admin <email> <password> <name>');
    console.log('  reset-password <email> <newpassword>');
    console.log('  change-role <email> <role>');
    console.log('  list-users');
    console.log('  delete-user <email>');
    console.log('  activate-user <email> [true|false]\n');
    console.log('Examples:');
    console.log('  node dev-tools.js create-admin admin@example.com secret123 "Admin User"');
    console.log('  node dev-tools.js reset-password user@example.com newpass');
    console.log('  node dev-tools.js change-role user@example.com admin');
    process.exit(1);
  }

  try {
    await connectDB();
    await commands[command](...params);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
```

**Super easy to use:**
```bash
# Create admin
node dev-tools.js create-admin newadmin@example.com secret123 "New Admin"

# Reset password
node dev-tools.js reset-password user@example.com newpass123

# Change to admin
node dev-tools.js change-role user@example.com admin

# List all users
node dev-tools.js list-users

# Delete user
node dev-tools.js delete-user olduser@example.com

# Deactivate user
node dev-tools.js activate-user user@example.com false
```

---

## Database Direct Access

### MongoDB CLI (mongosh)

```bash
# Connect to your database
mongosh

# List all users
db.users.find().pretty()

# Find specific user
db.users.findOne({ email: "admin@civicshield.com" })

# Update role
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)

# Deactivate user
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isActive: false } }
)

# Delete user
db.users.deleteOne({ email: "user@example.com" })

# Count users
db.users.countDocuments()
```

### MongoDB Compass (GUI)

1. **Create**: Click "Insert Document" button
2. **Edit**: Click document → Edit → Modify fields
3. **Delete**: Right-click → Delete
4. **Query**: Use filter panel to search/modify

**Sample filter to find admins:**
```json
{ "role": "admin" }
```

---

## Security Best Practices

### ✅ DO:
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Store admin credentials securely
- Rotate passwords regularly
- Use `bcryptjs` for password hashing (auto in system)
- Log password changes
- Never share tokens

### ❌ DON'T:
- Store plaintext passwords
- Commit passwords to git
- Share JWT tokens
- Use default passwords in production
- Store passwords in environment variables (use `.env`)

---

## Quick Reference

| Task | Command | Time |
|------|---------|------|
| Create admin | `curl ... /register` | 1 min |
| Reset password | `node reset-password.js <email> <pwd>` | 2 min |
| Change role | `node change-role.js <email> admin` | 2 min |
| List users | `db.users.find()` in mongosh | 1 min |
| Delete user | `node dev-tools.js delete-user <email>` | 1 min |

---

## Current Admin Account

**Pre-created for testing:**
- **Email**: `admin@civicshield.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Created**: Via setup-admin.js script

---

## Troubleshooting

### "User not found"
- Check email spelling (case-insensitive in system)
- Make sure user exists in MongoDB

### "Invalid email or password"
- Password must be 6+ characters
- Email must be valid format

### "Cannot connect to MongoDB"
- Check your connection string in `.env`
- Ensure MongoDB is running
- Test with: `mongosh`

### Role not updating
- Check MongoDB updated the document
- Refresh browser (clear localStorage if needed)
- Logout and login again

