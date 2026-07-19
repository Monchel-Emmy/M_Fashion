const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesChart, getTopProducts, getCategoryStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/stats', getDashboardStats);
router.get('/sales-chart', getSalesChart);
router.get('/top-products', getTopProducts);
router.get('/categories', getCategoryStats);

module.exports = router;
