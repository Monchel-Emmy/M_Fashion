const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },    // snapshot at order time
  productImage: { type: String },
  size: { type: String },
  color: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },      // FRW
  totalPrice: { type: Number, required: true },     // FRW
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },        // FRW
    totalAmount: { type: Number, required: true },     // FRW
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'momo', 'bank_transfer', 'other'],
      default: 'cash',
    },
    notes: { type: String, trim: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `MF-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
