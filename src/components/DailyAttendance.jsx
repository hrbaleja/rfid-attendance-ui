import React, { useState } from 'react';
import api from '../api';
import {
  Box,
  Paper,
  Typography,
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
  Avatar
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

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
        `This will DELETE all attendance records for this date so you can perform fresh RFID test scans with your ESP32 hardware.`
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

  const availableClasses = Array.from(
    new Set([
      '9A',
      '10A',
      ...(dailyData?.records || []).map((r) => r.className).filter(Boolean)
    ])
  ).sort();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Full-Width Filter and Action Bar */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            width: '100%'
          }}
        >
          {/* Left: Filters (Date, Class, Search) - All aligned at 40px height */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexWrap="wrap"
            sx={{ gap: { xs: 1.5, sm: 1.5 } }}
          >
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
              sx={{ width: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: 40 } }}
            />

            <FormControl size="small" sx={{ width: { xs: '100%', sm: 165 }, minWidth: 150 }}>
              <InputLabel id="class-select-label">Class</InputLabel>
              <Select
                labelId="class-select-label"
                value={selectedClass || ''}
                label="Class"
                displayEmpty
                onChange={(e) => setSelectedClass(e.target.value)}
                renderValue={(val) => {
                  if (!val) return 'All Classes';
                  return val.startsWith('Class') ? val : `Class ${val}`;
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                }
                sx={{ height: 40 }}
              >
                <MenuItem value="">
                  <em>All Classes</em>
                </MenuItem>
                {availableClasses.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    Class {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
              sx={{ width: { xs: '100%', sm: 220 }, '& .MuiInputBase-root': { height: 40 } }}
            />
          </Stack>

          {/* Right: Actions (Export CSV & Clear Day Data) - Perfectly aligned on right side */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              ml: { md: 'auto' },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              flexShrink: 0
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={exportCSV}
              sx={{
                flex: { xs: 1, sm: 'none' },
                height: 40,
                px: 2,
                borderColor: 'divider',
                whiteSpace: 'nowrap',
                fontWeight: 600
              }}
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
                flex: { xs: 1, sm: 'none' },
                height: 40,
                px: 2,
                bgcolor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                '&:hover': { bgcolor: '#ffe4e6' }
              }}
            >
              {clearing ? 'Clearing...' : 'Clear Day Data'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* 4 Full-Width Metric Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          width: '100%'
        }}
      >
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
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

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
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

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
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

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, width: '100%' }}>
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
      </Box>

      {/* Demographic Breakdown Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          width: '100%'
        }}
      >
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
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

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
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
      </Box>

      {/* Full-Width Records Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Daily Attendance Records ({records.length})
          </Typography>
        </Box>

        <TableContainer sx={{ width: '100%', maxHeight: 650, overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ width: '100%', minWidth: 850 }}>
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
