import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatFRW, getCategoryEmoji } from '../utils/helpers';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import './ProductDetail.css';

export default function ProductDetail({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const handleAdd = () => {
    addToCart(product, selectedSize, selectedColor, qty);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="product-detail-modal">
        <button className="modal-close" style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }} onClick={onClose}>
          <FiX />
        </button>

        <div className="product-detail-layout">
          {/* Images */}
          <div className="product-detail-images">
            <div className="product-detail-main-img">
              {product.images?.[imgIdx] ? (
                <img src={product.images[imgIdx]} alt={product.name} />
              ) : (
                <div className="product-img-placeholder" style={{ height: '100%' }}>
                  {getCategoryEmoji(product.category)}
                </div>
              )}
              {product.quantity === 0 && (
                <div className="product-out-of-stock-overlay">
                  <span className="product-out-of-stock-label">Out of Stock</span>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="product-detail-thumbnails">
                {product.images.map((img, i) => (
                  <div key={i} className={`thumbnail ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={img} alt={`${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <p className="product-category" style={{ marginBottom: 8 }}>
              {getCategoryEmoji(product.category)} {product.category} · {product.gender}
            </p>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 'var(--space-md)' }}>
              {product.name}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                {formatFRW(product.sellingPrice)}
              </p>
              <span className={`badge ${product.quantity === 0 ? 'badge-danger' : product.quantity <= product.lowStockThreshold ? 'badge-warning' : 'badge-success'}`}>
                {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} in stock`}
              </span>
            </div>

            {product.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 'var(--space-lg)' }}>
                {product.description}
              </p>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <p className="form-label">Select Size</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <button key={s} className={`size-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <p className="form-label">Select Color</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} className={`color-btn ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <p className="form-label">Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(Math.min(product.quantity, qty + 1))}>+</button>
                <span className="text-xs text-muted">({formatFRW(product.sellingPrice * qty)} total)</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              disabled={product.quantity === 0}
              onClick={handleAdd}
              style={{ gap: 10 }}
            >
              <FiShoppingCart />
              {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {product.sku && (
              <p className="text-xs text-muted" style={{ marginTop: 'var(--space-md)' }}>SKU: {product.sku}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
