import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../components/AdminLayout';
import ProductModal from '../components/ProductModal';
import api from '../api/axios';
import { formatFRW, getCategoryEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  FiArrowDown, FiPackage, FiSearch, FiAlertTriangle,
  FiPlus, FiEdit2, FiTrash2, FiRefreshCw
} from 'react-icons/fi';
import './Inventory.css';


const CATEGORIES = ['Shirts', 'Pants', 'Dresses', 'Skirts', 'Jackets', 'Shoes', 'Accessories', 'Underwear', 'Sportswear', 'Other'];

export default function StockIn() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'record'

  /* ── Inventory state ── */
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingInv, setLoadingInv] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  /* ── Stock-in form state ── */
  const [allProducts, setAllProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingForm, setLoadingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const watchProduct = watch('product');

  /* ── Fetch inventory ── */
  const fetchProducts = useCallback(async () => {
    setLoadingInv(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoadingInv(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Fetch all products + suppliers for form ── */
  useEffect(() => {
    Promise.all([
      api.get('/products?limit=200').catch(() => ({ data: { products: [] } })),
      api.get('/suppliers').catch(() => ({ data: [] })),
    ]).then(([p, s]) => {
      setAllProducts(p.data.products || []);
      setSuppliers(s.data || []);
    });
  }, []);

  /* ── Sync selected product from form ── */
  useEffect(() => {
    if (watchProduct) {
      const p = allProducts.find(p => p._id === watchProduct);
      setSelectedProduct(p || null);
      if (p) setUnitPrice(p.costPrice);
    } else {
      setSelectedProduct(null);
    }
  }, [watchProduct, allProducts]);

  /* ── Stock-in submit ── */
  const onSubmit = async (data) => {
    setLoadingForm(true);
    try {
      await api.post('/transactions/stock-in', {
        product: data.product,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),
        supplier: data.supplier || undefined,
        invoiceNumber: data.invoiceNumber || undefined,
        notes: data.notes || undefined,
      });
      toast.success('✅ Stock added successfully!');
      reset();
      setSelectedProduct(null);
      setQty('');
      setUnitPrice('');
      fetchProducts(); // refresh inventory table
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add stock');
    } finally {
      setLoadingForm(false);
    }
  };

  /* ── Delete product ── */
  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch {
      toast.error('Failed to deactivate product');
    }
  };

  const openAdd = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setShowModal(true); };
  const onSaved = () => { setShowModal(false); fetchProducts(); };

  const total_cost = qty && unitPrice ? Number(qty) * Number(unitPrice) : 0;

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <AdminLayout title="Stock In">

          {/* Page header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Stock Management</h2>
              <p className="page-subtitle">View your inventory and record new stock purchases</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <FiPlus /> Add Product
            </button>
          </div>

          {/* Tabs */}
          <div className="stockin-tabs">
            <button
              className={`stockin-tab ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <FiPackage /> Current Inventory
              <span className="tab-badge">{total}</span>
            </button>
            <button
              className={`stockin-tab ${activeTab === 'record' ? 'active' : ''}`}
              onClick={() => setActiveTab('record')}
            >
              <FiArrowDown /> Record Stock In
            </button>
          </div>

          {/* ════ TAB: INVENTORY ════ */}
          {activeTab === 'inventory' && (
            <div className="fade-in">
              {/* Filters */}
              <div className="inventory-filters card">
                <div className="filter-search">
                  <FiSearch className="filter-icon" />
                  <input
                    className="form-control"
                    style={{ paddingLeft: 36 }}
                    placeholder="Search products..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <select className="form-control" style={{ width: 180 }}
                  value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{getCategoryEmoji(c)} {c}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={fetchProducts} title="Refresh">
                  <FiRefreshCw />
                </button>
              </div>

              {/* Summary chips */}
              <div className="inv-summary-chips">
                <div className="inv-chip inv-chip-total">
                  <span className="inv-chip-label">Total Products</span>
                  <span className="inv-chip-value">{total}</span>
                </div>
                <div className="inv-chip inv-chip-low">
                  <span className="inv-chip-label">⚠️ Low Stock</span>
                  <span className="inv-chip-value">
                    {products.filter(p => p.isLowStock && p.quantity > 0).length}
                  </span>
                </div>
                <div className="inv-chip inv-chip-out">
                  <span className="inv-chip-label">❌ Out of Stock</span>
                  <span className="inv-chip-value">
                    {products.filter(p => p.quantity === 0).length}
                  </span>
                </div>
                <div className="inv-chip inv-chip-value">
                  <span className="inv-chip-label">💰 Stock Value</span>
                  <span className="inv-chip-value-text">
                    {formatFRW(products.reduce((s, p) => s + p.costPrice * p.quantity, 0))}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="table-wrapper">
                {loadingInv ? (
                  <div className="loader"><div className="spinner" /></div>
                ) : products.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p className="empty-state-title">No products found</p>
                    <p className="empty-state-text">Add your first product to get started</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>SKU</th>
                        <th>Sizes</th>
                        <th>Cost Price</th>
                        <th>Sell Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id}>
                          <td>
                            <div className="product-table-cell">
                              <div className="product-table-img">
                                {p.images?.[0]
                                  ? <img src={p.images[0]} alt={p.name} />
                                  : <span>{getCategoryEmoji(p.category)}</span>}
                              </div>
                              <div>
                                <p className="font-semibold" style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.name}</p>
                                {p.colors?.length > 0 && (
                                  <p className="text-xs text-muted">{p.colors.slice(0, 3).join(', ')}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-purple">
                              {getCategoryEmoji(p.category)} {p.category}
                            </span>
                          </td>
                          <td className="text-muted text-xs">{p.sku || '—'}</td>
                          <td className="text-xs text-secondary">{p.sizes?.join(', ') || '—'}</td>
                          <td>{formatFRW(p.costPrice)}</td>
                          <td className="font-semibold" style={{ color: 'var(--accent-teal)' }}>{formatFRW(p.sellingPrice)}</td>
                          <td>
                            <div className="stock-cell">
                              <span className={`stock-qty ${p.quantity === 0 ? 'text-danger' : p.quantity <= p.lowStockThreshold ? 'text-warning' : 'text-success'}`}>
                                {p.quantity}
                              </span>
                              {p.quantity <= p.lowStockThreshold && p.quantity > 0 && (
                                <FiAlertTriangle className="text-warning" style={{ fontSize: '0.8rem' }} />
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.isLowStock ? 'badge-warning' : 'badge-success'}`}>
                              {p.quantity === 0 ? 'Out of Stock' : p.isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(p)} title="Edit">
                                <FiEdit2 />
                              </button>
                              <button className="btn btn-icon btn-sm"
                                style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }}
                                onClick={() => handleDelete(p._id, p.name)} title="Deactivate">
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {total > 15 && (
                <div className="pagination">
                  <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                  </button>
                  <span className="pagination-info">Page {page} of {Math.ceil(total / 15)}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)}>
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════ TAB: RECORD STOCK IN ════ */}
          {activeTab === 'record' && (
            <div className="transaction-layout fade-in">
              <div className="card transaction-form">
                <div className="transaction-form-header">
                  <div className="transaction-icon" style={{ background: 'rgba(77,217,192,0.15)', color: 'var(--accent-teal)' }}>
                    <FiArrowDown style={{ fontSize: '1.4rem' }} />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>New Stock Entry</h3>
                    <p className="text-sm text-muted">Fill in the purchase details below</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label className="form-label">Select Product *</label>
                    <select className={`form-control ${errors.product ? 'input-error' : ''}`}
                      {...register('product', { required: 'Please select a product' })}>
                      <option value="">Choose product...</option>
                      {allProducts.map(p => (
                        <option key={p._id} value={p._id}>
                          {getCategoryEmoji(p.category)} {p.name} (Stock: {p.quantity})
                        </option>
                      ))}
                    </select>
                    {errors.product && <p className="form-error">{errors.product.message}</p>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label className="form-label">Quantity *</label>
                      <input type="number" className={`form-control ${errors.quantity ? 'input-error' : ''}`}
                        placeholder="0" min="1"
                        {...register('quantity', { required: 'Required', min: { value: 1, message: 'Min 1' } })}
                        onChange={e => setQty(e.target.value)} />
                      {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Unit Cost Price (FRW) *</label>
                      <input type="number" className={`form-control ${errors.unitPrice ? 'input-error' : ''}`}
                        placeholder="0" min="0"
                        value={unitPrice}
                        {...register('unitPrice', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
                        onChange={e => setUnitPrice(e.target.value)} />
                      {errors.unitPrice && <p className="form-error">{errors.unitPrice.message}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                    <div className="form-group">
                      <label className="form-label">Supplier</label>
                      <select className="form-control" {...register('supplier')}>
                        <option value="">Select supplier (optional)</option>
                        {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Invoice Number</label>
                      <input className="form-control" placeholder="INV-0001" {...register('invoiceNumber')} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows={2} placeholder="Any additional notes..."
                      {...register('notes')} />
                  </div>

                  {/* Summary */}
                  {selectedProduct && (
                    <div className="transaction-summary">
                      <div className="transaction-summary-row">
                        <span className="text-muted">Product</span>
                        <span className="font-semibold">{selectedProduct.name}</span>
                      </div>
                      <div className="transaction-summary-row">
                        <span className="text-muted">Current Stock</span>
                        <span>{selectedProduct.quantity} units</span>
                      </div>
                      <div className="transaction-summary-row">
                        <span className="text-muted">Stock After</span>
                        <span className="text-success font-semibold">
                          {qty ? selectedProduct.quantity + Number(qty) : selectedProduct.quantity} units
                        </span>
                      </div>
                      <div className="transaction-summary-row transaction-summary-total">
                        <span>Total Purchase Cost</span>
                        <span className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                          {formatFRW(total_cost)}
                        </span>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn btn-success btn-lg w-full" disabled={loadingForm}
                    style={{ marginTop: 'var(--space-md)' }}>
                    {loadingForm ? 'Processing...' : '✅ Confirm Stock In'}
                  </button>
                </form>
              </div>

              {/* Info panel */}
              <div className="transaction-info-panel">
                <div className="card">
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                    💡 Stock In Guide
                  </h4>
                  <div className="info-steps">
                    {[
                      ['1', 'Select Product', 'Choose the product you purchased'],
                      ['2', 'Enter Quantity', 'How many units did you receive?'],
                      ['3', 'Set Price', 'Enter the cost price per unit'],
                      ['4', 'Add Supplier', 'Optionally link to a supplier'],
                      ['5', 'Confirm', 'Stock will be added immediately'],
                    ].map(([num, title, desc]) => (
                      <div key={num} className="info-step">
                        <div className="info-step-num">{num}</div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</p>
                          <p className="text-xs text-muted">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick stock overview */}
                <div className="card" style={{ marginTop: 'var(--space-md)' }}>
                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                    📊 Quick Overview
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {allProducts.filter(p => p.quantity <= p.lowStockThreshold).slice(0, 5).map(p => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--brand-border)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {getCategoryEmoji(p.category)} {p.name}
                        </span>
                        <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                          {p.quantity} left
                        </span>
                      </div>
                    ))}
                    {allProducts.filter(p => p.quantity <= p.lowStockThreshold).length === 0 && (
                      <p className="text-sm text-muted text-center" style={{ padding: 'var(--space-md) 0' }}>
                        ✅ All products well-stocked
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={onSaved}
        />
      )}
    </AdminLayout>
  );
}
