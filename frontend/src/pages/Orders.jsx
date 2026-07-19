import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';
import { formatFRW, formatDateTime, getStatusBadge } from '../utils/helpers';
import toast from 'react-hot-toast';
import { FiEye } from 'react-icons/fi';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['unpaid', 'partial', 'paid'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.append('status', status);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id, newStatus, paymentStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status: newStatus, paymentStatus });
      toast.success('Order updated!');
      setOrders(prev => prev.map(o => o._id === id ? data : o));
      if (selectedOrder?._id === id) setSelectedOrder(data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Orders" />
        <div className="page-content fade-in">
          <div className="page-header">
            <div>
              <h2 className="page-title">Customer Orders</h2>
              <p className="page-subtitle">{total} total orders</p>
            </div>
          </div>

          {/* Filter */}
          <div className="card" style={{ display: 'flex', gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Status:</label>
            <select className="form-control" style={{ width: 180 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          <div className="orders-layout">
            {/* Table */}
            <div className="table-wrapper" style={{ flex: 1 }}>
              {loading ? (
                <div className="loader"><div className="spinner" /></div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🛒</div>
                  <p className="empty-state-title">No orders yet</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'monospace' }}>
                          {o.orderNumber}
                        </td>
                        <td>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{o.customer?.name}</p>
                          <p className="text-xs text-muted">{o.customer?.phone}</p>
                        </td>
                        <td>{o.items?.length} item(s)</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{formatFRW(o.totalAmount)}</td>
                        <td><span className={`badge ${getStatusBadge(o.status)}`}>{o.status}</span></td>
                        <td><span className={`badge ${getStatusBadge(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
                        <td className="text-xs text-muted">{formatDateTime(o.createdAt)}</td>
                        <td>
                          <button className="btn btn-icon btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setSelectedOrder(o); }}>
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Order Detail Panel */}
            {selectedOrder && (
              <div className="card order-detail-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                  <h3 style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{selectedOrder.orderNumber}</h3>
                  <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setSelectedOrder(null)}>✕</button>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <p className="text-xs text-muted">Customer</p>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-muted">{selectedOrder.customer?.phone}</p>
                  <p className="text-sm text-muted">{selectedOrder.customer?.email}</p>
                  <p className="text-sm text-muted">{selectedOrder.customer?.address}</p>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <p className="text-xs text-muted" style={{ marginBottom: 8 }}>Items</p>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--brand-border)', fontSize: '0.85rem' }}>
                      <div>
                        <p style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                        <p className="text-xs text-muted">{item.size && `Size: ${item.size}`} {item.color && `| ${item.color}`}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'var(--text-primary)' }}>×{item.quantity}</p>
                        <p className="text-xs text-muted">{formatFRW(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-teal)' }}>{formatFRW(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <p className="form-label">Update Order Status</p>
                  <select className="form-control" style={{ marginBottom: 8 }}
                    value={selectedOrder.status}
                    onChange={e => updateStatus(selectedOrder._id, e.target.value, undefined)}
                    disabled={updatingId === selectedOrder._id}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                  <p className="form-label">Payment Status</p>
                  <select className="form-control"
                    value={selectedOrder.paymentStatus}
                    onChange={e => updateStatus(selectedOrder._id, undefined, e.target.value)}
                    disabled={updatingId === selectedOrder._id}>
                    {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-xs text-muted">Notes</p>
                    <p className="text-sm text-secondary">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {total > 20 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
              <span className="pagination-info">Page {page} of {Math.ceil(total / 20)}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
