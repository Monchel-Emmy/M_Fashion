import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (e) { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditing(null); reset({}); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s);
    reset({ name: s.name, contactPerson: s.contactPerson, email: s.email, phone: s.phone, address: s.address, notes: s.notes });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/suppliers/${editing._id}`, data);
        toast.success('Supplier updated');
      } else {
        await api.post('/suppliers', data);
        toast.success('Supplier added');
      }
      setShowModal(false);
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove supplier "${name}"?`)) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Supplier removed');
      fetch();
    } catch (e) { toast.error('Failed to remove'); }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title="Suppliers" />
        <div className="page-content fade-in">
          <div className="page-header">
            <div>
              <h2 className="page-title">Supplier Management</h2>
              <p className="page-subtitle">{suppliers.length} active suppliers</p>
            </div>
            <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Supplier</button>
          </div>

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : suppliers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚚</div>
              <p className="empty-state-title">No suppliers yet</p>
              <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add First Supplier</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
              {suppliers.map(s => (
                <div key={s._id} className="card" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                    <div style={{ width: 44, height: 44, background: 'var(--gradient-brand)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white', fontWeight: 700 }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(s)}><FiEdit2 /></button>
                      <button className="btn btn-icon btn-sm" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)' }} onClick={() => handleDelete(s._id, s.name)}><FiTrash2 /></button>
                    </div>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>{s.name}</h4>
                  {s.contactPerson && <p className="text-sm text-muted">👤 {s.contactPerson}</p>}
                  {s.phone && <p className="text-sm text-muted">📞 {s.phone}</p>}
                  {s.email && <p className="text-sm text-muted">✉️ {s.email}</p>}
                  {s.address && <p className="text-sm text-muted">📍 {s.address}</p>}
                  {s.notes && <p className="text-xs text-muted" style={{ marginTop: 8, padding: '6px 8px', background: 'var(--brand-surface2)', borderRadius: 'var(--radius-sm)' }}>{s.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Supplier Name *</label>
                  <input className={`form-control ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Fashion Wholesale Ltd"
                    {...register('name', { required: 'Name is required' })} />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-control" placeholder="Contact name" {...register('contactPerson')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" placeholder="+250 7XX XXX XXX" {...register('phone')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="supplier@example.com" {...register('email')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-control" placeholder="Physical address" {...register('address')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} placeholder="Any additional notes..." {...register('notes')} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
