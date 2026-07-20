import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { formatFRW } from '../utils/helpers';
import api from '../api/axios';
import {
  FiPackage, FiTrendingUp, FiShoppingCart, FiAlertTriangle,
  FiArrowDown, FiArrowUp, FiClock
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#ff6eb4', '#b87ff5', '#4dd9c0', '#ffd166', '#74b3f8', '#ff8c6b'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, c, t, cat] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/sales-chart?days=30'),
          api.get('/dashboard/top-products?limit=5'),
          api.get('/dashboard/categories'),
        ]);
        setStats(s.data);
        setChartData(c.data);
        setTopProducts(t.data);
        setCategories(cat.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="loader"><div className="spinner" /></div>
    </AdminLayout>
  );

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: FiPackage, color: 'purple', format: 'num' },
    { label: "Today's Sales", value: stats?.todaySalesAmount || 0, icon: FiTrendingUp, color: 'pink', format: 'frw' },
    { label: 'Monthly Revenue', value: stats?.monthSalesAmount || 0, icon: FiArrowUp, color: 'teal', format: 'frw' },
    { label: 'Stock Value', value: stats?.totalStockValue || 0, icon: FiArrowDown, color: 'yellow', format: 'frw' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: FiShoppingCart, color: 'blue', format: 'num' },
    { label: 'Low Stock Items', value: stats?.lowStockCount || 0, icon: FiAlertTriangle, color: 'coral', format: 'num' },
  ];

  return (
    <AdminLayout title="Dashboard">

          {/* Welcome banner */}
          <div className="dashboard-banner">
            <div>
              <h2 className="dashboard-banner-title">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
              </h2>
              <p className="dashboard-banner-sub">Here's what's happening at Melody Fashion Style today</p>
            </div>
            <div className="dashboard-banner-date">
              <FiClock />
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            {statCards.map(({ label, value, icon: Icon, color, format }) => (
              <div key={label} className="stat-card">
                <div className={`stat-icon stat-icon-${color}`}>
                  <Icon />
                </div>
                <div className="stat-info">
                  <p className="stat-value">
                    {format === 'frw' ? formatFRW(value) : value.toLocaleString()}
                  </p>
                  <p className="stat-label">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="dashboard-charts">
            {/* Sales Area Chart */}
            <div className="card chart-card">
              <h3 className="chart-title">Sales Last 30 Days</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6eb4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff6eb4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#606080" tick={{ fontSize: 11 }}
                    tickFormatter={d => d.slice(5)} />
                  <YAxis stroke="#606080" tick={{ fontSize: 11 }}
                    tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#a0a0be' }}
                    formatter={(v) => [formatFRW(v), 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#ff6eb4" strokeWidth={2} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="card chart-card chart-card-sm">
              <h3 className="chart-title">Stock by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%"
                    outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    formatter={(v, n) => [v, n]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#a0a0be' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products & Alerts */}
          <div className="dashboard-bottom">
            {/* Top Products */}
            <div className="card">
              <h3 className="chart-title">Best Selling Products</h3>
              <div className="top-products-list">
                {topProducts.length === 0 && <p className="text-muted text-sm">No sales data yet</p>}
                {topProducts.map((p, i) => (
                  <div key={i} className="top-product-item">
                    <div className="top-product-rank">{i + 1}</div>
                    <div className="top-product-img">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.productName} />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>
                    <div className="top-product-info">
                      <p className="top-product-name">{p.productName}</p>
                      <p className="top-product-cat text-muted text-xs">{p.category}</p>
                    </div>
                    <div className="top-product-stats">
                      <p className="top-product-sold">{p.totalSold} sold</p>
                      <p className="top-product-revenue text-muted text-xs">{formatFRW(p.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="chart-title">Stock Overview</h3>
              <div className="stock-overview">
                <div className="stock-overview-item">
                  <span className="stock-overview-label">Total Units</span>
                  <span className="stock-overview-value">{stats?.totalStockUnits?.toLocaleString()}</span>
                </div>
                <div className="stock-overview-item">
                  <span className="stock-overview-label">Out of Stock</span>
                  <span className="stock-overview-value text-danger">{stats?.outOfStockCount}</span>
                </div>
                <div className="stock-overview-item">
                  <span className="stock-overview-label">Low Stock</span>
                  <span className="stock-overview-value text-warning">{stats?.lowStockCount}</span>
                </div>
                <div className="stock-overview-item">
                  <span className="stock-overview-label">Total Orders</span>
                  <span className="stock-overview-value">{stats?.totalOrders}</span>
                </div>
                <div className="stock-overview-item">
                  <span className="stock-overview-label">All-Time Revenue</span>
                  <span className="stock-overview-value text-success">{formatFRW(stats?.totalRevenue)}</span>
                </div>
                <div className="stock-overview-item">
                  <span className="stock-overview-label">Monthly Purchases</span>
                  <span className="stock-overview-value">{formatFRW(stats?.monthPurchasesAmount)}</span>
                </div>
              </div>
            </div>
          </div>
    </AdminLayout>
  );
}
