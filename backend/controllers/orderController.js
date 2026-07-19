const Order = require('../models/Order');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// @desc  Create order (public / customer)
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customer, items, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Validate stock and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });
      if (!product.isActive) return res.status(400).json({ message: `${product.name} is no longer available` });
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` });
      }

      const totalPrice = product.sellingPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.images[0] || '',
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        totalPrice,
      });
    }

    const order = await Order.create({
      customer,
      items: orderItems,
      subtotal,
      totalAmount: subtotal,
      paymentMethod: paymentMethod || 'cash',
      notes,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all orders (admin/staff)
// @route GET /api/orders
const getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) { const e = new Date(endDate); e.setHours(23,59,59,999); query.createdAt.$lte = e; }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('processedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('processedBy', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update order status (confirm, process, ship, deliver, cancel)
// @route PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.status;
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.processedBy = req.user._id;

    await order.save();

    // If order is confirmed (was pending → confirmed), deduct stock and create transactions
    if (prevStatus === 'pending' && status === 'confirmed') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.quantity < item.quantity) {
            order.status = 'pending';
            await order.save();
            return res.status(400).json({ message: `Insufficient stock for ${item.productName}. Available: ${product.quantity}` });
          }
          product.quantity -= item.quantity;
          await product.save();

          await Transaction.create({
            type: 'stock_out',
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalAmount: item.totalPrice,
            customerName: order.customer.name,
            order: order._id,
            createdBy: req.user._id,
          });
        }
      }
    }

    // If order is cancelled and was already confirmed (restock)
    if (status === 'cancelled' && prevStatus !== 'pending' && prevStatus !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Track order by order number (public)
// @route GET /api/orders/track/:orderNumber
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber.toUpperCase() })
      .select('orderNumber status paymentStatus totalAmount customer.name items createdAt updatedAt');
    if (!order) return res.status(404).json({ message: 'Order not found. Check your order number.' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, trackOrder };
