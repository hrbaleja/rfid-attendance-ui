import React, { useState } from 'react';
import { Download, Search, Filter, Calendar as CalendarIcon, Mail, Phone } from 'lucide-react';

export default function DailyAttendance({ dailyData, selectedDate, setSelectedDate, selectedClass, setSelectedClass }) {
  const [searchTerm, setSearchTerm] = useState('');

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
    const headers = ['Date', 'Time', 'GR_No', 'Roll_No', 'Full_Name', 'Class', 'Gender', 'Parent_Email', 'Status', 'Method', 'Parent_Phone', 'SMS_Status', 'Email_Status'];
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filter and Export Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={16} color="#64748b" />
            <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#64748b" />
            <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Class:</span>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
              <option value="">All Classes</option>
              <option value="9A">Class 9A</option>
              <option value="10A">Class 10A</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search student, GR, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '32px', width: '240px' }}
            />
          </div>

          <button
            onClick={exportCSV}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px'
            }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Total Logged Today</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
            {stats.totalLogged}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>Present (On-Time)</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a', marginTop: '6px' }}>
            {stats.presentOnTime}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '13px', color: '#d97706', fontWeight: '500' }}>Present (Late)</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>
            {stats.presentLate}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>Absent</span>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#dc2626', marginTop: '6px' }}>
            {stats.absent}
          </div>
        </div>
      </div>

      {/* Boys / Girls & Alerts Summary Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>👦 👧 Student Demographics</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0284c7' }}>{stats.boys?.present || 0} / {stats.boys?.total || 0}</div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Boys (Present / Total)</span>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0' }}></div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#ec4899' }}>{stats.girls?.present || 0} / {stats.girls?.total || 0}</div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Girls (Present / Total)</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>📧 📲 Parent Communication Delivery</h4>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669' }}>Active</div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Gmail SMTP (beriyahiren008@gmail.com)</span>
            </div>
            <div style={{ borderLeft: '1px solid #e2e8f0' }}></div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb' }}>Multi-Channel</div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Email + WhatsApp/SMS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>
            Attendance Entries ({records.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Showing records for {selectedDate}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>GR No</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Parent Email</th>
                <th>Status</th>
                <th>Method</th>
                <th>Alert Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No attendance records found for this date and filter.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '500' }}>{r.time}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{r.grNo}</td>
                    <td style={{ fontWeight: '600' }}>{r.fullName}</td>
                    <td><span className="badge badge-rfid">{r.className}</span></td>
                    <td>{r.gender}</td>
                    <td>
                      {r.parentEmail ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#0369a1', fontSize: '12.5px' }}>
                          <Mail size={13} color="#0284c7" /> {r.parentEmail}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span className={
                        r.status === 'Present'
                          ? 'badge badge-present'
                          : r.status === 'Present (Late)'
                          ? 'badge badge-late'
                          : 'badge badge-absent'
                      }>
                        {r.status}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '12px', color: '#64748b' }}>{r.scanMethod}</span></td>
                    <td>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#16a34a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ✓ Alert Dispatched
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
