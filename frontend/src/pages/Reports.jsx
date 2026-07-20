import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';
import { formatFRW, formatDate } from '../utils/helpers';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiPackage,
  FiCalendar, FiBarChart2, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import './Dashboard.css';


const COLORS = ['#ff6eb4', '#b87ff5', '#4dd9c0', '#ffd166', '#74b3f8', '#ff8c6b'];

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem'
    }}>
      <p style={{ color: '#a0a0be', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {prefix === 'FRW' ? formatFRW(p.value) : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeSection, setActiveSection] = useState('overview');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, t, cat, tx] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/dashboard/sales-chart?days=${days}`),
        api.get('/dashboard/top-products?limit=10'),
        api.get('/dashboard/categories'),
        api.get('/transactions?limit=50&type=stock_out'),
      ]);
      setStats(s.data);
      setSalesChart(c.data);
      setTopProducts(t.data);
      setCategories(cat.data);
      setTransactions(tx.data.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build stock-in vs stock-out comparison from transactions
  const stockInData = salesChart.map(d => ({ ...d, purchases: 0 }));

  const sections = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'sales', label: 'Sales Analysis', icon: FiTrendingUp },
    { id: 'inventory', label: 'Inventory Report', icon: FiPackage },
    { id: 'products', label: 'Top Products', icon: FiDollarSign },
  ];

  if (loading) return (
    <AdminLayout title="Reports">
      <div className="loader"><div className="spinner" /></div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Reports">

          {/* Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Analytics & Reports</h2>
              <p className="page-subtitle">Track your business performance and trends</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <select className="form-control" style={{ width: 160 }}
                value={days} onChange={e => setDays(Number(e.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last 12 months</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={fetchAll} title="Refresh">
                <FiRefreshCw />
              </button>
            </div>
          </div>

          {/* Section nav */}
          <div className="report-sections">
            {sections.map(({ id, label, icon: Icon }) => (
              <button key={id}
                className={`report-section-btn ${activeSection === id ? 'active' : ''}`}
                onClick={() => setActiveSection(id)}>
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* ════ OVERVIEW ════ */}
          {activeSection === 'overview' && (
            <div className="fade-in">
              {/* KPI Cards */}
              <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                {[
                  { label: 'Total Revenue', value: stats?.totalRevenue || 0, icon: FiTrendingUp, color: 'pink', format: 'frw', sub: 'All time' },
                  { label: "This Month's Sales", value: stats?.monthSalesAmount || 0, icon: FiDollarSign, color: 'teal', format: 'frw', sub: `${stats?.monthSalesCount || 0} transactions` },
                  { label: "Today's Sales", value: stats?.todaySalesAmount || 0, icon: FiCalendar, color: 'purple', format: 'frw', sub: `${stats?.todaySalesCount || 0} sales today` },
                  { label: 'Total Products', value: stats?.totalProducts || 0, icon: FiPackage, color: 'blue', format: 'num', sub: `${stats?.totalStockUnits || 0} units in stock` },
                  { label: 'Stock Value', value: stats?.totalStockValue || 0, icon: FiDollarSign, color: 'yellow', format: 'frw', sub: 'Cost price basis' },
                  { label: 'Monthly Purchases', value: stats?.monthPurchasesAmount || 0, icon: FiTrendingDown, color: 'coral', format: 'frw', sub: 'Stock purchased this month' },
                ].map(({ label, value, icon: Icon, color, format, sub }) => (
                  <div key={label} className="stat-card">
                    <div className={`stat-icon stat-icon-${color}`}><Icon /></div>
                    <div className="stat-info">
                      <p className="stat-value">{format === 'frw' ? formatFRW(value) : value.toLocaleString()}</p>
                      <p className="stat-label">{label}</p>
                      {sub && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales trend chart */}
              <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="chart-title">Sales Trend — Last {days} Days</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={salesChart}>
                    <defs>
                      <linearGradient id="salesGradR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6eb4" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ff6eb4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip prefix="FRW" />} />
                    <Area type="monotone" dataKey="sales" name="Sales" stroke="#ff6eb4" strokeWidth={2.5} fill="url(#salesGradR)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Two cards: categories pie + stock overview */}
              <div className="dashboard-charts">
                <div className="card chart-card">
                  <h3 className="chart-title">Stock by Category</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={categories} dataKey="count" nameKey="category"
                        cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                        {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                        formatter={(v, n) => [v, n]} />
                      <Legend wrapperStyle={{ fontSize: 11, color: '#a0a0be' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card chart-card chart-card-sm">
                  <h3 className="chart-title">Business Health</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingTop: 'var(--space-sm)' }}>
                    {[
                      { label: 'Total Orders', value: stats?.totalOrders, suffix: 'orders', color: 'var(--accent-blue)' },
                      { label: 'Pending Orders', value: stats?.pendingOrders, suffix: 'pending', color: 'var(--accent-yellow)' },
                      { label: 'Low Stock Items', value: stats?.lowStockCount, suffix: 'items', color: 'var(--accent-coral)' },
                      { label: 'Out of Stock', value: stats?.outOfStockCount, suffix: 'items', color: 'var(--danger)' },
                      { label: 'Total Stock Units', value: stats?.totalStockUnits?.toLocaleString(), suffix: 'units', color: 'var(--accent-teal)' },
                    ].map(({ label, value, suffix, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--brand-border)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontWeight: 700, color, fontSize: '1rem' }}>
                          {value} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{suffix}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ SALES ANALYSIS ════ */}
          {activeSection === 'sales' && (
            <div className="fade-in">
              {/* Daily count bar chart */}
              <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="chart-title">Daily Transaction Count</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis stroke="#606080" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Transactions" fill="#b87ff5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue bar chart */}
              <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="chart-title">Daily Revenue</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                    <YAxis stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip prefix="FRW" />} />
                    <Bar dataKey="sales" name="Revenue" fill="#4dd9c0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent transactions table */}
              <div className="card">
                <h3 className="chart-title" style={{ marginBottom: 'var(--space-lg)' }}>Recent Sales</h3>
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>By</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 20).map(t => (
                        <tr key={t._id}>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {t.product?.name || '—'}
                          </td>
                          <td>{t.quantity}</td>
                          <td>{formatFRW(t.unitPrice)}</td>
                          <td style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{formatFRW(t.totalAmount)}</td>
                          <td className="text-sm">{t.createdBy?.name || '—'}</td>
                          <td className="text-xs text-muted">{formatDate(t.createdAt)}</td>
                        </tr>
                      ))}
                      {transactions.length === 0 && (
                        <tr><td colSpan={6}>
                          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <div className="empty-state-icon">📊</div>
                            <p className="empty-state-title">No sales data yet</p>
                          </div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ INVENTORY REPORT ════ */}
          {activeSection === 'inventory' && (
            <div className="fade-in">
              {/* Category value breakdown */}
              <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="chart-title">Category Inventory Value</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="category" stroke="#606080" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip content={<CustomTooltip prefix="FRW" />} />
                    <Bar dataKey="totalValue" name="Stock Value" fill="#ffd166" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category table */}
              <div className="card">
                <h3 className="chart-title" style={{ marginBottom: 'var(--space-lg)' }}>Category Breakdown</h3>
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Total Units</th>
                        <th>Stock Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c, i) => (
                        <tr key={c.category}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: COLORS[i % COLORS.length], flexShrink: 0
                              }} />
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.category}</span>
                            </div>
                          </td>
                          <td>{c.count}</td>
                          <td style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{c.totalQuantity?.toLocaleString()}</td>
                          <td style={{ color: 'var(--accent-yellow)', fontWeight: 600 }}>{formatFRW(c.totalValue)}</td>
                        </tr>
                      ))}
                      {categories.length === 0 && (
                        <tr><td colSpan={4}>
                          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <div className="empty-state-icon">📦</div>
                            <p className="empty-state-title">No inventory data</p>
                          </div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ TOP PRODUCTS ════ */}
          {activeSection === 'products' && (
            <div className="fade-in">
              {/* Revenue bar chart */}
              <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="chart-title">Top Products by Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#606080" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="productName" stroke="#606080" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CustomTooltip prefix="FRW" />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#ff6eb4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Units sold bar chart */}
              <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="chart-title">Top Products by Units Sold</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#606080" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="productName" stroke="#606080" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalSold" name="Units Sold" fill="#4dd9c0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="card">
                <h3 className="chart-title" style={{ marginBottom: 'var(--space-lg)' }}>Product Performance Table</h3>
                <div className="table-wrapper" style={{ border: 'none' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                        <th>Avg. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={i}>
                          <td>
                            <div className="top-product-rank">{i + 1}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt={p.productName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                                : <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--brand-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🛍️</div>
                              }
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem' }}>{p.productName}</span>
                            </div>
                          </td>
                          <td><span className="badge badge-purple">{p.category}</span></td>
                          <td style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{p.totalSold}</td>
                          <td style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>{formatFRW(p.revenue)}</td>
                          <td className="text-muted">{formatFRW(p.totalSold > 0 ? Math.round(p.revenue / p.totalSold) : 0)}</td>
                        </tr>
                      ))}
                      {topProducts.length === 0 && (
                        <tr><td colSpan={6}>
                          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <div className="empty-state-icon">🛍️</div>
                            <p className="empty-state-title">No sales data yet</p>
                          </div>
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
    </AdminLayout>
  );
}
