import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  UploadFile as UploadFileIcon,
  DeleteForever as DeleteIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  Close as CloseIcon
} from '@mui/icons-material';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    grNo: '',
    rollNo: '',
    rfidUid: '',
    fullName: '',
    className: '9A',
    gender: 'Boy',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  });

  const [csvText, setCsvText] = useState('');
  const [bulkStatus, setBulkStatus] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/students');
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/students', newStudent);
      if (res.data.success) {
        alert('Student registered successfully!');
        setIsAddModalOpen(false);
        setNewStudent({
          grNo: '',
          rollNo: '',
          rfidUid: '',
          fullName: '',
          className: '9A',
          gender: 'Boy',
          parentName: '',
          parentPhone: '',
          parentEmail: ''
        });
        fetchStudents();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    try {
      await api.delete(`/api/students/${id}`);
      fetchStudents();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvText.trim()) return alert('Please paste CSV rows');
    const lines = csvText.trim().split('\n');
    const parsedStudents = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 5) {
        parsedStudents.push({
          grNo: parts[0],
          rollNo: parts[1] || '1',
          rfidUid: parts[2],
          fullName: parts[3],
          className: parts[4],
          gender: parts[5] || 'Boy',
          parentName: parts[6] || 'Parent',
          parentPhone: parts[7] || '',
          parentEmail: parts[8] || ''
        });
      }
    });

    if (parsedStudents.length === 0) {
      return alert('No valid CSV rows parsed. Check column format.');
    }

    try {
      setBulkStatus('Importing ' + parsedStudents.length + ' students...');
      const res = await api.post('/api/students/bulk', { students: parsedStudents });
      if (res.data.success) {
        alert(`Successfully imported ${res.data.count || parsedStudents.length} students!`);
        setIsBulkModalOpen(false);
        setCsvText('');
        setBulkStatus(null);
        fetchStudents();
      }
    } catch (e) {
      alert('Bulk import failed: ' + e.message);
      setBulkStatus(null);
    }
  };

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(term) ||
      s.grNo?.toLowerCase().includes(term) ||
      s.className?.toLowerCase().includes(term) ||
      s.rfidUid?.toLowerCase().includes(term) ||
      s.parentPhone?.includes(term)
    );
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {/* Header & Right-Aligned Action Bar */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, width: '100%' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          {/* Left: Title & Subtitle */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon sx={{ color: 'primary.main' }} /> Student Directory
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              Manage active students, RFID card mappings, and parent alert channels ({filtered.length} total)
            </Typography>
          </Box>

          {/* Right Side: Search, Bulk Import & Add Student Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems="center"
            sx={{ ml: { md: 'auto' } }}
          >
            <TextField
              size="small"
              placeholder="Search student, GR..."
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
              color="primary"
              startIcon={<UploadFileIcon />}
              onClick={() => setIsBulkModalOpen(true)}
              sx={{ width: { xs: '100%', sm: 'auto' }, height: 40, whiteSpace: 'nowrap' }}
            >
              Bulk Import
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setIsAddModalOpen(true)}
              sx={{ width: { xs: '100%', sm: 'auto' }, height: 40, whiteSpace: 'nowrap', fontWeight: 700 }}
            >
              Add Student
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Students Data Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%' }}>
        <TableContainer sx={{ maxHeight: 650, width: '100%' }}>
          <Table stickyHeader size="small" sx={{ width: '100%', minWidth: 850 }}>
            <TableHead>
              <TableRow>
                <TableCell>GR No</TableCell>
                <TableCell>Roll</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>RFID UID</TableCell>
                <TableCell>Student Full Name</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Parent Mobile</TableCell>
                <TableCell>Parent Email</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Remove
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Loading student database...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No students found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((st) => (
                  <TableRow key={st._id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{st.grNo}</TableCell>
                    <TableCell>{st.rollNo || '-'}</TableCell>
                    <TableCell>
                      <Chip label={st.className} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={st.rfidUid}
                        size="small"
                        sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', bgcolor: '#eff6ff' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{st.fullName}</TableCell>
                    <TableCell>{st.gender}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{st.parentPhone || '-'}</TableCell>
                    <TableCell>{st.parentEmail || '-'}</TableCell>
                    <TableCell align="right" sx={{ pr: 3 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(st._id, st.fullName)}
                        title="Delete Student"
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

      {/* Add Single Student Dialog */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Register New Student
          </Typography>
          <IconButton onClick={() => setIsAddModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleAddSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="GR Number"
                  value={newStudent.grNo}
                  onChange={(e) => setNewStudent({ ...newStudent, grNo: e.target.value.toUpperCase() })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Roll Number"
                  value={newStudent.rollNo}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class</InputLabel>
                  <Select
                    label="Class"
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                  >
                    <MenuItem value="9A">Class 9A</MenuItem>
                    <MenuItem value="10A">Class 10A</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Full Student Name"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="RFID Card UID (Hex)"
                  value={newStudent.rfidUid}
                  onChange={(e) => setNewStudent({ ...newStudent, rfidUid: e.target.value.toUpperCase() })}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  >
                    <MenuItem value="Boy">Boy</MenuItem>
                    <MenuItem value="Girl">Girl</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Parent / Guardian Name"
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Parent Mobile"
                  placeholder="9876543210"
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Parent Email"
                  type="email"
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Student
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Bulk Student CSV Import
          </Typography>
          <IconButton onClick={() => setIsBulkModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            Paste CSV rows with the following column structure:
            <code style={{ display: 'block', marginTop: '6px', fontWeight: 700 }}>
              GR_No, Roll_No, RFID_UID, Full_Name, Class, Gender, Parent_Name, Parent_Mobile, Parent_Email
            </code>
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder={`GR101,1,A1B2C3D4,Aarav Patel,9A,Boy,Ramesh Patel,9876543210,parent@gmail.com\nGR102,2,B2C3D4E5,Diya Sharma,9A,Girl,Sanjay Sharma,9876543211,diya.parent@gmail.com`}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
          />

          {bulkStatus && (
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
              {bulkStatus}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkUpload}>
            Import Students
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
