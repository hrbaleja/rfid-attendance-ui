import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Upload, Trash2, Search, GraduationCap, X, Mail, Phone } from 'lucide-react';

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Single Student Form
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

  // Bulk CSV Text Area
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
    if (!confirm(`Are you sure you want to remove student "${name}"?`)) return;
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
          parentPhone: parts[7] || '9664759611',
          parentEmail: parts[8] || 'hrbaleja.04@gmail.com'
        });
      }
    });

    if (parsedStudents.length === 0) {
      return alert('No valid student rows found. Expected format:\nGR1001, 1, E1F2A3B4, Aarav Patel, 9A, Boy, Rajesh Patel, 9664759611, parent@example.com');
    }

    try {
      const res = await api.post('/api/students/bulk', { students: parsedStudents });
      setBulkStatus(`Imported: ${res.data.insertedCount} | Errors: ${res.data.errorCount}`);
      fetchStudents();
      setTimeout(() => {
        setIsBulkModalOpen(false);
        setCsvText('');
        setBulkStatus(null);
      }, 1500);
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = students.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(term) ||
      s.grNo?.toLowerCase().includes(term) ||
      s.rfidUid?.toLowerCase().includes(term) ||
      s.parentEmail?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header */}
      <div className="card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={22} color="#2563eb" /> Registered Students Directory ({students.length})
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Manage active students, RFID card mappings, and parent Email & Mobile alerts in MongoDB Atlas.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by name, GR, UID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', width: '260px' }}
            />
          </div>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13px'
            }}
          >
            <Upload size={15} /> Bulk CSV Import
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <UserPlus size={15} /> Add Student
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>GR No</th>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Assigned RFID UID</th>
              <th>Gender</th>
              <th>Parent Email</th>
              <th>Parent Mobile</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Loading student directory...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No students found. Click "Add Student" or "Bulk CSV Import" to register students.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{s.grNo}</td>
                  <td>{s.rollNo}</td>
                  <td style={{ fontWeight: '600' }}>{s.fullName}</td>
                  <td><span className="badge badge-rfid">{s.className}</span></td>
                  <td><code style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: '700', color: '#2563eb' }}>{s.rfidUid}</code></td>
                  <td>{s.gender}</td>
                  <td>
                    {s.parentEmail ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0369a1', fontSize: '13px', fontWeight: '500' }}>
                        <Mail size={13} color="#0284c7" /> {s.parentEmail}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>Not configured</span>
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Phone size={13} color="#64748b" /> {s.parentPhone}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(s._id, s.fullName)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#dc2626',
                        padding: '6px'
                      }}
                      title="Remove Student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Single Student Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '520px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Register New Student</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none' }}><X size={20} color="#94a3b8" /></button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>GR Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GR1025"
                    style={{ width: '100%' }}
                    value={newStudent.grNo}
                    onChange={(e) => setNewStudent({ ...newStudent, grNo: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15"
                    style={{ width: '100%' }}
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>RFID Card UID (Hex) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. E1F2A3B4 (Tapped on ESP32)"
                  style={{ width: '100%', fontFamily: 'monospace', fontWeight: '700' }}
                  value={newStudent.rfidUid}
                  onChange={(e) => setNewStudent({ ...newStudent, rfidUid: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Student Full Name"
                  style={{ width: '100%' }}
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Class *</label>
                  <input
                    type="text"
                    required
                    placeholder="9A"
                    style={{ width: '100%' }}
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Gender</label>
                  <select
                    style={{ width: '100%' }}
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  >
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Parent Email (For Instant Email Alerts) *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hrbaleja.04@gmail.com"
                  style={{ width: '100%' }}
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Parent Name</label>
                  <input
                    type="text"
                    placeholder="Father/Mother Name"
                    style={{ width: '100%' }}
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Parent Mobile *</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit number"
                    style={{ width: '100%' }}
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '9px 16px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#2563eb', color: '#fff', padding: '9px 18px', borderRadius: '8px', fontWeight: '600' }}
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Modal */}
      {isBulkModalOpen && (
        <div className="modal-overlay">
          <div className="card" style={{ width: '640px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Bulk Import Students from CSV</h3>
              <button onClick={() => setIsBulkModalOpen(false)} style={{ background: 'none' }}><X size={20} color="#94a3b8" /></button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              Paste comma-separated rows below. Format:  
              <br />
              <code style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>GR_No, Roll_No, RFID_UID, Full_Name, Class, Gender, Parent_Name, Parent_Mobile, Parent_Email</code>
            </p>

            <textarea
              rows="8"
              placeholder={`GR1010, 10, A1F2B3C4, Rohan Patel, 9A, Boy, Rajesh Patel, 9664759611, hrbaleja.04@gmail.com\nGR1011, 11, B2C3D4E5, Priya Shah, 9A, Girl, Sunil Shah, 9664759611, parent@example.com`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', marginBottom: '12px' }}
            />

            {bulkStatus && (
              <div style={{ padding: '8px 12px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                {bulkStatus}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '9px 16px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkUpload}
                style={{ backgroundColor: '#2563eb', color: '#fff', padding: '9px 18px', borderRadius: '8px', fontWeight: '600' }}
              >
                Upload & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
