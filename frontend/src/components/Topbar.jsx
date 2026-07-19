import { FiBell, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

export default function Topbar({ title }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <FiSearch className="topbar-search-icon" />
          <input type="text" placeholder="Search..." className="topbar-search-input" />
        </div>
        <button className="topbar-notif">
          <FiBell />
          <span className="topbar-notif-dot" />
        </button>
        <div className="topbar-user">
          <div className="topbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="topbar-user-info">
            <p className="topbar-user-name">{user?.name}</p>
            <p className="topbar-user-role">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
