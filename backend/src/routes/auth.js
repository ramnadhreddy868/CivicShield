const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const userRepo = require('../repositories/userRepo');
const { protect } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRE = '7d';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"CivicShield Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'CivicShield Account Verification OTP',
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
    });
    console.log(`✅ OTP sent to ${email}`);
  } catch (err) {
    console.error('Email send error:', err);
    console.log(`Fallback 📧 OTP for ${email}: ${otp}`);
  }
};

// Helper to send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    await transporter.sendMail({
      from: `"CivicShield Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'CivicShield Password Reset Code',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; background-color: #f9f9f9; border-radius: 10px; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #4CAF50; text-align: center;">CivicShield Password Reset</h2>
              <p style="font-size: 16px;">Hello,</p>
              <p style="font-size: 16px;">Your password reset code is:</p>
              <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; border: 1px solid #ddd; margin: 20px 0;">
                <h1 style="color: #333; letter-spacing: 10px; margin: 0; font-size: 40px;">${token}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in <b>15 minutes</b>.</p>
              <p style="color: #f44336; font-size: 14px;">If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">CivicShield Support Team</p>
             </div>`,
    });
    console.log(`✅ Password reset code sent to ${email}`);
  } catch (err) {
    console.error('Password reset email error:', err);
    console.log(`Fallback 📧 Password reset code for ${email}: ${token}`);
    throw err;
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

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+otp_code +otp_expiry +otp_attempts');

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (new Date() > user.otp_expiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp_attempts >= 3) {
      return res.status(400).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    if (user.otp_code !== otp) {
      user.otp_attempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

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
    user.otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otp_attempts = 0;
    await user.save();

    await sendOTPEmail(email, otp);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.reset_password_token = token;
    user.reset_password_expiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(email, token);
      res.json({ success: true, message: 'Password reset code sent to your email.' });
    } catch (err) {
      console.error('Forgot password email send failed:', err);
      res.status(500).json({ error: 'Failed to send password reset code' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send password reset code' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+reset_password_token +reset_password_expiry');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.reset_password_token || user.reset_password_token !== token) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }
    if (new Date() > user.reset_password_expiry) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    user.password = password;
    user.reset_password_token = undefined;
    user.reset_password_expiry = undefined;
    await user.save();

    const authToken = generateToken(user);
    res.json({ success: true, message: 'Password reset successfully', token: authToken, user: user.toJSON() });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'citizen', phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await userRepo.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
      phone,
      isActive: false,
      email_verified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp_code = otp;
    user.otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    sendOTPEmail(email, otp).catch(err => {
      console.error('Failed to send OTP email:', err);
    });

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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userRepo.findByEmail(email);
    console.log(`🔍 Login attempt for: ${email}, Found user: ${!!user}`);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive && user.email_verified) {
      return res.status(403).json({ error: 'Account is disabled. Please contact support.' });
    }

    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ error: 'This account does not have admin privileges' });
    }

    const isPasswordValid = await user.matchPassword(password);
    console.log(`🔐 Password valid for ${email}: ${isPasswordValid}`);
    if (!isPasswordValid) {
      const hasHash = !!user.password;
      console.log(`⚠️ Password mismatch for ${email}. User has hash: ${hasHash}`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

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

// Logout route
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;