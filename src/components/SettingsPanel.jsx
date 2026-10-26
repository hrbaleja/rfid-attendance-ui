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
  Send as SendIcon,
  Tune as TuneIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Message as MessageIcon,
  NotificationsActive as NotificationsActiveIcon,
  CalendarMonth as CalendarMonthIcon,
  PhoneAndroid as PhoneAndroidIcon,
  Chat as ChatIcon,
  Sms as SmsIcon,
  FlashOn as FlashOnIcon,
  Info as InfoIcon
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
      const errMsg = e.response?.data?.message || e.message;
      setTestEmailStatus({ success: false, message: errMsg });
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
        <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <TuneIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          School Configuration & Cutoff Timings
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Settings are stored in MongoDB Atlas and take effect immediately.
        </Typography>

        <Box component="form" onSubmit={handleSave}>
          <Stack spacing={3}>
            {/* School Details */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                School Information
              </Typography>
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
            </Paper>

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
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CampaignIcon sx={{ fontSize: 20 }} />
                Low-Cost Parent Alert Delivery Mode
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={config.notificationChannel || 'BOTH'}
                  onChange={(e) => setConfig({ ...config, notificationChannel: e.target.value })}
                  sx={{ bgcolor: '#ffffff', fontWeight: 600 }}
                >
                  <MenuItem value="BOTH">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneAndroidIcon fontSize="small" sx={{ color: 'primary.main' }} />
                      <span>BOTH (Fast2SMS + WhatsApp Simultaneously)</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="WHATSAPP_FIRST_FALLBACK">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FlashOnIcon fontSize="small" sx={{ color: 'warning.main' }} />
                      <span>SMART COST-SAVER: WhatsApp First (₹0) → SMS Fallback only if needed (Saves 85%+)</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="WHATSAPP_ONLY">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ChatIcon fontSize="small" sx={{ color: 'success.main' }} />
                      <span>WHATSAPP ONLY (100% Free — ₹0 per message)</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="SMS_ONLY">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SmsIcon fontSize="small" sx={{ color: 'info.main' }} />
                      <span>CELLULAR SMS ONLY (Fast2SMS)</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 1.25 }}>
                <InfoIcon sx={{ fontSize: 16, color: '#1d4ed8', mt: '2px', flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: '#1d4ed8' }}>
                  <strong>Smart Cost-Saver Mode</strong> sends WhatsApp messages first (free). If parent doesn't have WhatsApp or delivery fails, it dispatches an SMS backup automatically.
                </Typography>
              </Stack>
            </Paper>

            {/* Cutoff Timings */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MessageIcon sx={{ fontSize: 18, color: 'primary.main' }} />
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

            {/* Gmail / Brevo / Resend Email Alerts Box */}
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 20 }} />
                    Automated Parent Email Notifications
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803d' }}>
                    Sends instant HTML attendance report cards directly to parent inboxes upon scan.
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

              {/* Cloud Hosting Notice */}
              <Alert severity="info" sx={{ mb: 2.5, fontSize: '0.8rem', bgcolor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                <strong>Cloud Server Notice (Railway):</strong> Railway blocks raw SMTP ports (465/587). To ensure emails deliver seamlessly on Railway, enter a free <strong>Brevo API Key</strong> (<a href="https://brevo.com" target="_blank" rel="noreferrer" style={{ color: '#047857', fontWeight: 600 }}>brevo.com</a> - 300 free/day) or <strong>Resend API Key</strong> (<a href="https://resend.com" target="_blank" rel="noreferrer" style={{ color: '#047857', fontWeight: 600 }}>resend.com</a>) below. For local testing, Gmail SMTP works directly.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Brevo (Sendinblue) API Key (Recommended for Cloud)"
                    placeholder="xkeysib-..."
                    value={config.brevoApiKey || ''}
                    onChange={(e) => setConfig({ ...config, brevoApiKey: e.target.value })}
                    helperText="Free 300 emails/day, no custom domain required"
                    InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Resend API Key (Alternative HTTPS API)"
                    placeholder="re_..."
                    value={config.resendApiKey || ''}
                    onChange={(e) => setConfig({ ...config, resendApiKey: e.target.value })}
                    helperText="Free 100 emails/day over HTTPS Port 443"
                    InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    label="Sender Email / Gmail User"
                    value={config.smtpUser || ''}
                    onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Gmail App Password"
                    value={config.smtpPass || ''}
                    onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                    InputProps={{ sx: { fontFamily: 'monospace' } }}
                    helperText="Used for local or unblocked SMTP delivery"
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
              <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #dcfce7' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Enter test email (e.g. hiteshbaleja@gmail.com)"
                    value={testEmailTarget}
                    onChange={(e) => setTestEmailTarget(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 340 } }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={testEmailLoading}
                    onClick={handleSendTestEmail}
                    startIcon={<SendIcon />}
                    sx={{ width: { xs: '100%', sm: 'auto' }, height: 38, px: 2.5 }}
                  >
                    {testEmailLoading ? 'Dispatching...' : 'Send Test Email'}
                  </Button>
                </Stack>
                {testEmailStatus && (
                  <Alert
                    severity={testEmailStatus.success ? 'success' : 'error'}
                    sx={{ mt: 1.5, fontSize: '0.82rem' }}
                  >
                    {testEmailStatus.message}
                  </Alert>
                )}
              </Box>
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
              startIcon={<NotificationsActiveIcon sx={{ color: 'primary.main' }} />}
              sx={{ borderColor: 'divider', textTransform: 'none', py: 1, justifyContent: 'flex-start', px: 2 }}
            >
              Run Daily Cutoff & Dispatch Reports
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              disabled={actionLoading}
              onClick={handleTriggerMonthly}
              startIcon={<CalendarMonthIcon sx={{ color: 'primary.main' }} />}
              sx={{ borderColor: 'divider', textTransform: 'none', py: 1, justifyContent: 'flex-start', px: 2 }}
            >
              Dispatch Monthly Reports Now
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
