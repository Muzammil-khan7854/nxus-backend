const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../config/mailer');
const mongoose = require('mongoose');

// Sign JWT Token helper
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_987654321', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (with email OTP verification)
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if database connection is offline
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline. Please try again later or check connection.'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const user = new User({
      name,
      email,
      password, // hashed automatically by Mongoose pre-save hook
      phone,
      otpCode: otp,
      otpExpires,
      isVerified: false,
      role: 'user'
    });

    await user.save();

    // Send verification email
    const mailResult = await sendOTPEmail(email, name, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification OTP code sent to your email.',
      email,
      mailResult: mailResult.dryRun ? 'Sent (Dry Run)' : 'Sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for user account activation
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  const { email, otpCode } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    if (!user.otpCode || user.otpCode !== otpCode) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified and account activated successfully!',
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP to User
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.status(200).json({
      success: true,
      message: 'New verification OTP code has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Standard User Login
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    
    // 1. Immediately check if the login matches the hardcoded admin/superadmin emails
    const adminEmail = (process.env.ADMIN_First || 'firstadmin@gmail.com').trim().toLowerCase();
    const superadminEmail = (process.env.SUPERADMIN_First || 'superadmin@gmail.com').trim().toLowerCase();

    if (trimmedEmail === adminEmail || trimmedEmail === superadminEmail) {
      return res.status(403).json({
        success: false,
        message: 'Administrators must log in via the backoffice login portal.',
        isAdminRedirect: true
      });
    }

    // 2. Check if database connection is offline
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline. Please try again later.'
      });
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If attempting to login to admin/superadmin roles, they must go through admin-step-1 endpoint
    if (user.role === 'admin' || user.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators must log in via the backoffice login portal.',
        isAdminRedirect: true
      });
    }

    // Compare regular user password in database
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email not verified. Please verify your OTP code to activate your account.',
        isNotVerified: true,
        email: user.email
      });
    }

    res.json({
      success: true,
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Login Step 1 (Checks Step 1 password - flexible db/env check)
// @route   POST /api/auth/admin/step1
const adminLoginStep1 = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    
    // Verify that the email matches the hardcoded email in .env
    const adminEmail = (process.env.ADMIN_First || 'firstadmin@gmail.com').trim().toLowerCase();
    const superadminEmail = (process.env.SUPERADMIN_First || 'superadmin@gmail.com').trim().toLowerCase();

    if (trimmedEmail !== adminEmail && trimmedEmail !== superadminEmail) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isSuper = trimmedEmail === superadminEmail;
    const expectedStep2Pass = isSuper
      ? (process.env.SUPERADMIN_PASSWORD || '123456').trim()
      : (process.env.ADMIN_PASSWORD || '931109').trim();
    const defaultPass = isSuper ? 'superadmin123' : 'admin123';

    let isMatch = false;

    // 1. Check if the password matches the hardcoded .env password or fallback default
    if (password === expectedStep2Pass || password === defaultPass) {
      isMatch = true;
    }

    // 2. If online and not matched yet, check against Mongoose hashed database password
    if (!isMatch && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: trimmedEmail });
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        isMatch = await user.comparePassword(password);
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid step 1 password' });
    }

    res.status(200).json({
      success: true,
      step1Completed: true,
      message: mongoose.connection.readyState === 1 
        ? 'Step 1 verification successful. Please provide step 2 verification password.'
        : 'Step 1 verification successful (Offline Mode). Please provide step 2 verification password.',
      email: trimmedEmail,
      role: isSuper ? 'superadmin' : 'admin'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Login Step 2 (Checks Step 2 password in .env)
// @route   POST /api/auth/admin/step2
const adminLoginStep2 = async (req, res, next) => {
  const { email, step2Password } = req.body;

  try {
    const trimmedEmail = email ? email.trim().toLowerCase() : '';
    
    // Verify that the email matches the hardcoded email in .env
    const adminEmail = (process.env.ADMIN_First || 'firstadmin@gmail.com').trim().toLowerCase();
    const superadminEmail = (process.env.SUPERADMIN_First || 'superadmin@gmail.com').trim().toLowerCase();

    if (trimmedEmail !== adminEmail && trimmedEmail !== superadminEmail) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isSuper = trimmedEmail === superadminEmail;
    
    // Fetch step 2 passcode from .env and trim it to remove any leading/trailing space
    const expectedStep2Pass = isSuper
      ? (process.env.SUPERADMIN_PASSWORD || '123456').trim()
      : (process.env.ADMIN_PASSWORD || '931109').trim();

    const cleanInputPass = step2Password ? step2Password.trim() : '';

    if (cleanInputPass !== expectedStep2Pass) {
      return res.status(401).json({ success: false, message: 'Invalid step 2 password' });
    }

    // Fallback: If the database is offline, respond with a signed token and mock user details
    if (mongoose.connection.readyState !== 1) {
      const mockId = isSuper ? 'superadmin-mock-id' : 'admin-mock-id';
      return res.status(200).json({
        success: true,
        message: `Admin authorization successful (Offline Mode). Welcome Admin!`,
        token: signToken(mockId),
        user: {
          id: mockId,
          name: isSuper ? 'Super Admin' : 'System Admin',
          email: trimmedEmail,
          phone: isSuper ? '987-654-3210' : '123-456-7890',
          role: isSuper ? 'superadmin' : 'admin',
          isVerified: true
        }
      });
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    res.status(200).json({
      success: true,
      message: `Admin authorization successful. Welcome ${user.name}!`,
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/user-profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile phone and address
// @route   PUT /api/auth/user-profile
const updateUserProfile = async (req, res, next) => {
  const { phone, address } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  adminLoginStep1,
  adminLoginStep2,
  getUserProfile,
  updateUserProfile
};
