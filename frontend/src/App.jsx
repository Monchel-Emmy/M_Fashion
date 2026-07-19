import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Storefront from './pages/Storefront';
import Login from './pages/Login';

// Admin pages
import Dashboard from './pages/Dashboard';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Transactions from './pages/Transactions';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Users from './pages/Users';

import './pages/Transaction.css';
import './pages/Inventory.css';
import './pages/Orders.css';


export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1a1a24',
                color: '#f0f0f8',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#4dd9c0', secondary: '#0a0a0f' } },
              error:   { iconTheme: { primary: '#ff6b6b', secondary: '#0a0a0f' } },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Storefront />} />
            <Route path="/login" element={<Login />} />

            {/* Admin — protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/admin/stock-in" element={
              <ProtectedRoute><StockIn /></ProtectedRoute>
            } />
            <Route path="/admin/stock-out" element={
              <ProtectedRoute><StockOut /></ProtectedRoute>
            } />
            <Route path="/admin/transactions" element={
              <ProtectedRoute><Transactions /></ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/admin/suppliers" element={
              <ProtectedRoute adminOnly><Suppliers /></ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute><Reports /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly><Users /></ProtectedRoute>
            } />

            {/* Redirect old inventory URL */}
            <Route path="/admin/inventory" element={<Navigate to="/admin/stock-in" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
