import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';
import { formatFRW, formatDateTime, getCategoryEmoji } from '../utils/helpers';
import { FiArrowDown, FiArrowUp, FiFilter } from 'react-icons/fi';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, type, startDate, endDate]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <AdminLayout title="Transactions">

          <div className="page-header">
            <div>
              <h2 className="page-title">Transaction History</h2>
              <p className="page-subtitle">{total} total records</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            <select className="form-control" style={{ width: 160 }} value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="stock_in">📥 Stock In</option>
              <option value="stock_out">📤 Stock Out</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>From:</label>
              <input type="date" className="form-control" style={{ width: 160 }} value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>To:</label>
              <input type="date" className="form-control" style={{ width: 160 }} value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
            </div>
            {(type || startDate || endDate) && (
              <button className="btn btn-outline btn-sm" onClick={() => { setType(''); setStartDate(''); setEndDate(''); setPage(1); }}>
                Clear
              </button>
            )}
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loader"><div className="spinner" /></div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p className="empty-state-title">No transactions found</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Details</th>
                    <th>By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t._id}>
                      <td>
                        <span className={`badge ${t.type === 'stock_in' ? 'badge-success' : 'badge-pink'}`}>
                          {t.type === 'stock_in' ? <FiArrowDown /> : <FiArrowUp />}
                          {t.type === 'stock_in' ? ' Stock In' : ' Stock Out'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.1rem' }}>{getCategoryEmoji(t.product?.category)}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>
                            {t.product?.name || '—'}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.quantity}</td>
                      <td>{formatFRW(t.unitPrice)}</td>
                      <td style={{ fontWeight: 700, color: t.type === 'stock_in' ? 'var(--accent-teal)' : 'var(--accent-pink)' }}>
                        {formatFRW(t.totalAmount)}
                      </td>
                      <td className="text-xs text-muted">
                        {t.type === 'stock_in' && t.supplier?.name && <p>Supplier: {t.supplier.name}</p>}
                        {t.type === 'stock_in' && t.invoiceNumber && <p>Invoice: {t.invoiceNumber}</p>}
                        {t.type === 'stock_out' && t.customerName && <p>Customer: {t.customerName}</p>}
                        {t.order?.orderNumber && <p>Order: {t.order.orderNumber}</p>}
                        {t.notes && <p className="text-xs" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.notes}</p>}
                      </td>
                      <td className="text-sm">{t.createdBy?.name || '—'}</td>
                      <td className="text-xs text-muted">{formatDateTime(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {total > 20 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
              <span className="pagination-info">Page {page} of {Math.ceil(total / 20)}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</button>
            </div>
          )}
    </AdminLayout>
  );
}
