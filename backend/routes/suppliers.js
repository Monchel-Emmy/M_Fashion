const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/', getSuppliers);
router.post('/', adminOnly, createSupplier);
router.put('/:id', adminOnly, updateSupplier);
router.delete('/:id', adminOnly, deleteSupplier);

module.exports = router;
