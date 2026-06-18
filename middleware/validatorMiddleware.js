const { check, validationResult } = require('express-validator');

// Error handling middleware wrapper
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Graceful error response, prevents unhandled database crashes
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

const registerValidator = [
  check('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name contains invalid characters (letters, spaces, hyphens, and apostrophes only)'),
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters')
    .custom(val => !/\s/.test(val)).withMessage('Password must not contain spaces'),
  check('phone')
    .notEmpty().withMessage('Phone number is required')
    .trim()
    .matches(/^(?:\+91|91)?[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian phone number'),
  validateRequest
];

const loginValidator = [
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty(),
  validateRequest
];

const adminStep1Validator = [
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('password', 'First-step password is required').notEmpty(),
  validateRequest
];

const adminStep2Validator = [
  check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
  check('step2Password', 'Second-step password is required').notEmpty(),
  validateRequest
];

const productValidator = [
  check('id')
    .notEmpty().withMessage('Product unique ID is required')
    .trim()
    .matches(/^prod-[a-z0-9-]+$/).withMessage('Product ID must be kebab-case and start with "prod-"'),
  check('name')
    .notEmpty().withMessage('Product name is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  check('category')
    .notEmpty().withMessage('Category is required')
    .trim()
    .isIn(['athletic', 'lifestyle', 'cyberpunk', 'minimalist', 'accessories']).withMessage('Category must be one of: athletic, lifestyle, cyberpunk, minimalist, accessories'),
  check('price')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number greater than or equal to 0.01'),
  check('sizes')
    .isArray({ min: 1 }).withMessage('Sizes must be specified as a non-empty array')
    .custom(arr => arr.every(val => typeof val === 'number' || !isNaN(val))).withMessage('Every size value must be a valid number'),
  validateRequest
];

const orderValidator = [
  check('total')
    .isFloat({ min: 0 }).withMessage('Total order value must be a non-negative number'),
  check('shippingDetails.name')
    .notEmpty().withMessage('Recipient name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Recipient name must be between 2 and 50 characters'),
  check('shippingDetails.email', 'Please include a valid shipping email').isEmail().normalizeEmail(),
  check('shippingDetails.phone')
    .notEmpty().withMessage('Shipping contact phone is required')
    .trim()
    .matches(/^\+?[0-9\s\-()]{7,25}$/).withMessage('Invalid shipping phone number format'),
  check('shippingDetails.address')
    .notEmpty().withMessage('Shipping street address is required')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Shipping address must be between 3 and 100 characters'),
  check('shippingDetails.city')
    .notEmpty().withMessage('Shipping city is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Shipping city must be between 2 and 50 characters'),
  check('shippingDetails.zip')
    .notEmpty().withMessage('Shipping ZIP code is required')
    .trim()
    .matches(/^[a-zA-Z0-9\s-]{3,10}$/).withMessage('ZIP code must be alphanumeric between 3 and 10 characters'),
  check('itemsList')
    .isArray({ min: 1 }).withMessage('Order items array cannot be empty')
    .custom((itemsList) => {
      for (const item of itemsList) {
        if (!item.id || typeof item.id !== 'string' || !item.id.trim()) {
          throw new Error('Each order item must have a valid product ID');
        }
        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
          throw new Error('Each order item must have a valid name');
        }
        if (typeof item.qty !== 'number' || item.qty <= 0 || !Number.isInteger(item.qty)) {
          throw new Error('Each order item must have a positive integer quantity (qty)');
        }
        if (typeof item.price !== 'number' || item.price < 0) {
          throw new Error('Each order item must have a non-negative price');
        }
        if (!item.size || (typeof item.size !== 'string' && typeof item.size !== 'number')) {
          throw new Error('Each order item must specify a shoe size');
        }
      }
      return true;
    }),
  validateRequest
];

module.exports = {
  registerValidator,
  loginValidator,
  adminStep1Validator,
  adminStep2Validator,
  productValidator,
  orderValidator
};
