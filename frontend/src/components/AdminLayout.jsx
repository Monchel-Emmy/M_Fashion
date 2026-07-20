import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * AdminLayout wraps all admin pages with the sidebar + topbar.
 * It manages the mobile sidebar open/close state here so every page
 * automatically gets the hamburger menu behaviour on phones.
 */
export default function AdminLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <div className="page-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
