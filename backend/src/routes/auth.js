const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const userRepo = require('../repositories/userRepo');
const { protect } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = '7d';

// Transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to send OTP via email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"CivicShield Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'CivicShield Account Verification OTP',
    text: `Hello,

Your OTP for CivicShield account verification is: ${otp}

This OTP will expire in 5 minutes.

Do not share this code with anyone.

CivicShield Support Team`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 10px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4CAF50; text-align: center;">CivicShield Security</h2>
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">Your OTP for CivicShield account verification is:</p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; border: 1px solid #ddd; margin: 20px 0;">
              <h1 style="color: #333; letter-spacing: 10px; margin: 0; font-size: 40px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP will expire in <b>5 minutes</b>.</p>
            <p style="color: #f44336; font-size: 14px;">Do not share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">CivicShield Support Team</p>
           </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (err) {
    console.error('Email send error:', err);
    // Log OTP anyway as fallback for development if email fails
    console.log(`Fallback 📧 OTP for ${email}: ${otp}`);
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// DEPRECATED: Standard login/register routes handle OTP now

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    // Find user and explicitly select otp fields
    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp_code +otp_expiry +otp_attempts');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check expiry
    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (user.otp_attempts >= 3) {
      return res.status(400).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    // Verify OTP
    if (user.otp_code !== otp) {
      user.otp_attempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Success! Clear OTP fields and activate account
    user.otp_code = undefined;
    user.otp_expiry = undefined;
    user.otp_attempts = 0;
    user.email_verified = true;
    user.isActive = true;
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend OTP Route
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp_code = otp;
    user.otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otp_attempts = 0;
    await user.save();

    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'citizen', phone } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create new user (inactive until email verified)
    const user = await userRepo.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
      phone,
      isActive: false, // Wait for OTP
      email_verified: false,
    });

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp_code = otp;
    user.otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful! OTP sent to your email.',
      otpSent: true,
      email: user.email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role = 'citizen' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await userRepo.findByEmail(email);
    console.log(`🔍 Login attempt for: ${email}, Found user: ${!!user}`);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is disabled (only if they were already verified)
    // If they are not verified, we still want to check password so they can get a new OTP.
    if (!user.isActive && user.email_verified) {
      return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
    }

    // For admin login, check the role
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'This account does not have admin privileges' });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    console.log(`🔐 Password valid for ${email}: ${isPasswordValid}`);
    if (!isPasswordValid) {
      // Small security risk but helpful for debugging: check if hashed password exists
      const hasHash = !!user.password;
      console.log(`⚠️ Password mismatch for ${email}. User has hash: ${hasHash}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate and return token directly for all roles including citizen
    const token = generateToken(user);

    // Mark user as active/verified if they are logging in successfully
    if (!user.isActive) {
      user.isActive = true;
      user.email_verified = true;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await userRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.patch('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updatedUser = await userRepo.update(req.user.id, {
      ...(name && { name }),
      ...(phone && { phone }),
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout route (frontend just deletes token)
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
