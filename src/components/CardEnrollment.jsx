import React, { useState, useEffect } from 'react';
import api from '../api';
import { socket } from '../socket';
import { CreditCard, CheckCircle2, AlertCircle, Smartphone, User, Sparkles, RefreshCw, Radio } from 'lucide-react';

export default function CardEnrollment({ config, onStudentAdded }) {
  const [detectedUid, setDetectedUid] = useState('');
  const [formData, setFormData] = useState({
    rfidUid: '',
    fullName: '',
    grNo: '',
    rollNo: '',
    className: '9A',
    gender: 'Boy',
    dob: '',
    parentName: '',
    parentPhone: '9664759611',
    parentEmail: 'hrbaleja.04@gmail.com'
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [recentCards, setRecentCards] = useState([]);

  useEffect(() => {
    // Listen for live unregistered cards tapped on ESP32 or desk reader!
    const handleUnregisteredCard = (data) => {
      if (data?.uid) {
        setDetectedUid(data.uid);
        setFormData((prev) => ({ ...prev, rfidUid: data.uid }));
      }
    };

    socket.on('UNREGISTERED_CARD_DETECTED', handleUnregisteredCard);
    fetchRecentStudents();

    return () => {
      socket.off('UNREGISTERED_CARD_DETECTED', handleUnregisteredCard);
    };
  }, []);

  const fetchRecentStudents = async () => {
    try {
      const res = await api.get('/api/students?limit=8');
      if (res.data.success) {
        setRecentCards(res.data.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.post('/api/students', formData);
      if (res.data.success) {
        setSuccessMsg(`Card [${formData.rfidUid}] successfully assigned to ${formData.fullName} (${formData.className})!`);
        setFormData({
          rfidUid: '',
          fullName: '',
          grNo: '',
          rollNo: '',
          className: '9A',
          gender: 'Boy',
          dob: '',
          parentName: '',
          parentPhone: '9664759611',
          parentEmail: 'hrbaleja.04@gmail.com'
        });
        setDetectedUid('');
        fetchRecentStudents();
        if (onStudentAdded) onStudentAdded();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner: Tap-to-Detect Feature */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CreditCard size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800' }}>RFID Card Enrollment Studio</h2>
            <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
              Assign new physical RFID smart cards to students with live tap-to-detect.
            </p>
          </div>
        </div>

        {/* Live Card Detector Box */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px',
            padding: '10px 18px',
            textAlign: 'right'
          }}
        >
          <div style={{ fontSize: '12px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <span className="pulse-dot" style={{ backgroundColor: '#4ade80' }}></span>
            <span>Live Card Detector:</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '1px', marginTop: '2px' }}>
            {detectedUid ? `DETECTED: ${detectedUid}` : 'Ready — Tap Card on Reader'}
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Digital ID Card Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Enrollment Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#2563eb" /> Student Details & Card Assignment
          </h3>

          {successMsg && (
            <div style={{ padding: '12px 16px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* RFID UID Field */}
            <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                RFID CARD UID (HEX) *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="Tap card on ESP32 or enter UID (e.g. 4A7B2C1D)"
                  value={formData.rfidUid}
                  onChange={(e) => setFormData({ ...formData, rfidUid: e.target.value.toUpperCase().trim() })}
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: '#2563eb',
                    letterSpacing: '1px'
                  }}
                />
                {detectedUid && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, rfidUid: detectedUid })}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    Apply Detected
                  </button>
                )}
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                💡 Tip: Tap any unassigned card on your ESP32 reader — the UID will automatically appear here!
              </span>
            </div>

            {/* Student Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rohan Rajesh Patel"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            {/* GR No, Roll No, Class */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>GR Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GR1025"
                  value={formData.grNo}
                  onChange={(e) => setFormData({ ...formData, grNo: e.target.value.toUpperCase().trim() })}
                  style={{ width: '100%', fontWeight: '700' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value.trim() })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Class / Div *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9A, 10B"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value.toUpperCase().trim() })}
                  style={{ width: '100%', fontWeight: '700' }}
                />
              </div>
            </div>

            {/* Gender, DOB, Parent Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Gender</label>
                <select
                  style={{ width: '100%' }}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Boy">Boy</option>
                  <option value="Girl">Girl</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Parent Email for Alerts */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                Parent Email (Instant Delivery) *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. hrbaleja.04@gmail.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            {/* Parent Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Parent / Guardian Name</label>
                <input
                  type="text"
                  placeholder="Father/Mother Name"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Parent Mobile (SMS/WhatsApp) *</label>
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value.trim() })}
                  style={{ width: '100%', fontWeight: '700' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                padding: '13px',
                borderRadius: '8px',
                fontSize: '14.5px',
                fontWeight: '700',
                marginTop: '10px'
              }}
            >
              <CreditCard size={18} />
              {loading ? 'Enrolling & Saving to Atlas...' : 'Enroll Card & Save Student'}
            </button>
          </form>
        </div>

        {/* Live Smart Card Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              Live Student Smart Card Preview
            </h4>

            {/* Physical ID Card Widget */}
            <div
              style={{
                width: '100%',
                height: '240px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#fff',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {/* Background Chip Watermark */}
              <div
                style={{
                  position: 'absolute',
                  right: '-20px',
                  bottom: '-20px',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)'
                }}
              />

              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🏫</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    {config?.schoolName || 'SARDAR PATEL VIDYALAYA'}
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#3b82f6', padding: '2px 8px', borderRadius: '4px' }}>
                  RFID CARD
                </span>
              </div>

              {/* Card Center: Chip Graphic + Student Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Gold RFID Chip Graphic */}
                <div
                  style={{
                    width: '42px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: '1px solid #b45309',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '2px' }} />
                </div>

                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px', color: '#f8fafc' }}>
                    {formData.fullName || 'STUDENT NAME'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Class: <strong style={{ color: '#fff' }}>{formData.className || '9A'}</strong> | Roll No: <strong style={{ color: '#fff' }}>{formData.rollNo || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer: GR No + UID Code */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>General Register</span>
                  <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'monospace' }}>
                    {formData.grNo || 'GR----'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Card UID</span>
                  <div style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'monospace', color: '#60a5fa' }}>
                    {formData.rfidUid || '--------'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Enrolled List */}
          <div className="card" style={{ padding: '18px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
              Recently Enrolled Students
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {recentCards.map((st) => (
                <div
                  key={st._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    fontSize: '12.5px'
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>{st.fullName}</strong>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{st.className} | GR: {st.grNo}</div>
                  </div>
                  <code style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>{st.rfidUid}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
