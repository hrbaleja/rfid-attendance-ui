import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';

export default function MonthlyMatrix({
  monthlyData,
  selectedMonth,
  setSelectedMonth,
  selectedClass,
  setSelectedClass
}) {
  const [search, setSearch] = useState('');

  const daysInMonth = monthlyData?.daysInMonth || 31;
  const matrix = (monthlyData?.matrix || []).filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return s.fullName?.toLowerCase().includes(term) || s.grNo?.toLowerCase().includes(term);
  });

  const exportMonthlyCSV = () => {
    if (matrix.length === 0) return alert('No records to export');
    const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => (i + 1 < 10 ? '0' + (i + 1) : String(i + 1)));
    const headers = [
      'GR_No',
      'Roll_No',
      'Student_Name',
      'Class',
      ...dayHeaders,
      'Total_Present',
      'Total_Late',
      'Total_Absent',
      'Attendance_Pct'
    ];

    const rows = matrix.map((st) => [
      st.grNo,
      st.rollNo,
      `"${st.fullName}"`,
      st.className,
      ...dayHeaders.map((d) => st.days[d] || ''),
      st.totalPresent,
      st.totalLate,
      st.totalAbsent,
      `${st.attendancePct}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Monthly_Matrix_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const availableClasses = Array.from(
    new Set([
      '9A',
      '10A',
      ...matrix.map((r) => r.className).filter(Boolean)
    ])
  ).sort();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Month & Class Controls Bar */}
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
          {/* Left Side: Filters (Month, Class, Search) - All aligned at 40px height */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexWrap="wrap"
            sx={{ gap: { xs: 1.5, sm: 1.5 } }}
          >
            <TextField
              type="month"
              size="small"
              label="Selected Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
              <InputLabel id="class-select">Class</InputLabel>
              <Select
                labelId="class-select"
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
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          {/* Right Side: Download Button (Proper Right Aligned) */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              ml: 'auto',
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              flexShrink: 0
            }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={exportMonthlyCSV}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                height: 40,
                px: 2.5,
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              Export Monthly CSV
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Monthly Attendance Spreadsheet Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%' }}>
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Monthly Attendance Matrix ({selectedMonth})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
              Legend: <strong style={{ color: '#16a34a' }}>P</strong> = Present (On-Time),{' '}
              <strong style={{ color: '#d97706' }}>L</strong> = Present (Late),{' '}
              <strong style={{ color: '#dc2626' }}>A</strong> = Absent
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={exportMonthlyCSV}
            sx={{
              height: 36,
              px: 2,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              ml: { sm: 'auto' }
            }}
          >
            Export CSV
          </Button>
        </Box>

        <TableContainer sx={{ maxHeight: 650, overflowX: 'auto', width: '100%' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1000, width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 90, bgcolor: '#f8fafc' }}>GR No</TableCell>
                <TableCell sx={{ minWidth: 160, bgcolor: '#f8fafc' }}>Student Name</TableCell>
                <TableCell sx={{ minWidth: 70, bgcolor: '#f8fafc' }}>Class</TableCell>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1 < 10 ? '0' + (i + 1) : String(i + 1);
                  return (
                    <TableCell key={i} align="center" sx={{ minWidth: 28, px: 0.5, bgcolor: '#f8fafc' }}>
                      {dayNum}
                    </TableCell>
                  );
                })}
                <TableCell align="center" sx={{ color: 'success.main', fontWeight: 800, minWidth: 36, bgcolor: '#f8fafc' }}>
                  P
                </TableCell>
                <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 800, minWidth: 36, bgcolor: '#f8fafc' }}>
                  L
                </TableCell>
                <TableCell align="center" sx={{ color: 'error.main', fontWeight: 800, minWidth: 36, bgcolor: '#f8fafc' }}>
                  A
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, minWidth: 60, bgcolor: '#f8fafc' }}>
                  %
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matrix.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={daysInMonth + 7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No students registered for this month/class.
                  </TableCell>
                </TableRow>
              ) : (
                matrix.map((st, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{st.grNo}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{st.fullName}</TableCell>
                    <TableCell>
                      <Chip label={st.className} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    {Array.from({ length: daysInMonth }, (_, dIdx) => {
                      const dayKey = dIdx + 1 < 10 ? '0' + (dIdx + 1) : String(dIdx + 1);
                      const code = st.days ? st.days[dayKey] : '';
                      return (
                        <TableCell
                          key={dIdx}
                          align="center"
                          sx={{
                            px: 0.5,
                            py: 0.75,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            bgcolor:
                              code === 'P'
                                ? 'rgba(34, 197, 94, 0.08)'
                                : code === 'L'
                                ? 'rgba(217, 119, 6, 0.08)'
                                : code === 'A'
                                ? 'rgba(220, 38, 38, 0.08)'
                                : 'transparent',
                            color:
                              code === 'P'
                                ? '#16a34a'
                                : code === 'L'
                                ? '#d97706'
                                : code === 'A'
                                ? '#dc2626'
                                : '#cbd5e1'
                          }}
                        >
                          {code || '·'}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {st.totalPresent}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {st.totalLate}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {st.totalAbsent}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 800,
                        color: st.attendancePct >= 75 ? 'success.main' : 'error.main'
                      }}
                    >
                      {st.attendancePct}%
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
