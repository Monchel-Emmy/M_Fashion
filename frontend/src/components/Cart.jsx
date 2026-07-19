import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatFRW } from '../utils/helpers';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiX, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import './Cart.css';

export default function Cart() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQty, clearCart, cartTotal, cartCount } = useCart();
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onCheckout = async (formData) => {
    setLoading(true);
    try {
      const items = cart.map(item => ({
        product: item._id,
        quantity: item.cartQty,
        size: item.size || '',
        color: item.color || '',
      }));

      const { data } = await api.post('/orders', {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          address: formData.address || undefined,
        },
        items,
        paymentMethod: formData.paymentMethod || 'cash',
        notes: formData.notes || undefined,
      });

      setOrder(data);
      setStep('success');
      clearCart();
      reset();
      toast.success('Order placed successfully! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Order failed, try again');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-backdrop" onClick={e => e.target === e.currentTarget && setIsOpen(false)}>
      <div className="cart-drawer">
        <div className="cart-header">
          <h3 className="cart-title">
            {step === 'cart' && `Your Cart (${cartCount})`}
            {step === 'checkout' && 'Checkout'}
            {step === 'success' && '✅ Order Placed!'}
          </h3>
          <button className="modal-close" onClick={() => { setIsOpen(false); setStep('cart'); }}>
            <FiX />
          </button>
        </div>

        <div className="cart-body">
          {/* Cart Items */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-2xl) 0' }}>
                  <div className="empty-state-icon">🛒</div>
                  <p className="empty-state-title">Your cart is empty</p>
                  <p className="empty-state-text">Browse our products and add items</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={`${item._id}-${item.size}-${item.color}`} className="cart-item">
                        <div className="cart-item-img">
                          {item.images?.[0] ? <img src={item.images[0]} alt={item.name} /> : <span>🛍️</span>}
                        </div>
                        <div className="cart-item-info">
                          <p className="cart-item-name">{item.name}</p>
                          <p className="cart-item-meta">
                            {item.size && `Size: ${item.size}`}{item.color && ` · ${item.color}`}
                          </p>
                          <p className="cart-item-price">{formatFRW(item.sellingPrice)}</p>
                          <div className="cart-qty-controls">
                            <button onClick={() => updateQty(item._id, item.size, item.color, item.cartQty - 1)}>
                              <FiMinus />
                            </button>
                            <span>{item.cartQty}</span>
                            <button onClick={() => updateQty(item._id, item.size, item.color, item.cartQty + 1)}>
                              <FiPlus />
                            </button>
                          </div>
                        </div>
                        <div className="cart-item-right">
                          <p className="cart-item-total">{formatFRW(item.sellingPrice * item.cartQty)}</p>
                          <button className="cart-remove" onClick={() => removeFromCart(item._id, item.size, item.color)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total">
                    <span>Total</span>
                    <span className="cart-total-amount">{formatFRW(cartTotal)}</span>
                  </div>
                  <button className="btn btn-primary btn-lg w-full" onClick={() => setStep('checkout')}>
                    Proceed to Checkout
                  </button>
                </>
              )}
            </>
          )}

          {/* Checkout */}
          {step === 'checkout' && (
            <form onSubmit={handleSubmit(onCheckout)}>
              <div className="cart-order-summary">
                <p className="form-label">Order Summary</p>
                {cart.map(item => (
                  <div key={`${item._id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                    <span className="text-secondary">{item.name} ×{item.cartQty}</span>
                    <span>{formatFRW(item.sellingPrice * item.cartQty)}</span>
                  </div>
                ))}
                <div className="cart-total" style={{ borderTop: '1px solid var(--brand-border)', paddingTop: 12, marginTop: 8 }}>
                  <span className="font-semibold">Total</span>
                  <span className="cart-total-amount">{formatFRW(cartTotal)}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className={`form-control ${errors.name ? 'input-error' : ''}`} placeholder="Your full name"
                  {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className={`form-control ${errors.phone ? 'input-error' : ''}`} placeholder="+250 7XX XXX XXX"
                  {...register('phone', { required: 'Phone is required' })} />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Email (optional)</label>
                <input type="email" className="form-control" placeholder="email@example.com"
                  {...register('email')} />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <input className="form-control" placeholder="Your delivery address"
                  {...register('address')} />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-control" {...register('paymentMethod')}>
                  <option value="cash">💵 Cash</option>
                  <option value="momo">📱 Mobile Money (MoMo)</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order Notes</label>
                <textarea className="form-control" rows={2} placeholder="Any special requests..."
                  {...register('notes')} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 'var(--space-md)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep('cart')}>Back</button>
                <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Placing Order...' : `Place Order · ${formatFRW(cartTotal)}`}
                </button>
              </div>
            </form>
          )}

          {/* Success */}
          {step === 'success' && order && (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎉</div>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 8 }}>Order Placed!</h3>
              <p className="text-secondary" style={{ marginBottom: 'var(--space-lg)' }}>
                Thank you! Your order has been received.
              </p>
              <div style={{ background: 'var(--brand-surface2)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
                <p className="text-muted text-sm">Order Number</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'monospace' }}>
                  {order.orderNumber}
                </p>
                <p className="text-sm text-muted" style={{ marginTop: 4 }}>
                  Save this number to track your order
                </p>
              </div>
              <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                Total: <strong style={{ color: 'var(--accent-teal)' }}>{formatFRW(order.totalAmount)}</strong>
              </p>
              <button className="btn btn-primary w-full" onClick={() => { setIsOpen(false); setStep('cart'); }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
