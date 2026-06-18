const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getUserOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { orderValidator } = require('../middleware/validatorMiddleware');

// Guest/User order placement
// If JWT token is present in headers, protect middleware runs optionally.
// We'll write an optional protect middleware or just check token in controller.
// To keep things simple and crash-free:
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_987654321');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      console.warn("Optional JWT Auth Failed:", e.message);
    }
  }
  next();
};

router.post('/', optionalProtect, orderValidator, createOrder);

// Retrieve personal order history
router.get('/my-orders', protect, getUserOrders);

// Administrative order viewing & processing
router.get('/', protect, adminOnly, getOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
