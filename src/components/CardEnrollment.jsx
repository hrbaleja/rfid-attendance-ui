import React, { useState, useEffect } from 'react';
import api from '../api';
import { socket } from '../socket';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Stack,
  Divider,
  Avatar
} from '@mui/material';
import {
  Contactless as ContactlessIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';

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
    parentPhone: '',
    parentEmail: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const handleUnregisteredCard = (data) => {
      if (data?.uid) {
        setDetectedUid(data.uid);
        setFormData((prev) => ({ ...prev, rfidUid: data.uid }));
      }
    };

    socket.on('UNREGISTERED_CARD_DETECTED', handleUnregisteredCard);

    return () => {
      socket.off('UNREGISTERED_CARD_DETECTED', handleUnregisteredCard);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.post('/api/students', formData);
      if (res.data.success) {
        setSuccessMsg(
          `Card [${formData.rfidUid}] successfully assigned to ${formData.fullName} (${formData.className})!`
        );
        setFormData({
          rfidUid: '',
          fullName: '',
          grNo: '',
          rollNo: '',
          className: '9A',
          gender: 'Boy',
          dob: '',
          parentName: '',
          parentPhone: '',
          parentEmail: ''
        });
        setDetectedUid('');
        if (onStudentAdded) onStudentAdded();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Tap-to-Detect Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              width: 50,
              height: 50,
              borderRadius: 2.5
            }}
          >
            <ContactlessIcon sx={{ fontSize: 28, color: '#ffffff' }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
              RFID Card Enrollment Studio
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.825rem' }}>
              Assign new physical RFID smart cards to students with live tap-to-detect.
            </Typography>
          </Box>
        </Box>

        {/* Live Card Detector Box */}
        <Box
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 2.5,
            px: 2,
            py: 1.25,
            width: { xs: '100%', sm: 'auto' },
            textAlign: { xs: 'left', sm: 'right' }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              justifyContent: { xs: 'flex-start', sm: 'flex-end' }
            }}
          >
            <Box
              className="pulse-dot"
              sx={{ width: 8, height: 8, bgcolor: '#4ade80', borderRadius: '50%' }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.9 }}>
              Live Card Detector:
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
              mt: 0.2
            }}
          >
            {detectedUid ? `DETECTED: ${detectedUid}` : 'Ready — Tap Card on Reader'}
          </Typography>
        </Box>
      </Paper>

      {/* Main Grid: Form on Left, Digital Preview on Right */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' },
          gap: 3,
          width: '100%',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Enrollment Form */}
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, width: '100%' }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
          >
            <SparklesIcon sx={{ color: 'primary.main', fontSize: 20 }} /> Student Details & Card
            Assignment
          </Typography>

          {successMsg && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              {successMsg}
            </Alert>
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {/* RFID UID Field */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}
                >
                  RFID CARD UID (HEX) *
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    placeholder="e.g. E1F2A3B4"
                    value={formData.rfidUid}
                    onChange={(e) =>
                      setFormData({ ...formData, rfidUid: e.target.value.toUpperCase().trim() })
                    }
                    InputProps={{
                      sx: { fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }
                    }}
                  />
                  {detectedUid && (
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      onClick={() => setFormData({ ...formData, rfidUid: detectedUid })}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Use Detected
                    </Button>
                  )}
                </Stack>
              </Box>

              {/* Name & GR */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
                  gap: 2
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Full Student Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="GR Number"
                  value={formData.grNo}
                  onChange={(e) =>
                    setFormData({ ...formData, grNo: e.target.value.toUpperCase().trim() })
                  }
                />
              </Box>

              {/* Class, Roll, Gender */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                  gap: 2
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select
                    label="Class"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  >
                    <MenuItem value="9A">Class 9A</MenuItem>
                    <MenuItem value="10A">Class 10A</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Roll Number"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <MenuItem value="Boy">Boy</MenuItem>
                    <MenuItem value="Girl">Girl</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Parent Contact Information */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Parent Contact & Alert Channels
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Parent / Guardian Name"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                />
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Parent Mobile (SMS/WhatsApp)"
                  placeholder="e.g. 9876543210"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                type="email"
                label="Parent Email Address"
                placeholder="parent@example.com"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.3, fontWeight: 700, mt: 1 }}
              >
                {loading ? 'Registering Student...' : 'Assign & Activate RFID Card'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Right Column: Visual Smart Card Graphic Preview Only */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary', mb: 2 }}>
            Live Smart Card Graphic Preview
          </Typography>

          <Box
            sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 3.5,
              p: 3,
              color: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glow accent */}
            <Box
              sx={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            {/* Card Top */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                {config?.schoolName || 'SARDAR PATEL VIDYALAYA'}
              </Typography>
              <Chip
                label="RFID CARD"
                size="small"
                sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 800, fontSize: '0.65rem' }}
              />
            </Box>

            {/* Card Chip & Student Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              {/* Gold chip graphic */}
              <Box
                sx={{
                  width: 44,
                  height: 32,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: '1px solid #b45309',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 4,
                    border: '1px solid rgba(0,0,0,0.25)',
                    borderRadius: 0.5
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc', lineHeight: 1.2 }}>
                  {formData.fullName || 'STUDENT NAME'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'grey.400' }}>
                  Class: <strong>{formData.className || '9A'}</strong> | Roll:{' '}
                  <strong>{formData.rollNo || '-'}</strong>
                </Typography>
              </Box>
            </Box>

            {/* Card Bottom */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                pt: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'grey.500', textTransform: 'uppercase', fontSize: '0.65rem' }}
                >
                  GR Number
                </Typography>
                <Typography sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {formData.grNo || 'GR----'}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'grey.500', textTransform: 'uppercase', fontSize: '0.65rem' }}
                >
                  Card UID
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'primary.light',
                    fontSize: '0.9rem'
                  }}
                >
                  {formData.rfidUid || '--------'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
