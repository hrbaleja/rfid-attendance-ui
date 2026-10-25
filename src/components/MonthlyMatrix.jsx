import React, { useState } from 'react';
import { Download, Calendar, Filter } from 'lucide-react';

export default function MonthlyMatrix({ monthlyData, selectedMonth, setSelectedMonth, selectedClass, setSelectedClass }) {
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
    const headers = ['GR_No', 'Roll_No', 'Student_Name', 'Class', ...dayHeaders, 'Total_Present', 'Total_Late', 'Total_Absent', 'Attendance_Pct'];

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Month & Class Controls */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="#64748b" />
            <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '180px' }}
          />

          <button
            onClick={exportMonthlyCSV}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px'
            }}
          >
            <Download size={15} /> Export Monthly CSV
          </button>
        </div>
      </div>

      {/* Monthly Attendance Spreadsheet Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700' }}>
              Monthly Matrix ({selectedMonth}) — Replicating Sheet Tab <code>&lt;MMM_yyyy&gt;</code>
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Legend: <strong style={{ color: '#16a34a' }}>P</strong> = Present (On-Time), <strong style={{ color: '#d97706' }}>L</strong> = Present (Late), <strong style={{ color: '#dc2626' }}>A</strong> = Absent
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '12px' }}>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                <th style={{ textAlign: 'left', minWidth: '90px' }}>GR No</th>
                <th style={{ textAlign: 'left', minWidth: '150px' }}>Student Name</th>
                <th style={{ minWidth: '60px' }}>Class</th>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const dayNum = i + 1 < 10 ? '0' + (i + 1) : String(i + 1);
                  return (
                    <th key={i} style={{ padding: '6px 4px', minWidth: '26px' }}>
                      {dayNum}
                    </th>
                  );
                })}
                <th style={{ color: '#16a34a', minWidth: '34px' }}>P</th>
                <th style={{ color: '#d97706', minWidth: '34px' }}>L</th>
                <th style={{ color: '#dc2626', minWidth: '34px' }}>A</th>
                <th style={{ minWidth: '55px', fontWeight: '800' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {matrix.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No students registered for this month/class.
                  </td>
                </tr>
              ) : (
                matrix.map((st, i) => (
                  <tr key={i} style={{ textAlign: 'center' }}>
                    <td style={{ textAlign: 'left', fontWeight: '700', color: '#0f172a' }}>{st.grNo}</td>
                    <td style={{ textAlign: 'left', fontWeight: '600' }}>{st.fullName}</td>
                    <td><span className="badge badge-rfid">{st.className}</span></td>
                    {Array.from({ length: daysInMonth }, (_, dIdx) => {
                      const dayKey = dIdx + 1 < 10 ? '0' + (dIdx + 1) : String(dIdx + 1);
                      const code = st.days ? st.days[dayKey] : '';
                      return (
                        <td
                          key={dIdx}
                          style={{
                            padding: '6px 2px',
                            fontWeight: '700',
                            backgroundColor: code === 'P' ? 'rgba(34, 197, 94, 0.08)' : code === 'L' ? 'rgba(217, 119, 6, 0.08)' : code === 'A' ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                            color: code === 'P' ? '#16a34a' : code === 'L' ? '#d97706' : code === 'A' ? '#dc2626' : '#cbd5e1'
                          }}
                        >
                          {code || '·'}
                        </td>
                      );
                    })}
                    <td style={{ fontWeight: '700', color: '#16a34a' }}>{st.totalPresent}</td>
                    <td style={{ fontWeight: '700', color: '#d97706' }}>{st.totalLate}</td>
                    <td style={{ fontWeight: '700', color: '#dc2626' }}>{st.totalAbsent}</td>
                    <td style={{ fontWeight: '800', color: st.attendancePct >= 75 ? '#16a34a' : '#dc2626' }}>
                      {st.attendancePct}%
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
