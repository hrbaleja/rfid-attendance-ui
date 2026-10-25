import React, { useState } from 'react';
import api from '../api';
import { X, Send, CheckCircle2 } from 'lucide-react';

export default function ManualAttendanceModal({ isOpen, onClose, onRefresh }) {
  const [form, setForm] = useState({
    identifier: '',
    status: 'Present',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 8),
    send_sms: true,
    custom_message: ''
  });
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg(null);

    try {
      const res = await api.post('/api/attendance/manual', form);
      if (res.data.success) {
        setResultMsg({ type: 'success', text: res.data.message });
        setForm((prev) => ({ ...prev, identifier: '', custom_message: '' }));
        if (onRefresh) onRefresh();
        setTimeout(() => {
          onClose();
          setResultMsg(null);
        }, 1500);
      }
    } catch (err) {
      setResultMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card" style={{ width: '520px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Mark / Override Attendance Manually</h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
              Records attendance in MongoDB Atlas and dispatches parent alert.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none' }}><X size={20} color="#94a3b8" /></button>
        </div>

        {resultMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '14px',
              backgroundColor: resultMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: resultMsg.type === 'success' ? '#059669' : '#dc2626',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {resultMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              Student GR Number or RFID UID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GR1001 or E1F2A3B4"
              style={{ width: '100%' }}
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Status *</label>
              <select
                style={{ width: '100%' }}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Present">Present (On-Time)</option>
                <option value="Present (Late)">Present (Late)</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Reporting Time *</label>
              <input
                type="text"
                required
                style={{ width: '100%' }}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Date</label>
            <input
              type="date"
              style={{ width: '100%' }}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.send_sms}
                onChange={(e) => setForm({ ...form, send_sms: e.target.checked })}
              />
              Send Alert to Parent (Fast2SMS & WhatsApp)
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              Optional One-Time Custom Message Override:
            </label>
            <textarea
              rows="3"
              placeholder="Leave blank to use default template, or write custom text here..."
              style={{ width: '100%', fontSize: '13px' }}
              value={form.custom_message}
              onChange={(e) => setForm({ ...form, custom_message: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '9px 16px', borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#2563eb', color: '#fff', padding: '9px 18px', borderRadius: '8px', fontWeight: '600' }}
            >
              <Send size={15} />
              {loading ? 'Recording...' : 'Record & Send Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
