import React, { useState } from 'react';
import api, { API_BASE_URL } from '../api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Campaign as CampaignIcon,
  Bolt as BoltIcon,
  VpnKey as KeyIcon,
  Email as EmailIcon,
  Send as SendIcon
} from '@mui/icons-material';

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
    if (!window.confirm('Mark all unscanned students today as Absent and dispatch daily reports to teachers and principal now?')) return;
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
    if (!window.confirm('Calculate current month statistics and dispatch monthly teacher and principal reports now?')) return;
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

  if (!config) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Loading configuration...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
        gap: 3,
        width: '100%',
        alignItems: 'start'
      }}
    >
      {/* Settings Form Column */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
            School Configuration & Cutoff Timings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Settings are stored in MongoDB Atlas and take effect immediately.
          </Typography>

          <Box component="form" onSubmit={handleSave}>
            <Stack spacing={3}>
              {/* School Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Official School Name"
                    value={config.schoolName || ''}
                    onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Principal Mobile (Receives Reports)"
                    placeholder="10-digit number"
                    value={config.principalPhone || ''}
                    onChange={(e) => setConfig({ ...config, principalPhone: e.target.value })}
                  />
                </Grid>
              </Grid>

              {/* Delivery Channel Selector */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#eff6ff',
                  border: '1px solid #bfdbfe'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 1 }}>
                  📢 Low-Cost Parent Alert Delivery Mode
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={config.notificationChannel || 'BOTH'}
                    onChange={(e) => setConfig({ ...config, notificationChannel: e.target.value })}
                    sx={{ bgcolor: '#ffffff', fontWeight: 600 }}
                  >
                    <MenuItem value="BOTH">📱 BOTH (Fast2SMS + WhatsApp Simultaneously)</MenuItem>
                    <MenuItem value="WHATSAPP_FIRST_FALLBACK">
                      ⚡ SMART COST-SAVER: WhatsApp First (₹0) ➔ SMS Fallback only if needed (Saves 85%+)
                    </MenuItem>
                    <MenuItem value="WHATSAPP_ONLY">💬 WHATSAPP ONLY (100% Free — ₹0 per message)</MenuItem>
                    <MenuItem value="SMS_ONLY">📨 CELLULAR SMS ONLY (Fast2SMS)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" sx={{ color: '#1d4ed8', mt: 1, display: 'block' }}>
                  💡 <strong>Smart Cost-Saver Mode</strong> sends WhatsApp messages first (free). If parent doesn't have WhatsApp or delivery fails, it dispatches an SMS backup automatically.
                </Typography>
              </Paper>

              {/* Cutoff Timings */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Gate Cutoff Timers (24-Hour HH:mm)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="On-Time Cutoff"
                      value={config.onTimeCutoff || '08:15'}
                      onChange={(e) => setConfig({ ...config, onTimeCutoff: e.target.value })}
                      helperText="Scans <= this time = Present"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Absent Cutoff"
                      value={config.absentCutoff || '09:00'}
                      onChange={(e) => setConfig({ ...config, absentCutoff: e.target.value })}
                      helperText="Unscanned marked Absent"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Monthly Report Time"
                      value={config.monthlyReportTime || '09:30'}
                      onChange={(e) => setConfig({ ...config, monthlyReportTime: e.target.value })}
                      helperText="Last day of month report"
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Message Templates */}
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Personalized Notification Templates
                </Typography>

                {/* Present On-Time Template */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                      Present (On-Time) Template
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {['{STUDENT_NAME}', '{CLASS}', '{TIME}', '{DATE}'].map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          clickable
                          onClick={() => appendTag('smsTemplatePresent', tag)}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    value={config.smsTemplatePresent || ''}
                    onChange={(e) => setConfig({ ...config, smsTemplatePresent: e.target.value })}
                  />
                </Box>

                {/* Present Late Template */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      Present (Late) Template
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {['{STUDENT_NAME}', '{CLASS}', '{TIME}', '{DATE}'].map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          clickable
                          onClick={() => appendTag('smsTemplateLate', tag)}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    value={config.smsTemplateLate || ''}
                    onChange={(e) => setConfig({ ...config, smsTemplateLate: e.target.value })}
                  />
                </Box>

                {/* Absent Template */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.main' }}>
                      Absent Alert Template
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {['{STUDENT_NAME}', '{CLASS}', '{DATE}'].map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          clickable
                          onClick={() => appendTag('smsTemplateAbsent', tag)}
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    value={config.smsTemplateAbsent || ''}
                    onChange={(e) => setConfig({ ...config, smsTemplateAbsent: e.target.value })}
                  />
                </Box>
              </Stack>

              {/* Gmail / Resend Email Alerts Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0'
                }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                      📧 Gmail & Cloud Parent Email Alerts
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803d' }}>
                      Sends instant HTML attendance report cards directly to parent inboxes.
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.emailNotificationsEnabled !== false}
                        onChange={(e) => setConfig({ ...config, emailNotificationsEnabled: e.target.checked })}
                        color="success"
                      />
                    }
                    label={<Typography variant="caption" sx={{ fontWeight: 700, color: '#166534' }}>Email Alerts Enabled</Typography>}
                  />
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="email"
                      label="Sender Gmail User"
                      value={config.smtpUser || ''}
                      onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="Google App Password"
                      value={config.smtpPass || ''}
                      onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                      InputProps={{ sx: { fontFamily: 'monospace' } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sender Display Name"
                      value={config.emailFromName || 'RFID ATTENDANCE'}
                      onChange={(e) => setConfig({ ...config, emailFromName: e.target.value })}
                    />
                  </Grid>
                </Grid>

                {/* Test Email Dispatcher */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #dcfce7' }}>
                  <TextField
                    size="small"
                    placeholder="Enter test email address"
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 260 } }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={testEmailLoading}
                    onClick={handleSendTestEmail}
                    startIcon={<SendIcon />}
                    sx={{ width: { xs: '100%', sm: 'auto' }, height: 38 }}
                  >
                    {testEmailLoading ? 'Sending...' : 'Send Test Email'}
                  </Button>
                  {testEmailStatus && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: testEmailStatus.success ? 'success.dark' : 'error.main'
                      }}
                    >
                      {testEmailStatus.success ? '✓ ' + testEmailStatus.message : '✗ ' + testEmailStatus.message}
                    </Typography>
                  )}
                </Stack>
              </Paper>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Save Settings to MongoDB Atlas'}
              </Button>
            </Stack>
          </Box>
        </Paper>

      {/* Right Column: Actions & Device Key */}
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        {/* Manual Cron Trigger Card */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BoltIcon sx={{ color: 'warning.main', fontSize: 20 }} /> Manual Report Trigger
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 2 }}>
              Automated in the background via cron. You can trigger reports manually anytime:
            </Typography>

            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                disabled={actionLoading}
                onClick={handleTriggerDaily}
                sx={{ borderColor: 'divider', textTransform: 'none', py: 1 }}
              >
                📲 Run Daily Cutoff & Dispatch Reports
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                disabled={actionLoading}
                onClick={handleTriggerMonthly}
                sx={{ borderColor: 'divider', textTransform: 'none', py: 1 }}
              >
                📅 Dispatch Monthly Reports Now
              </Button>
            </Stack>
          </Paper>

          {/* Device Authentication */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <KeyIcon sx={{ color: 'primary.main', fontSize: 20 }} /> Device Authentication
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Hardware Security Key:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1.25,
                bgcolor: '#f1f5f9',
                borderRadius: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {config.deviceApiKey || 'SCHOOL_ATTENDANCE_SECRET_2026'}
            </Paper>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
              Used by ESP32 firmware in <code>DEVICE_API_KEY</code> to authenticate card scans.
            </Typography>
          </Paper>
        </Stack>
    </Box>
  );
}
