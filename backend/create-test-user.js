const mongoose = require('mongoose');
const User = require('./src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function createTestCitizen() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civik_shield';
  await mongoose.connect(mongoUri);
  
  const email = 'testcitizen@example.com';
  // Delete if exists
  await User.deleteOne({ email });
  
  const user = new User({
    email,
    password: 'password123',
    name: 'Test Citizen',
    role: 'citizen'
  });
  
  await user.save();
  console.log('Test citizen created successfully');
  await mongoose.disconnect();
}

createTestCitizen();
