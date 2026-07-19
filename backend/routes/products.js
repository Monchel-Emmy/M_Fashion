const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage, getLowStockProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getProducts);
router.get('/low-stock', protect, getLowStockProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/', protect, upload.array('images', 5), createProduct);
router.put('/:id', protect, upload.array('images', 5), updateProduct);
router.delete('/:id/images', protect, deleteProductImage);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
