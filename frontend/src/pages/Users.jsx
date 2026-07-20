import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../api/axios';
import { formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FiUsers, FiUserPlus, FiEdit2, FiToggleLeft, FiToggleRight,
  FiX, FiCheck, FiShield, FiUser
} from 'react-icons/fi';

const ROLES = ['admin', 'staff'];

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  /* ── Form state ── */
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', password: '', isActive: true });
  const [saving, setSaving] = useState(false);

  /* ── New user form state ── */
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [adding, setAdding] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, password: '', isActive: u.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
      if (form.password) payload.password = form.password;
      await api.put(`/auth/users/${editUser._id}`, payload);
      toast.success('User updated!');
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async () => {
    if (!newForm.name || !newForm.email || !newForm.password) {
      return toast.error('All fields are required');
    }
    setAdding(true);
    try {
      await api.post('/auth/register', newForm);
      toast.success('User created successfully!');
      setShowAddModal(false);
      setNewForm({ name: '', email: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (u) => {
    if (u._id === currentUser?._id) return toast.error("You can't deactivate yourself");
    try {
      await api.put(`/auth/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (e) {
      toast.error('Failed to update user status');
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <AdminLayout title="Users">

          {/* Header */}
          <div className="page-header">
            <div>
              <h2 className="page-title">User Management</h2>
              <p className="page-subtitle">Manage staff accounts and permissions</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <FiUserPlus /> Add User
            </button>
          </div>

          {/* Stats */}
          <div className="users-stats">
            <div className="user-stat-card">
              <div className="stat-icon stat-icon-purple"><FiUsers /></div>
              <div className="stat-info">
                <p className="stat-value">{users.length}</p>
                <p className="stat-label">Total Users</p>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="stat-icon stat-icon-teal"><FiCheck /></div>
              <div className="stat-info">
                <p className="stat-value">{activeCount}</p>
                <p className="stat-label">Active</p>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="stat-icon stat-icon-pink"><FiShield /></div>
              <div className="stat-info">
                <p className="stat-value">{adminCount}</p>
                <p className="stat-label">Admins</p>
              </div>
            </div>
            <div className="user-stat-card">
              <div className="stat-icon stat-icon-blue"><FiUser /></div>
              <div className="stat-info">
                <p className="stat-value">{users.length - adminCount}</p>
                <p className="stat-label">Staff</p>
              </div>
            </div>
          </div>

          {/* Users grid */}
          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p className="empty-state-title">No users found</p>
              <p className="empty-state-text">Add the first user to get started</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map(u => (
                <div key={u._id} className={`user-card ${!u.isActive ? 'user-card-inactive' : ''}`}>
                  {/* Avatar */}
                  <div className="user-card-avatar" style={{
                    background: u.role === 'admin'
                      ? 'linear-gradient(135deg, #ff6eb4, #b87ff5)'
                      : 'linear-gradient(135deg, #4dd9c0, #74b3f8)'
                  }}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="user-card-info">
                    <div className="user-card-header">
                      <div>
                        <p className="user-card-name">{u.name}</p>
                        <p className="user-card-email">{u.email}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-pink' : 'badge-info'}`}>
                          {u.role === 'admin' ? <FiShield /> : <FiUser />} {u.role}
                        </span>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p className="user-card-date">Joined {formatDateTime(u.createdAt)}</p>

                    {/* Self-indicator */}
                    {u._id === currentUser?._id && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--accent-teal)', fontWeight: 600, marginTop: 4 }}>
                        ← You
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="user-card-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{
                        background: u.isActive ? 'rgba(255,107,107,0.1)' : 'rgba(77,217,192,0.1)',
                        color: u.isActive ? 'var(--danger)' : 'var(--success)',
                      }}
                      onClick={() => toggleActive(u)}
                      title={u.isActive ? 'Deactivate' : 'Activate'}
                      disabled={u._id === currentUser?._id}
                    >
                      {u.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* ── Edit User Modal ── */}
      {showModal && editUser && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              {/* Avatar preview */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: form.role === 'admin' ? 'linear-gradient(135deg, #ff6eb4, #b87ff5)' : 'linear-gradient(135deg, #4dd9c0, #74b3f8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {form.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-control" value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.isActive ? 'true' : 'false'}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password (leave blank to keep current)</label>
                <input className="form-control" type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Enter new password..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New User</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={newForm.name}
                  onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={newForm.email}
                  onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-control" type="password" value={newForm.password}
                  onChange={e => setNewForm(f => ({ ...f, password: e.target.value }))} placeholder="Set password..." />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={newForm.role}
                  onChange={e => setNewForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="new-user-role-hint">
                {newForm.role === 'admin'
                  ? '🛡️ Admin users have full access to all features including user management'
                  : '👤 Staff users can manage stock, orders, and products'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddUser} disabled={adding}>
                {adding ? 'Creating...' : '✨ Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
