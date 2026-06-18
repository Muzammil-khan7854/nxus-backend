const jwt = require('jsonwebtoken');
const User = require('../models/User');

const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_987654321');

      // Early exit for mock admin/superadmin IDs to bypass database CastError and queries
      if (decoded.id === 'superadmin-mock-id') {
        req.user = {
          _id: 'superadmin-mock-id',
          name: 'Super Admin',
          email: (process.env.SUPERADMIN_First || 'superadmin@gmail.com').trim().toLowerCase(),
          role: 'superadmin',
          isVerified: true
        };
        return next();
      }

      if (decoded.id === 'admin-mock-id') {
        req.user = {
          _id: 'admin-mock-id',
          name: 'System Admin',
          email: (process.env.ADMIN_First || 'firstadmin@gmail.com').trim().toLowerCase(),
          role: 'admin',
          isVerified: true
        };
        return next();
      }

      // Safe check if database is online
      if (mongoose.connection.readyState !== 1) {
        console.warn('Database is offline, cannot authenticate standard user profile.');
        return res.status(503).json({ success: false, message: 'Database is currently offline. Verification requires database access.' });
      }

      // Find user and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Middleware to check verified users
const verifiedOnly = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Forbidden. E-mail verification (OTP) is required.' });
  }
};

// Check if user is Admin or Superadmin
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
};

// Check if user is Superadmin only
const superadminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Super-administrator privileges required.' });
  }
};

module.exports = { protect, verifiedOnly, adminOnly, superadminOnly };
