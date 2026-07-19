const express = require('express');
const router = express.Router();
const { createStockIn, createStockOut, getTransactions, getTransactionById } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/stock-in', createStockIn);
router.post('/stock-out', createStockOut);

module.exports = router;
