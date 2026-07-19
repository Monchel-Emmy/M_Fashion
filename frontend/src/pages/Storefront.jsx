import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { formatFRW, getCategoryEmoji } from '../utils/helpers';
import { useCart } from '../context/CartContext';
import Cart from '../components/Cart';
import ProductDetail from '../components/ProductDetail';
import { FiShoppingCart, FiSearch, FiFilter, FiX, FiMenu } from 'react-icons/fi';
import './Storefront.css';

const CATEGORIES = ['Shirts', 'Pants', 'Dresses', 'Skirts', 'Jackets', 'Shoes', 'Accessories', 'Underwear', 'Sportswear', 'Other'];

export default function Storefront() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const { cartCount, setIsOpen: setCartOpen } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (gender) params.append('gender', gender);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, gender]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="storefront">
      {/* NAVBAR */}
      <nav className="store-nav">
        <div className="store-nav-inner">
          <div className="store-logo">
            <div className="store-logo-mark">MF</div>
            <div>
              <p className="store-brand">Melody Fashion</p>
              <p className="store-tagline text-gradient">Style</p>
            </div>
          </div>

          <div className="store-nav-search">
            <FiSearch className="store-search-icon" />
            <input className="store-search-input" placeholder="Search styles..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>

          <div className="store-nav-actions">
            <a href="/login" className="btn btn-outline btn-sm">Staff Login</a>
            <button className="store-cart-btn" onClick={() => setCartOpen(true)}>
              <FiShoppingCart />
              {cartCount > 0 && <span className="store-cart-badge">{cartCount}</span>}
            </button>
          </div>

          <button className="store-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="store-hero">
        <div className="store-hero-blob store-hero-blob-1" />
        <div className="store-hero-blob store-hero-blob-2" />
        <div className="store-hero-content">
          <p className="store-hero-label">✨ New Collection Available</p>
          <h1 className="store-hero-title display-title">
            Discover Your <span className="text-gradient">Perfect Style</span>
          </h1>
          <p className="store-hero-sub">
            Premium fashion for every occasion. Shirts, dresses, shoes & more — all in one place.
          </p>
          <div className="store-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}>
              Shop Now
            </button>
            <a href="#" className="btn btn-outline btn-lg">View Lookbook</a>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="store-categories">
        <div className="store-section-inner">
          <button className={`category-chip ${category === '' ? 'active' : ''}`} onClick={() => { setCategory(''); setPage(1); }}>
            🛍️ All
          </button>
          {CATEGORIES.map(c => (
            <button key={c} className={`category-chip ${category === c ? 'active' : ''}`}
              onClick={() => { setCategory(c === category ? '' : c); setPage(1); }}>
              {getCategoryEmoji(c)} {c}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="store-products" id="products-section">
        <div className="store-section-inner">
          <div className="store-products-header">
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                {category || 'All Products'}
              </h2>
              <p className="text-sm text-muted">{total} items available</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select className="form-control" style={{ width: 140 }} value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}>
                <option value="">All Gender</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="product-card">
                  <div className="skeleton" style={{ aspectRatio: '4/5' }} />
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: 14, marginBottom: 8, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 20, width: '60%', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">😔</div>
              <p className="empty-state-title">No products found</p>
              <p className="empty-state-text">Try a different category or search term</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(p => (
                <div key={p._id} className="product-card" onClick={() => setSelectedProduct(p)}>
                  <div className="product-img-wrapper">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} loading="lazy" />
                    ) : (
                      <div className="product-img-placeholder">{getCategoryEmoji(p.category)}</div>
                    )}
                    {p.quantity === 0 && (
                      <div className="product-out-of-stock-overlay">
                        <span className="product-out-of-stock-label">Out of Stock</span>
                      </div>
                    )}
                    {p.featured && (
                      <div style={{ position: 'absolute', top: 10, left: 10 }}>
                        <span className="badge badge-pink">⭐ Featured</span>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <p className="product-category">{p.category} · {p.gender}</p>
                    <p className="product-name">{p.name}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="product-price">{formatFRW(p.sellingPrice)}</p>
                      {p.quantity > 0 && (
                        <span className="text-xs text-muted">{p.quantity} left</span>
                      )}
                    </div>
                    {p.sizes?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {p.sizes.slice(0, 4).map(s => (
                          <span key={s} style={{ fontSize: '0.68rem', padding: '2px 6px', background: 'var(--brand-surface2)', borderRadius: 4, color: 'var(--text-muted)', border: '1px solid var(--brand-border)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn btn-primary btn-sm product-add-btn"
                      disabled={p.quantity === 0}
                      onClick={e => { e.stopPropagation(); setSelectedProduct(p); }}
                    >
                      {p.quantity === 0 ? 'Out of Stock' : 'View & Order'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="pagination" style={{ marginTop: 'var(--space-xl)' }}>
              <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
              <span className="text-muted">Page {page} of {Math.ceil(total / 20)}</span>
              <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="store-footer">
        <div className="store-section-inner">
          <div className="store-footer-grid">
            <div>
              <div className="store-logo" style={{ marginBottom: 12 }}>
                <div className="store-logo-mark">MF</div>
                <div>
                  <p className="store-brand">Melody Fashion</p>
                  <p className="store-tagline text-gradient">Style</p>
                </div>
              </div>
              <p className="text-sm text-muted">Premium fashion for every body, every occasion, every day.</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Quick Links</h4>
              {CATEGORIES.slice(0, 5).map(c => (
                <p key={c} className="text-sm text-muted" style={{ marginBottom: 6, cursor: 'pointer' }}
                  onClick={() => { setCategory(c); document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' }); }}>
                  {getCategoryEmoji(c)} {c}
                </p>
              ))}
            </div>
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Track Order</h4>
              <p className="text-sm text-muted" style={{ marginBottom: 12 }}>Have an order number? Track its status here.</p>
              <input className="form-control" placeholder="e.g. MF-00001" style={{ marginBottom: 8 }}
                id="track-input" />
              <button className="btn btn-primary btn-sm w-full"
                onClick={async () => {
                  const num = document.getElementById('track-input').value;
                  if (!num) return;
                  try {
                    const { data } = await api.get(`/orders/track/${num}`);
                    alert(`Order ${data.orderNumber}\nStatus: ${data.status}\nPayment: ${data.paymentStatus}`);
                  } catch {
                    alert('Order not found');
                  }
                }}>
                Track Order
              </button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--brand-border)', paddingTop: 'var(--space-lg)', marginTop: 'var(--space-xl)', textAlign: 'center' }}>
            <p className="text-sm text-muted">© 2025 Melody Fashion Style. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart drawer & product detail */}
      <Cart />
      {selectedProduct && <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
