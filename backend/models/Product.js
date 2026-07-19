const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, sparse: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Shirts', 'Pants', 'Dresses', 'Skirts', 'Jackets', 'Shoes', 'Accessories', 'Underwear', 'Sportswear', 'Other'],
    },
    gender: { type: String, enum: ['Men', 'Women', 'Kids', 'Unisex'], default: 'Unisex' },
    sizes: [{ type: String }],          // e.g. ['S','M','L','XL','XXL']
    colors: [{ type: String }],         // e.g. ['Red','Blue']
    description: { type: String, trim: true },
    costPrice: { type: Number, required: true, min: 0 },    // FRW
    sellingPrice: { type: Number, required: true, min: 0 }, // FRW
    quantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    images: [{ type: String }],         // Cloudinary URLs
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Virtual: is low stock
productSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold && this.quantity > 0;
});

// Virtual: profit margin
productSchema.virtual('profitMargin').get(function () {
  if (this.costPrice === 0) return 0;
  return (((this.sellingPrice - this.costPrice) / this.costPrice) * 100).toFixed(2);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
