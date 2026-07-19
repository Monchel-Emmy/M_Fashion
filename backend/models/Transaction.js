const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['stock_in', 'stock_out'], required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },   // FRW
    totalAmount: { type: Number, required: true, min: 0 },  // FRW
    // For stock_in (purchases)
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    invoiceNumber: { type: String, trim: true },
    // For stock_out (sales / orders)
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    customerName: { type: String, trim: true },
    // Metadata
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
