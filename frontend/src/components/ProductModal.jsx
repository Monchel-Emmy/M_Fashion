import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';

const CATEGORIES = ['Shirts', 'Pants', 'Dresses', 'Skirts', 'Jackets', 'Shoes', 'Accessories', 'Underwear', 'Sportswear', 'Other'];
const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];

export default function ProductModal({ product, onClose, onSaved }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState(product?.images || []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: product ? {
      name: product.name, sku: product.sku, category: product.category,
      gender: product.gender, description: product.description,
      costPrice: product.costPrice, sellingPrice: product.sellingPrice,
      quantity: product.quantity, lowStockThreshold: product.lowStockThreshold,
      sizes: product.sizes?.join(', '), colors: product.colors?.join(', '),
      tags: product.tags?.join(', '), supplier: product.supplier?._id || '',
      featured: product.featured,
    } : { gender: 'Unisex', lowStockThreshold: 5 }
  });

  useEffect(() => {
    api.get('/suppliers').then(r => setSuppliers(r.data)).catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setPreviewImages(previews);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
      images.forEach(img => formData.append('images', img));

      if (product) {
        await api.put(`/products/${product._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <h3 className="modal-title">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className={`form-control ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Classic White Shirt"
                  {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input className="form-control" placeholder="e.g. MF-001" {...register('sku')} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className={`form-control ${errors.category ? 'input-error' : ''}`}
                  {...register('category', { required: 'Category is required' })}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="form-error">{errors.category.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" {...register('gender')}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Cost Price (FRW) *</label>
                <input type="number" className={`form-control ${errors.costPrice ? 'input-error' : ''}`}
                  placeholder="0"
                  {...register('costPrice', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
                {errors.costPrice && <p className="form-error">{errors.costPrice.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (FRW) *</label>
                <input type="number" className={`form-control ${errors.sellingPrice ? 'input-error' : ''}`}
                  placeholder="0"
                  {...register('sellingPrice', { required: 'Required', min: { value: 0, message: 'Min 0' } })} />
                {errors.sellingPrice && <p className="form-error">{errors.sellingPrice.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Initial Quantity</label>
                <input type="number" className="form-control" placeholder="0" min="0"
                  {...register('quantity', { min: 0 })} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Sizes (comma-separated)</label>
                <input className="form-control" placeholder="S, M, L, XL, XXL" {...register('sizes')} />
              </div>
              <div className="form-group">
                <label className="form-label">Colors (comma-separated)</label>
                <input className="form-control" placeholder="Red, Blue, Black" {...register('colors')} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <select className="form-control" {...register('supplier')}>
                  <option value="">No supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Alert (units)</label>
                <input type="number" className="form-control" min="0" {...register('lowStockThreshold')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} placeholder="Product description..."
                {...register('description')} />
            </div>

            {/* Images */}
            <div className="form-group">
              <label className="form-label">Product Images</label>
              <label className="image-upload-area">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <FiUpload style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }} />
                <p className="text-sm text-muted" style={{ marginTop: 8 }}>Click to upload images (max 5)</p>
              </label>
              {previewImages.length > 0 && (
                <div className="image-previews">
                  {previewImages.map((src, i) => (
                    <div key={i} className="image-preview">
                      <img src={src} alt={`Preview ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="featured" {...register('featured')} style={{ width: 18, height: 18, accentColor: 'var(--accent-pink)' }} />
              <label htmlFor="featured" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Mark as Featured Product</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
