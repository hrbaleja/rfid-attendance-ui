import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Badge as BadgeIcon,
  Add as AddIcon,
  DeleteForever as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

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
    if (!window.confirm(`Remove teacher assignment for Class ${className}?`)) return;
    try {
      await api.delete(`/api/teachers/${id}`);
      fetchTeachers();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header Card with Right-Aligned Action Button */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, width: '100%' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BadgeIcon sx={{ color: 'primary.main' }} /> Class Teachers Directory ({teachers.length})
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Class Teachers receive automated daily & monthly attendance summaries via SMS & WhatsApp.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              ml: { sm: 'auto' },
              width: { xs: '100%', sm: 'auto' },
              height: 40,
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            Add Class Teacher
          </Button>
        </Stack>
      </Paper>

      {/* Teachers Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%' }}>
        <TableContainer sx={{ maxHeight: 600, width: '100%' }}>
          <Table stickyHeader size="small" sx={{ width: '100%', minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Teacher Full Name</TableCell>
                <TableCell>Mobile Number (Alerts Recipient)</TableCell>
                <TableCell>Email Address</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Loading assigned teachers...
                  </TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No class teachers assigned yet.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((t) => (
                  <TableRow key={t._id} hover>
                    <TableCell>
                      <Chip label={`Class ${t.className}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{t.teacherName}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.phone}</TableCell>
                    <TableCell>{t.email || '-'}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(t._id, t.className)}
                        title="Delete Teacher"
                        sx={{ bgcolor: '#fff1f2', '&:hover': { bgcolor: '#ffe4e6' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Assign Teacher Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Assign Class Teacher
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                size="small"
                required
                label="Class Name"
                placeholder="e.g. 9A, 10B"
                value={form.className}
                onChange={(e) => setForm({ ...form, className: e.target.value.toUpperCase() })}
              />

              <TextField
                fullWidth
                size="small"
                required
                label="Teacher Full Name"
                placeholder="Teacher Full Name"
                value={form.teacherName}
                onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
              />

              <TextField
                fullWidth
                size="small"
                required
                label="Teacher Mobile (10-Digit)"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <TextField
                fullWidth
                size="small"
                label="Teacher Email (Optional)"
                type="email"
                placeholder="teacher@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Assignment
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
