import React, { useState } from 'react';
import { Radio, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Volume2, VolumeX, Smartphone, Trash2 } from 'lucide-react';
import api, { API_BASE_URL } from '../api';

export default function LiveGateMonitor({ liveScans, config, onClearScans, onRefresh }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearTodayScans = async () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const confirmPrompt = window.confirm(
      `⚠️ Clear today's attendance records (${todayStr}) for testing?\n\n` +
      `This will DELETE all scans recorded today so you can tap cards on your ESP32 reader and test again.`
    );
    if (!confirmPrompt) return;

    setClearing(true);
    try {
      const res = await api.post('/api/attendance/clear-day', { date: todayStr });
      if (res.data.success) {
        alert(res.data.message);
        if (onClearScans) onClearScans();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(`Error clearing attendance: ${err.message}`);
    } finally {
      setClearing(false);
    }
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* Real-Time Live Feed */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="pulse-dot"></span> Live RFID Gate Scanner Stream
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Real-time feed from gate hardware (ESP32 / RC522 Reader)
            </p>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '6px 12px',
              backgroundColor: soundEnabled ? '#ecfdf5' : '#f1f5f9',
              color: soundEnabled ? '#059669' : '#64748b',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {soundEnabled ? 'Gate Sound: ON' : 'Gate Sound: MUTED'}
          </button>
        </div>

        {liveScans.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: '#94a3b8',
              border: '2px dashed #e2e8f0',
              borderRadius: '12px'
            }}
          >
            <Radio size={48} style={{ margin: '0 auto 14px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#64748b' }}>
              Waiting for incoming RFID scans...
            </p>
            <p style={{ fontSize: '13px', marginTop: '6px', maxWidth: '380px', margin: '6px auto 0' }}>
              Tap any RFID card on your ESP32 gate reader or run the test scan simulator in your terminal.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {liveScans.map((scan, idx) => {
              const isPresent = scan.status === 'Present';
              return (
                <div
                  key={idx}
                  className="animate-slide-in"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: `5px solid ${isPresent ? '#16a34a' : '#d97706'}`,
                    borderRadius: '10px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: isPresent ? '#dcfce7' : '#fef3c7',
                        color: isPresent ? '#15803d' : '#b45309',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '15px'
                      }}
                    >
                      {scan.student?.fullName ? scan.student.fullName[0] : 'S'}
                    </div>

                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                        {scan.student?.fullName || scan.student_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                        Class: <strong>{scan.student?.className || scan.class_name}</strong> | GR No: <strong>{scan.student?.grNo || 'N/A'}</strong> | Roll No: {scan.student?.rollNo || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={isPresent ? 'badge badge-present' : 'badge badge-late'}>
                      {scan.status}
                    </span>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Clock size={12} /> {scan.time || scan.scan_time} ({scan.device || 'MAIN_GATE'})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hardware Connection Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#2563eb" /> ESP32 Gate Hardware Info
          </h3>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>
            <div><strong>Endpoint:</strong> <code>{API_BASE_URL}/api/rfid/scan</code></div>
            <div style={{ marginTop: '4px' }}><strong>Method:</strong> <code>POST (JSON)</code></div>
            <div style={{ marginTop: '4px' }}><strong>API Key:</strong> <code>{config?.deviceApiKey || 'SCHOOL_ATTENDANCE_SECRET_2026'}</code></div>
            <div style={{ marginTop: '4px' }}><strong>Cutoff (On-Time):</strong> <code>{config?.onTimeCutoff || '08:15'}</code></div>
          </div>
        </div>

        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={18} color="#16a34a" /> Live Parent Alerts
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
            Whenever a card is scanned, parents receive an instant personalized notification via <strong>Fast2SMS</strong> and <strong>WhatsApp</strong>.
          </p>
          <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#334155' }}>
            ⚡ <strong>Test Student Card UIDs:</strong>
            <div style={{ marginTop: '4px' }}>• <code>E1F2A3B4</code>: Aarav Patel (9A)</div>
            <div>• <code>A1B2C3D4</code>: Diya Sharma (9A)</div>
            <div>• <code>C5D6E7F8</code>: Rohan Verma (9A)</div>
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              onClick={handleClearTodayScans}
              disabled={clearing}
              style={{
                width: '100%',
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: clearing ? 'not-allowed' : 'pointer',
                opacity: clearing ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={15} />
              {clearing ? 'Clearing Scans...' : "Clear Today's Attendance (Testing)"}
            </button>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
              Reset today's logs to test cards multiple times
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
