import React, { useState } from 'react';
import api, { API_BASE_URL } from '../api';
import { Save, Bell, Zap, Shield, Key } from 'lucide-react';

export default function SettingsPanel({ config, setConfig, onRefresh }) {
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/api/config', config);
      if (res.data.success) {
        alert('School configuration updated successfully in MongoDB Atlas!');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert('Save error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerDaily = async () => {
    if (!confirm('Mark all unscanned students today as Absent and dispatch daily reports to teachers and principal now?')) return;
    setActionLoading(true);
    try {
      const res = await api.post('/api/attendance/trigger-daily-cutoff');
      alert(res.data.message);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerMonthly = async () => {
    if (!confirm('Calculate current month statistics and dispatch monthly teacher and principal reports now?')) return;
    setActionLoading(true);
    try {
      const res = await api.post('/api/attendance/trigger-monthly-reports');
      alert(res.data.message);
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTarget) return alert('Please enter target email address.');
    setTestEmailLoading(true);
    setTestEmailStatus(null);
    try {
      const res = await api.post('/api/config/test-email', { targetEmail: testEmailTarget });
      setTestEmailStatus({ success: true, message: res.data.message });
    } catch (e) {
      setTestEmailStatus({ success: false, message: e.message });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const appendTag = (field, tag) => {
    setConfig({
      ...config,
      [field]: (config[field] || '') + ' ' + tag
    });
  };

  if (!config) return <div className="card" style={{ padding: '30px', textAlign: 'center' }}>Loading configuration...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
      {/* Settings Form */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>School Configuration & Cutoff Timings</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Changes are stored permanently in MongoDB Atlas and take effect immediately.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Official School Name</label>
              <input
                type="text"
                style={{ width: '100%' }}
                value={config.schoolName || ''}
                onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Principal Mobile Number (Receives Reports)</label>
              <input
                type="text"
                placeholder="10-digit number"
                style={{ width: '100%' }}
                value={config.principalPhone || ''}
                onChange={(e) => setConfig({ ...config, principalPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Smart Low-Cost Alert Strategy Selector */}
          <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e40af', marginBottom: '6px' }}>
              📢 Low-Cost Parent Alert Delivery Mode
            </label>
            <select
              style={{ width: '100%', fontWeight: '700', padding: '10px', fontSize: '14px' }}
              value={config.notificationChannel || 'BOTH'}
              onChange={(e) => setConfig({ ...config, notificationChannel: e.target.value })}
            >
              <option value="BOTH">📱 BOTH (Send Fast2SMS + WhatsApp Simultaneously)</option>
              <option value="WHATSAPP_FIRST_FALLBACK">⚡ SMART COST-SAVER: WhatsApp First (₹0) ➔ SMS Fallback only if needed (Saves 85%+ Cost!)</option>
              <option value="WHATSAPP_ONLY">💬 WHATSAPP ONLY (100% Free — ₹0 per message)</option>
              <option value="SMS_ONLY">📨 CELLULAR SMS ONLY (Fast2SMS)</option>
            </select>
            <span style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '6px', display: 'block' }}>
              💡 <strong>Smart Cost-Saver Mode</strong> sends WhatsApp messages first (free). If a parent doesn't have a smartphone or delivery fails, it automatically sends a Fast2SMS backup so no parent is left behind!
            </span>
          </div>

          {/* School Timings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#16a34a' }}>
                On-Time Cutoff (HH:mm)
              </label>
              <input
                type="text"
                style={{ width: '100%', fontWeight: '700' }}
                value={config.onTimeCutoff || '08:15'}
                onChange={(e) => setConfig({ ...config, onTimeCutoff: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>Scans &lt;= this time = Present</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#dc2626' }}>
                Absent Cutoff (HH:mm)
              </label>
              <input
                type="text"
                style={{ width: '100%', fontWeight: '700' }}
                value={config.absentCutoff || '09:00'}
                onChange={(e) => setConfig({ ...config, absentCutoff: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>Unscanned marked Absent</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2563eb' }}>
                Monthly Report Time
              </label>
              <input
                type="text"
                style={{ width: '100%', fontWeight: '700' }}
                value={config.monthlyReportTime || '09:30'}
                onChange={(e) => setConfig({ ...config, monthlyReportTime: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'block' }}>Last day of month report</span>
            </div>
          </div>

          {/* SMS / WhatsApp Templates */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>
                Parent Message: Present (On-Time)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['{STUDENT_NAME}', '{CLASS}', '{TIME}', '{DATE}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => appendTag('smsTemplatePresent', tag)}
                    style={{ fontSize: '10.5px', padding: '2px 6px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px' }}
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', fontSize: '13px' }}
              value={config.smsTemplatePresent || ''}
              onChange={(e) => setConfig({ ...config, smsTemplatePresent: e.target.value })}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#d97706' }}>
                Parent Message: Present (Late)
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['{STUDENT_NAME}', '{CLASS}', '{TIME}', '{DATE}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => appendTag('smsTemplateLate', tag)}
                    style={{ fontSize: '10.5px', padding: '2px 6px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px' }}
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', fontSize: '13px' }}
              value={config.smsTemplateLate || ''}
              onChange={(e) => setConfig({ ...config, smsTemplateLate: e.target.value })}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>
                Parent Message: Absent
              </label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['{STUDENT_NAME}', '{CLASS}', '{DATE}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => appendTag('smsTemplateAbsent', tag)}
                    style={{ fontSize: '10.5px', padding: '2px 6px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px' }}
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows="2"
              style={{ width: '100%', fontSize: '13px' }}
              value={config.smsTemplateAbsent || ''}
              onChange={(e) => setConfig({ ...config, smsTemplateAbsent: e.target.value })}
            />
          </div>

          {/* Gmail SMTP Email Notifications Settings */}
          <div style={{ padding: '18px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#166534', margin: 0 }}>
                  📧 Gmail SMTP Parent Email Alerts (100% Free)
                </h4>
                <p style={{ fontSize: '12px', color: '#15803d', margin: '2px 0 0 0' }}>
                  Sends instant branded HTML attendance alert cards directly to parent inboxes.
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#166534' }}>
                <input
                  type="checkbox"
                  checked={config.emailNotificationsEnabled !== false}
                  onChange={(e) => setConfig({ ...config, emailNotificationsEnabled: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                Email Alerts Enabled
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                  Sender Gmail Account
                </label>
                <input
                  type="email"
                  style={{ width: '100%', fontSize: '13px' }}
                  value={config.smtpUser || 'beriyahiren008@gmail.com'}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                  Google App Password (16-char)
                </label>
                <input
                  type="password"
                  style={{ width: '100%', fontSize: '13px', fontFamily: 'monospace' }}
                  value={config.smtpPass || 'awlqcninfdwpldbu'}
                  onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                  Sender Display Name
                </label>
                <input
                  type="text"
                  style={{ width: '100%', fontSize: '13px' }}
                  value={config.emailFromName || 'RFID ATTENDANCE'}
                  onChange={(e) => setConfig({ ...config, emailFromName: e.target.value })}
                />
              </div>
            </div>

            {/* Optional Resend HTTPS API Key */}
            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                Optional Resend HTTPS API Key (Recommended for Railway — Never blocked by cloud firewall)
              </label>
              <input
                type="text"
                placeholder="re_xxxxxxxxxxxxxxxxxxxx (Optional - Free at resend.com)"
                style={{ width: '100%', fontSize: '13px', fontFamily: 'monospace' }}
                value={config.resendApiKey || ''}
                onChange={(e) => setConfig({ ...config, resendApiKey: e.target.value })}
              />
              <span style={{ fontSize: '11px', color: '#15803d', marginTop: '2px', display: 'block' }}>
                💡 Cloud hosts like Railway block raw SMTP ports (465/587). Adding a free Resend key sends emails instantly over HTTPS (Port 443) with 0 timeout!
              </span>
            </div>

            {/* Test Email Dispatcher */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>Send Test Alert To:</span>
              <input
                type="email"
                placeholder="Target test email"
                value={testEmailTarget}
                onChange={(e) => setTestEmailTarget(e.target.value)}
                style={{ width: '220px', fontSize: '12px', padding: '6px 10px' }}
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testEmailLoading}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}
              >
                {testEmailLoading ? 'Sending...' : '⚡ Send Test Email'}
              </button>
              {testEmailStatus && (
                <span style={{ fontSize: '12px', fontWeight: '600', color: testEmailStatus.success ? '#15803d' : '#dc2626' }}>
                  {testEmailStatus.success ? '✓ ' + testEmailStatus.message : '✗ ' + testEmailStatus.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px'
            }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings to MongoDB Atlas'}
          </button>
        </form>
      </div>

      {/* Manual Automation Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} color="#f59e0b" /> Manual Report Dispatch
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '14px' }}>
            Normally automated by background cron jobs. You can trigger them anytime on demand:
          </p>

          <button
            onClick={handleTriggerDaily}
            disabled={actionLoading}
            style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '10px'
            }}
          >
            📲 Run Daily Cutoff & Send SMS Now
          </button>

          <button
            onClick={handleTriggerMonthly}
            disabled={actionLoading}
            style={{
              width: '100%',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            📅 Send Monthly Reports Now
          </button>
        </div>

        <div className="card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="#2563eb" /> Device Authentication
          </h3>
          <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
            <p><strong>Hardware Secret Key:</strong></p>
            <code style={{ display: 'block', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontWeight: '700', marginTop: '4px' }}>
              {config.deviceApiKey || 'SCHOOL_ATTENDANCE_SECRET_2026'}
            </code>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
              Used by ESP32 firmware in <code>api_key</code> field to authorize scans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
