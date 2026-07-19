const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, trackOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/', createOrder);
router.get('/track/:orderNumber', trackOrder);

// Protected routes
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
