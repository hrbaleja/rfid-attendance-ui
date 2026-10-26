import React, { useState } from 'react';
import api from '../api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Alert,
  Stack,
  Grid
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  EditNote as EditNoteIcon
} from '@mui/icons-material';

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditNoteIcon sx={{ color: 'primary.main' }} /> Mark Attendance Manually
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            Records attendance in MongoDB and optionally dispatches parent alert.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {resultMsg && (
            <Alert severity={resultMsg.type} sx={{ mb: 2.5, borderRadius: 2 }}>
              {resultMsg.text}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              fullWidth
              size="small"
              required
              label="Student GR Number or RFID UID"
              placeholder="e.g. GR1001 or E1F2A3B4"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Attendance Status</InputLabel>
                  <Select
                    label="Attendance Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <MenuItem value="Present">Present (On-Time)</MenuItem>
                    <MenuItem value="Present (Late)">Present (Late)</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Reporting Time (HH:mm:ss)"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.send_sms}
                  onChange={(e) => setForm({ ...form, send_sms: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Send Instant Alert to Parent (SMS & WhatsApp)
                </Typography>
              }
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Optional Custom Message Override"
              placeholder="Leave blank to use default template, or write custom note here..."
              value={form.custom_message}
              onChange={(e) => setForm({ ...form, custom_message: e.target.value })}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading} endIcon={<SendIcon />}>
            {loading ? 'Recording...' : 'Record & Send Alert'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
