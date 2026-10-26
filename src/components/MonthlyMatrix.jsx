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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Month & Class Controls */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
              sx={{ width: { xs: '100%', sm: 200 } }}
            />

            <FormControl size="small" sx={{ width: { xs: '100%', sm: 160 } }}>
              <InputLabel id="class-select">Class</InputLabel>
              <Select
                labelId="class-select"
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
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
              sx={{ width: { xs: '100%', sm: 200 } }}
            />

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={exportMonthlyCSV}
              sx={{ width: { xs: '100%', sm: 'auto' }, borderColor: 'divider', height: 40 }}
            >
              Export Monthly CSV
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Monthly Attendance Spreadsheet Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Monthly Attendance Matrix ({selectedMonth})
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
            Legend: <strong style={{ color: '#16a34a' }}>P</strong> = Present (On-Time),{' '}
            <strong style={{ color: '#d97706' }}>L</strong> = Present (Late),{' '}
            <strong style={{ color: '#dc2626' }}>A</strong> = Absent
          </Typography>
        </Box>

        <TableContainer sx={{ maxHeight: 650, overflowX: 'auto' }}>
          <Table stickyHeader size="small">
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
