import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';
import { formatFRW, getCategoryEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import ProductModal from '../components/ProductModal';
import './Inventory.css';

const CATEGORIES = ['Shirts', 'Pants', 'Dresses', 'Skirts', 'Jackets', 'Shoes', 'Accessories', 'Underwear', 'Sportswear', 'Other'];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch (e) {
      toast.error('Failed to deactivate product');
    }
  };

  const openAdd = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setShowModal(true); };
  const onSaved = () => { setShowModal(false); fetchProducts(); };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Inventory" />
        <div className="page-content fade-in">
          <div className="page-header">
            <div>
              <h2 className="page-title">Product Inventory</h2>
              <p className="page-subtitle">{total} products in stock</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <FiPlus /> Add Product
            </button>
          </div>

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
          </div>

          {/* Table */}
          <div className="table-wrapper">
            {loading ? (
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
                          <button className="btn btn-icon btn-sm" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }}
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
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
