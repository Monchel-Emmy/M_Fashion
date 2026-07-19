const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// @desc  Create stock-in (purchase)
// @route POST /api/transactions/stock-in
const createStockIn = async (req, res) => {
  try {
    const { product: productId, quantity, unitPrice, supplier, invoiceNumber, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const totalAmount = quantity * unitPrice;

    const transaction = await Transaction.create({
      type: 'stock_in',
      product: productId,
      quantity,
      unitPrice,
      totalAmount,
      supplier,
      invoiceNumber,
      notes,
      createdBy: req.user._id,
    });

    // Increase stock
    product.quantity += Number(quantity);
    await product.save();

    await transaction.populate(['product', 'supplier', 'createdBy']);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create stock-out (manual sale)
// @route POST /api/transactions/stock-out
const createStockOut = async (req, res) => {
  try {
    const { product: productId, quantity, unitPrice, customerName, notes, order } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${product.quantity}` });
    }

    const totalAmount = quantity * unitPrice;

    const transaction = await Transaction.create({
      type: 'stock_out',
      product: productId,
      quantity,
      unitPrice,
      totalAmount,
      customerName,
      notes,
      order,
      createdBy: req.user._id,
    });

    // Decrease stock
    product.quantity -= Number(quantity);
    await product.save();

    await transaction.populate(['product', 'createdBy']);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all transactions with filters
// @route GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { type, product, startDate, endDate, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = {};
    if (type) query.type = type;
    if (product) query.product = product;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('product', 'name category images sku')
      .populate('supplier', 'name')
      .populate('createdBy', 'name')
      .populate('order', 'orderNumber')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single transaction
// @route GET /api/transactions/:id
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product', 'name category images sku')
      .populate('supplier', 'name phone email')
      .populate('createdBy', 'name email')
      .populate('order', 'orderNumber customer');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createStockIn, createStockOut, getTransactions, getTransactionById };
