import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  List,
  ListItem
} from '@mui/material';
import {
  Sensors as SensorsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Security as SecurityIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../api';

export default function LiveGateMonitor({ liveScans, config }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
        gap: 3,
        width: '100%',
        alignItems: 'start'
      }}
    >
      {/* Real-Time Live Feed Stream */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, width: '100%' }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                fontSize: { xs: '1rem', sm: '1.15rem' }
              }}
            >
              <Box
                className="pulse-dot"
                sx={{ width: 10, height: 10, bgcolor: 'primary.main', borderRadius: '50%' }}
              />
              Live RFID Gate Scanner Stream
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.2 }}>
              Real-time feed from gate hardware (ESP32 / RC522 Reader)
            </Typography>
          </Box>

          <Button
            variant={soundEnabled ? 'contained' : 'outlined'}
            color={soundEnabled ? 'success' : 'inherit'}
            size="small"
            startIcon={soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            onClick={() => setSoundEnabled(!soundEnabled)}
            sx={{ borderColor: 'divider', textTransform: 'none' }}
          >
            {soundEnabled ? 'Gate Sound: ON' : 'Gate Sound: MUTED'}
          </Button>
        </Stack>

        {/* Scans List / Empty State */}
        {liveScans.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 6, sm: 10 },
              px: 2,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: '#f8fafc'
            }}
          >
            <SensorsIcon sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.4, mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Waiting for incoming RFID scans...
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, mx: 'auto', mt: 0.5 }}>
              Tap any RFID card on your ESP32 gate reader or run the test scan simulator in your terminal.
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {liveScans.map((scan, index) => {
              const isPresent = scan.status === 'Present';
              const initial = scan.student?.fullName
                ? scan.student.fullName[0]
                : scan.student_name
                ? scan.student_name[0]
                : 'S';

              return (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: index === 0 ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.2s'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: isPresent ? 'success.50' : 'warning.50',
                        color: isPresent ? 'success.main' : 'warning.main',
                        fontWeight: 700,
                        width: 44,
                        height: 44
                      }}
                    >
                      {initial}
                    </Avatar>

                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>
                        {scan.student?.fullName || scan.student_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                        Class: <strong>{scan.student?.className || scan.class_name}</strong> | GR:{' '}
                        <strong>{scan.student?.grNo || 'N/A'}</strong> | Roll:{' '}
                        {scan.student?.rollNo || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Chip
                      icon={
                        isPresent ? (
                          <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                        ) : (
                          <ScheduleIcon sx={{ fontSize: '14px !important' }} />
                        )
                      }
                      label={scan.status || 'Present'}
                      size="small"
                      color={isPresent ? 'success' : 'warning'}
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                        color: 'text.secondary'
                      }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 13 }} />
                      {scan.time || scan.scan_time} ({scan.device || 'MAIN_GATE'})
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </List>
        )}
      </Paper>

      {/* ESP32 Gate Hardware Info Card */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
        >
          <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} /> ESP32 Gate Hardware Info
        </Typography>

        <Stack spacing={1.5} sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
              Endpoint:
            </Typography>
            <Chip
              label={`${API_BASE_URL}/api/rfid/scan`}
              size="small"
              sx={{ fontFamily: 'monospace', maxWidth: '100%' }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
              Method:
            </Typography>
            <Chip label="POST (JSON)" size="small" sx={{ fontWeight: 600 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
              API Key:
            </Typography>
            <Chip
              label={config?.deviceApiKey || 'SCHOOL_ATTENDANCE_SECRET_2026'}
              size="small"
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.25 }}>
              Cutoff (On-Time):
            </Typography>
            <Chip
              label={config?.onTimeCutoff || '08:15'}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
