import React, { useState, useEffect } from 'react';
import api from './api';
import { socket } from './socket';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginView from './components/LoginView';
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

function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
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
    if (!isAuthenticated) return;

    fetchConfig();
    fetchDailyAttendance();

    // Socket listeners
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onScan = (scan) => {
      setLiveScans((prev) => [scan, ...prev.slice(0, 19)]);
      fetchDailyAttendance();
    };

    const onAttendanceCleared = (payload) => {
      fetchDailyAttendance();
      const todayStr = new Date().toISOString().slice(0, 10);
      if (payload?.date === todayStr) {
        setLiveScans([]);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('NEW_ATTENDANCE_SCAN', onScan);
    socket.on('ATTENDANCE_CLEARED', onAttendanceCleared);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('NEW_ATTENDANCE_SCAN', onScan);
      socket.off('ATTENDANCE_CLEARED', onAttendanceCleared);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'daily') fetchDailyAttendance();
    if (activeTab === 'monthly') fetchMonthlyMatrix();
  }, [activeTab, selectedDate, selectedMonth, selectedClass, isAuthenticated]);

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ width: '20px', height: '20px', backgroundColor: '#2563eb', margin: '0 auto 12px' }}></div>
          <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

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
          <LiveGateMonitor
            liveScans={liveScans}
            config={config}
            onClearScans={() => setLiveScans([])}
            onRefresh={fetchDailyAttendance}
          />
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
            onRefresh={fetchDailyAttendance}
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

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
