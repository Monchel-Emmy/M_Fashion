import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiArrowDown, FiArrowUp, FiList,
  FiTruck, FiBarChart2, FiShoppingCart, FiUsers, FiLogOut, FiX
} from 'react-icons/fi';
import './Sidebar.css';

const navItems = [
  { to: '/admin/dashboard',    label: 'Dashboard',    icon: FiGrid },
  { to: '/admin/stock-in',     label: 'Stock In',     icon: FiArrowDown },
  { to: '/admin/stock-out',    label: 'Stock Out',    icon: FiArrowUp },
  { to: '/admin/transactions', label: 'Transactions', icon: FiList },
  { to: '/admin/orders',       label: 'Orders',       icon: FiShoppingCart },
  { to: '/admin/suppliers',    label: 'Suppliers',    icon: FiTruck },
  { to: '/admin/reports',      label: 'Reports',      icon: FiBarChart2 },
];

const adminItems = [
  { to: '/admin/users', label: 'Users', icon: FiUsers },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when nav link is clicked
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Mobile close button */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <FiX />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">MF</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">Melody Fashion</span>
            <span className="sidebar-tagline">Style</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Main Menu</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <Icon className="sidebar-link-icon" />
              <span>{label}</span>
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <p className="sidebar-section-label">Admin</p>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <Icon className="sidebar-link-icon" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}

          <p className="sidebar-section-label">Storefront</p>
          <NavLink to="/" className="sidebar-link" target="_blank" onClick={handleNavClick}>
            <FiShoppingCart className="sidebar-link-icon" />
            <span>View Store</span>
          </NavLink>
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>
    </>
  );
}
