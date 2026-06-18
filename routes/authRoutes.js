const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  adminLoginStep1,
  adminLoginStep2,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  adminStep1Validator,
  adminStep2Validator
} = require('../middleware/validatorMiddleware');
const { protect } = require('../middleware/authMiddleware');

// User Registration & OTP verification routes
router.post('/register', registerValidator, register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Standard User Login route
router.post('/login', loginValidator, login);

// Admin 2-Step verification routes
router.post('/admin/step1', adminStep1Validator, adminLoginStep1);
router.post('/admin/step2', adminStep2Validator, adminLoginStep2);

// User Profile routes (secured with protect middleware)
router.get('/user-profile', protect, getUserProfile);
router.put('/user-profile', protect, updateUserProfile);

module.exports = router;
