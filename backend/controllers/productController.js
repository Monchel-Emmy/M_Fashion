const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { cloudinary } = require('../config/cloudinary');

// @desc  Get all products (with filtering, search, pagination)
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      search, category, gender, minPrice, maxPrice,
      inStock, page = 1, limit = 20, sort = '-createdAt', featured,
    } = req.query;

    const query = { isActive: true };

    // Use regex search instead of $text to avoid missing text index errors
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (featured === 'true') query.featured = true;
    if (inStock === 'true') query.quantity = { $gt: 0 };
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('supplier', 'name phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('getProducts error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single product
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name phone email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Create product
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, sku, category, gender, sizes, colors, description, costPrice, sellingPrice, quantity, lowStockThreshold, supplier, featured, tags } = req.body;

    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
      name, sku, category, gender,
      sizes: sizes ? (Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim()).filter(Boolean)) : [],
      colors: colors ? (Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim()).filter(Boolean)) : [],
      description, costPrice, sellingPrice,
      quantity: quantity || 0,
      lowStockThreshold: lowStockThreshold || 5,
      images,
      supplier: supplier && supplier !== '' ? supplier : undefined,
      featured: featured === 'true' || featured === true,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update product
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fields = ['name', 'sku', 'category', 'gender', 'description', 'costPrice', 'sellingPrice', 'lowStockThreshold', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    // Handle supplier — ignore empty string to avoid ObjectId cast error
    if (req.body.supplier !== undefined) {
      product.supplier = req.body.supplier && req.body.supplier !== '' ? req.body.supplier : undefined;
    }

    // Handle featured
    if (req.body.featured !== undefined) {
      product.featured = req.body.featured === 'true' || req.body.featured === true;
    }

    if (req.body.sizes) product.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes.split(',').map(s => s.trim()).filter(Boolean);
    if (req.body.colors) product.colors = Array.isArray(req.body.colors) ? req.body.colors : req.body.colors.split(',').map(c => c.trim()).filter(Boolean);
    if (req.body.tags) product.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path);
      product.images = [...product.images, ...newImages];
    }

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete product image
// @route DELETE /api/products/:id/images
const deleteProductImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Extract public_id from URL and delete from Cloudinary
    const publicId = imageUrl.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
    await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();
    res.json({ message: 'Image deleted', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Delete product
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Soft delete
    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get low stock products
// @route GET /api/products/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).sort({ quantity: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, deleteProductImage, getLowStockProducts };
