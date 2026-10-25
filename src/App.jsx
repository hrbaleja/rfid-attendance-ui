import React, { useState, useEffect } from 'react';
import api from './api';
import { socket } from './socket';

import Navbar from './components/Navbar';
import LiveGateMonitor from './components/LiveGateMonitor';
import DailyAttendance from './components/DailyAttendance';
import MonthlyMatrix from './components/MonthlyMatrix';
import StudentDirectory from './components/StudentDirectory';
import TeacherDirectory from './components/TeacherDirectory';
import SettingsPanel from './components/SettingsPanel';
import ManualAttendanceModal from './components/ManualAttendanceModal';
import CardEnrollment from './components/CardEnrollment';
import SetupGuide from './components/SetupGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [liveScans, setLiveScans] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [config, setConfig] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchDailyAttendance();

    // Socket listeners
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onScan = (scan) => {
      setLiveScans((prev) => [scan, ...prev.slice(0, 19)]);
      // Auto-refresh daily data when a scan arrives
      fetchDailyAttendance();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('NEW_ATTENDANCE_SCAN', onScan);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('NEW_ATTENDANCE_SCAN', onScan);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'daily') fetchDailyAttendance();
    if (activeTab === 'monthly') fetchMonthlyMatrix();
  }, [activeTab, selectedDate, selectedMonth, selectedClass]);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/config');
      if (res.data.success) setConfig(res.data.config);
    } catch (err) {
      console.error('Failed to load school config:', err);
    }
  };

  const fetchDailyAttendance = async () => {
    try {
      const url = `/api/attendance/daily?date=${selectedDate}${selectedClass ? `&class=${selectedClass}` : ''}`;
      const res = await api.get(url);
      if (res.data.success) setDailyData(res.data);
    } catch (err) {
      console.error('Failed to load daily attendance:', err);
    }
  };

  const fetchMonthlyMatrix = async () => {
    try {
      const url = `/api/attendance/monthly-matrix?month=${selectedMonth}${selectedClass ? `&class=${selectedClass}` : ''}`;
      const res = await api.get(url);
      if (res.data.success) setMonthlyData(res.data);
    } catch (err) {
      console.error('Failed to load monthly matrix:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isConnected={isConnected}
        schoolName={config?.schoolName}
        onOpenManualModal={() => setIsManualModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main>
        {activeTab === 'live' && (
          <LiveGateMonitor liveScans={liveScans} config={config} />
        )}

        {activeTab === 'enroll' && (
          <CardEnrollment config={config} onStudentAdded={fetchDailyAttendance} />
        )}

        {activeTab === 'daily' && (
          <DailyAttendance
            dailyData={dailyData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyMatrix
            monthlyData={monthlyData}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
          />
        )}

        {activeTab === 'students' && <StudentDirectory />}

        {activeTab === 'teachers' && <TeacherDirectory />}

        {activeTab === 'settings' && (
          <SettingsPanel config={config} setConfig={setConfig} onRefresh={fetchConfig} />
        )}

        {activeTab === 'guide' && (
          <SetupGuide config={config} />
        )}
      </main>

      {/* Manual Entry Popup Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onRefresh={fetchDailyAttendance}
      />
    </div>
  );
}
