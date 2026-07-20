import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';
import { formatFRW, getCategoryEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FiArrowUp, FiAlertTriangle } from 'react-icons/fi';

export default function StockOut() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const watchProduct = watch('product');

  useEffect(() => {
    api.get('/products?limit=100&inStock=true').then(r => setProducts(r.data.products || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (watchProduct) {
      const p = products.find(p => p._id === watchProduct);
      setSelectedProduct(p);
      if (p) setUnitPrice(p.sellingPrice);
    }
  }, [watchProduct, products]);

  const onSubmit = async (data) => {
    if (selectedProduct && Number(data.quantity) > selectedProduct.quantity) {
      toast.error(`Only ${selectedProduct.quantity} units available`);
      return;
    }
    setLoading(true);
    try {
      await api.post('/transactions/stock-out', {
        product: data.product,
        quantity: Number(data.quantity),
        unitPrice: Number(data.unitPrice),
        customerName: data.customerName || undefined,
        notes: data.notes || undefined,
      });
      toast.success('✅ Sale recorded successfully!');
      reset();
      setSelectedProduct(null);
      setQty('');
      setUnitPrice('');
      // Refresh products
      api.get('/products?limit=100&inStock=true').then(r => setProducts(r.data.products || []));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const total = qty && unitPrice ? Number(qty) * Number(unitPrice) : 0;
  const stockAfter = selectedProduct && qty ? selectedProduct.quantity - Number(qty) : selectedProduct?.quantity;

  return (
    <AdminLayout title="Stock Out">

          <div className="page-header">
            <div>
              <h2 className="page-title">Record Sale (Stock Out)</h2>
              <p className="page-subtitle">Remove products from inventory when sold</p>
            </div>
          </div>

          <div className="transaction-layout">
            <div className="card transaction-form">
              <div className="transaction-form-header">
                <div className="transaction-icon" style={{ background: 'rgba(255,110,180,0.15)', color: 'var(--accent-pink)' }}>
                  <FiArrowUp style={{ fontSize: '1.4rem' }} />
                </div>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>New Sale Entry</h3>
                  <p className="text-sm text-muted">Fill in the sale details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">Select Product *</label>
                  <select className={`form-control ${errors.product ? 'input-error' : ''}`}
                    {...register('product', { required: 'Please select a product' })}>
                    <option value="">Choose product in stock...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>
                        {getCategoryEmoji(p.category)} {p.name} (Stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                  {errors.product && <p className="form-error">{errors.product.message}</p>}
                </div>

                {selectedProduct && selectedProduct.quantity <= selectedProduct.lowStockThreshold && (
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.3)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
                    <FiAlertTriangle style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>
                      Low stock warning: Only {selectedProduct.quantity} units left
                    </span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity Sold *</label>
                    <input type="number" className={`form-control ${errors.quantity ? 'input-error' : ''}`}
                      placeholder="0" min="1" max={selectedProduct?.quantity}
                      {...register('quantity', {
                        required: 'Required',
                        min: { value: 1, message: 'Min 1' },
                        max: { value: selectedProduct?.quantity || 99999, message: `Max ${selectedProduct?.quantity}` }
                      })}
                      onChange={e => setQty(e.target.value)} />
                    {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Selling Price (FRW) *</label>
                    <input type="number" className={`form-control ${errors.unitPrice ? 'input-error' : ''}`}
                      placeholder="0" min="0"
                      value={unitPrice}
                      {...register('unitPrice', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
                      onChange={e => setUnitPrice(e.target.value)} />
                    {errors.unitPrice && <p className="form-error">{errors.unitPrice.message}</p>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input className="form-control" placeholder="Walk-in customer (optional)"
                    {...register('customerName')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} placeholder="Any additional notes..."
                    {...register('notes')} />
                </div>

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
                      <span className="text-muted">Stock After Sale</span>
                      <span className={`font-semibold ${stockAfter < 0 ? 'text-danger' : stockAfter <= selectedProduct.lowStockThreshold ? 'text-warning' : 'text-success'}`}>
                        {stockAfter !== undefined ? stockAfter : '—'} units
                      </span>
                    </div>
                    <div className="transaction-summary-row transaction-summary-total">
                      <span>Total Sale Amount</span>
                      <span className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {formatFRW(total)}
                      </span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: 'var(--space-md)' }}>
                  {loading ? 'Processing...' : '✅ Confirm Stock Out'}
                </button>
              </form>
            </div>

            <div className="transaction-info-panel">
              <div className="card">
                <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
                  💡 Stock Out Guide
                </h4>
                <div className="info-steps">
                  {[
                    ['1', 'Select Product', 'Choose the product being sold'],
                    ['2', 'Enter Quantity', 'How many units were sold?'],
                    ['3', 'Set Selling Price', 'Price per unit sold'],
                    ['4', 'Customer Info', 'Optionally record customer name'],
                    ['5', 'Confirm', 'Stock will be reduced immediately'],
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
            </div>
          </div>
    </AdminLayout>
  );
}
