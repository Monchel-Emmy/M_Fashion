const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc  Get dashboard stats
// @route GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total products & stock value
    const products = await Product.find({ isActive: true });
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0);
    const totalStockUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = products.filter(p => p.quantity <= p.lowStockThreshold && p.quantity > 0).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;

    // Today's sales
    const todaySales = await Transaction.aggregate([
      { $match: { type: 'stock_out', createdAt: { $gte: today, $lte: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    // This month's sales
    const monthSales = await Transaction.aggregate([
      { $match: { type: 'stock_out', createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    // This month's purchases
    const monthPurchases = await Transaction.aggregate([
      { $match: { type: 'stock_in', createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalOrders = await Order.countDocuments();

    // Total revenue all time
    const allTimeSales = await Transaction.aggregate([
      { $match: { type: 'stock_out' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      totalProducts,
      totalStockValue,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      todaySalesAmount: todaySales[0]?.total || 0,
      todaySalesCount: todaySales[0]?.count || 0,
      monthSalesAmount: monthSales[0]?.total || 0,
      monthSalesCount: monthSales[0]?.count || 0,
      monthPurchasesAmount: monthPurchases[0]?.total || 0,
      pendingOrders,
      totalOrders,
      totalRevenue: allTimeSales[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get sales chart data (last 30 days)
// @route GET /api/dashboard/sales-chart
const getSalesChart = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));
    startDate.setHours(0, 0, 0, 0);

    const data = await Transaction.aggregate([
      { $match: { type: 'stock_out', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', sales: 1, count: 1, _id: 0 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get top selling products
// @route GET /api/dashboard/top-products
const getTopProducts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const data = await Transaction.aggregate([
      { $match: { type: 'stock_out' } },
      { $group: { _id: '$product', totalSold: { $sum: '$quantity' }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { productName: '$product.name', category: '$product.category', images: '$product.images', totalSold: 1, revenue: 1 } },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get category breakdown
// @route GET /api/dashboard/categories
const getCategoryStats = async (req, res) => {
  try {
    const data = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
        },
      },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, totalQuantity: 1, totalValue: 1, _id: 0 } },
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getSalesChart, getTopProducts, getCategoryStats };
