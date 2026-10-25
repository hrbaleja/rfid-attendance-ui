import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserCheck, Plus, Trash2, X } from 'lucide-react';

export default function TeacherDirectory() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    className: '',
    teacherName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/teachers');
      if (res.data.success) {
        setTeachers(res.data.teachers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/teachers', form);
      if (res.data.success) {
        alert(res.data.message);
        setIsModalOpen(false);
        setForm({ className: '', teacherName: '', phone: '', email: '' });
        fetchTeachers();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, className) => {
    if (!confirm(`Remove teacher assignment for Class ${className}?`)) return;
    try {
      await api.delete(`/api/teachers/${id}`);
      fetchTeachers();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={22} color="#2563eb" /> Class Teachers Directory ({teachers.length})
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Class Teachers receive daily and monthly attendance reports via SMS/WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            backgroundColor: '#2563eb',
            color: '#fff',
            padding: '9px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <Plus size={15} /> Add / Update Class Teacher
        </button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Teacher Name</th>
              <th>Mobile Number (Receives Reports)</th>
              <th>Email</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No class teachers assigned yet.</td></tr>
            ) : (
              teachers.map((t) => (
                <tr key={t._id}>
                  <td><span className="badge badge-rfid" style={{ fontSize: '13px' }}>Class {t.className}</span></td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{t.teacherName}</td>
                  <td style={{ fontWeight: '600' }}>{t.phone}</td>
                  <td>{t.email || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(t._id, t.className)}
                      style={{ background: 'none', color: '#dc2626', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Assign Class Teacher</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none' }}><X size={20} color="#94a3b8" /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9A, 10B"
                  style={{ width: '100%' }}
                  value={form.className}
                  onChange={(e) => setForm({ ...form, className: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Teacher Full Name"
                  style={{ width: '100%' }}
                  value={form.teacherName}
                  onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Teacher Mobile (10-Digit) *</label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  style={{ width: '100%' }}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="teacher@school.edu.in"
                  style={{ width: '100%' }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '9px 16px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#2563eb', color: '#fff', padding: '9px 18px', borderRadius: '8px', fontWeight: '600' }}
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
