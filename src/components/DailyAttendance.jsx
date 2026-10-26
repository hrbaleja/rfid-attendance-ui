import React, { useState } from 'react';
import api from '../api';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  useTheme
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  DeleteForever as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  Man as ManIcon,
  Woman as WomanIcon
} from '@mui/icons-material';

export default function DailyAttendance({
  dailyData,
  selectedDate,
  setSelectedDate,
  selectedClass,
  setSelectedClass,
  onRefresh
}) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [clearing, setClearing] = useState(false);

  const stats = dailyData?.stats || {
    totalLogged: 0,
    presentOnTime: 0,
    presentLate: 0,
    totalPresent: 0,
    absent: 0,
    boys: { total: 0, present: 0, absent: 0 },
    girls: { total: 0, present: 0, absent: 0 }
  };

  const records = (dailyData?.records || []).filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.fullName?.toLowerCase().includes(term) ||
      r.grNo?.toLowerCase().includes(term) ||
      r.className?.toLowerCase().includes(term) ||
      r.parentEmail?.toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    if (records.length === 0) return alert('No records to export');
    const headers = [
      'Date',
      'Time',
      'GR_No',
      'Roll_No',
      'Full_Name',
      'Class',
      'Gender',
      'Parent_Email',
      'Status',
      'Method',
      'Parent_Phone',
      'SMS_Status',
      'Email_Status'
    ];
    const rows = records.map((r) => [
      r.date,
      r.time,
      r.grNo,
      r.rollNo,
      `"${r.fullName}"`,
      r.className,
      r.gender,
      r.parentEmail || '',
      r.status,
      r.scanMethod,
      r.parentPhone || '',
      r.smsStatus,
      r.emailStatus || 'SENT'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearDayAttendance = async () => {
    const totalCount = stats.totalLogged || 0;
    const confirmPrompt = window.confirm(
      `⚠️ Clear Attendance for ${selectedDate}?\n\n` +
      `Currently recorded: ${totalCount} record(s).\n\n` +
      `This will DELETE all attendance records for this date so you can test fresh RFID card scans with your ESP32 hardware.`
    );
    if (!confirmPrompt) return;

    setClearing(true);
    try {
      const res = await api.post('/api/attendance/clear-day', { date: selectedDate });
      if (res.data.success) {
        alert(res.data.message);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert(`Error clearing attendance: ${err.message}`);
    } finally {
      setClearing(false);
    }
  };

  const getStatusChip = (status) => {
    if (status === 'Present') {
      return (
        <Chip
          icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
          label="Present"
          size="small"
          color="success"
          sx={{ fontWeight: 700, fontSize: '0.75rem', px: 0.5 }}
        />
      );
    }
    if (status === 'Present (Late)') {
      return (
        <Chip
          icon={<ScheduleIcon sx={{ fontSize: '14px !important' }} />}
          label="Late"
          size="small"
          color="warning"
          sx={{ fontWeight: 700, fontSize: '0.75rem', px: 0.5 }}
        />
      );
    }
    return (
      <Chip
        icon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
        label="Absent"
        size="small"
        color="error"
        sx={{ fontWeight: 700, fontSize: '0.75rem', px: 0.5 }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Responsive Filter and Action Bar */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
        >
          {/* Date & Class Selectors */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              type="date"
              size="small"
              label="Attendance Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ width: { xs: '100%', sm: 200 } }}
            />

            <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                value={selectedClass}
                label="Class"
                onChange={(e) => setSelectedClass(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Classes</MenuItem>
                <MenuItem value="9A">Class 9A</MenuItem>
                <MenuItem value="10A">Class 10A</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Search & Actions */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Search student, GR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
            />

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={exportCSV}
              sx={{ width: { xs: '100%', sm: 'auto' }, borderColor: 'divider', height: 40 }}
            >
              Export CSV
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearDayAttendance}
              disabled={clearing}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                height: 40,
                '&:hover': { bgcolor: '#ffe4e6' }
              }}
            >
              {clearing ? 'Clearing...' : 'Clear Day (Testing)'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Responsive Stat Metric Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Total Logged Today
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'text.primary' }}>
              {stats.totalLogged}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Total scans registered
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              Present On-Time
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'success.main' }}>
              {stats.presentOnTime}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Arrived before gate cutoff
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
              Present (Late)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'warning.main' }}>
              {stats.presentLate}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Arrived after gate cutoff
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
              Absent Unlogged
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: 'error.main' }}>
              {stats.absent}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No RFID scan recorded
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Demographic Breakdown Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'info.50', color: 'info.main' }}>
              <ManIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Boys: {stats.boys?.present || 0} Present / {stats.boys?.absent || 0} Absent
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total enrolled boys: {stats.boys?.total || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.50', color: '#db2777' }}>
              <WomanIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Girls: {stats.girls?.present || 0} Present / {stats.girls?.absent || 0} Absent
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total enrolled girls: {stats.girls?.total || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Responsive Records Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Daily Attendance Records ({records.length})
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>GR No</TableCell>
                <TableCell>Roll</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Alerts Dispatched</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <PeopleIcon sx={{ fontSize: 40, color: 'divider', mb: 1, display: 'block', mx: 'auto' }} />
                    No attendance records logged for this date.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.time}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{r.grNo}</TableCell>
                    <TableCell>{r.rollNo || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{r.fullName}</TableCell>
                    <TableCell>
                      <Chip label={r.className} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{r.gender}</TableCell>
                    <TableCell>{getStatusChip(r.status)}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.scanMethod || 'RFID'}
                        size="small"
                        sx={{ bgcolor: 'grey.100', fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Chip
                          label={`SMS: ${r.smsStatus || 'SENT'}`}
                          size="small"
                          color={r.smsStatus === 'FAILED' ? 'error' : 'success'}
                          variant="outlined"
                          sx={{ fontSize: '0.68rem', height: 22 }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
