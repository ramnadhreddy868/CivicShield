const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civik_shield';

const authorities = [
  {
    name: 'Municipal Authority',
    email: 'municipal@civicshield.com',
    password: 'password123',
    role: 'municipal'
  },
  {
    name: 'Women Safety Authority',
    email: 'safety@civicshield.com',
    password: 'password123',
    role: 'women_safety'
  }
];

async function createAuthorities() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    for (const auth of authorities) {
      const exists = await User.findOne({ email: auth.email });
      if (exists) {
        console.log(`Authority ${auth.role} already exists.`);
        continue;
      }

      await User.create(auth);
      console.log(`Created ${auth.role}: ${auth.email}`);
    }

    console.log('✅ Authorities setup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating authorities:', err);
    process.exit(1);
  }
}

createAuthorities();
