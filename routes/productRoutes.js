const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
  addProductReview
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { productValidator } = require('../middleware/validatorMiddleware');

// Public catalog views
router.get('/', getProducts);
router.get('/:id', getProductById);

// Seed helper
router.post('/seed', seedProducts);

// Reviews
router.post('/:id/review', protect, addProductReview);

// Secured administrative CRUD routes
router.post('/', protect, adminOnly, productValidator, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
