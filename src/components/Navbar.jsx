import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Radio, Users, Calendar, Settings, UserCheck, GraduationCap, Edit3, WifiOff, CreditCard, BookOpen, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isConnected, schoolName, onOpenManualModal }) {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'live', label: 'Live Gate Stream', icon: Radio },
    { id: 'enroll', label: 'Card Enrollment Studio', icon: CreditCard },
    { id: 'daily', label: 'Daily Reports', icon: Users },
    { id: 'monthly', label: 'Monthly Matrix', icon: Calendar },
    { id: 'students', label: 'Students Directory', icon: GraduationCap },
    { id: 'teachers', label: 'Class Teachers', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'guide', label: 'Setup Guide', icon: BookOpen }
  ];

  return (
    <header style={{ marginBottom: '24px' }}>
      {/* Top Branding Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginBottom: '16px',
          backgroundColor: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '20px'
            }}
          >
            🏫
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
              {schoolName || 'Sardar Patel Vidyalaya'}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              RFID Gate Attendance & SMS Reporting System
            </p>
          </div>
        </div>

        {/* Live Status and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isConnected ? '#ecfdf5' : '#fef2f2',
              color: isConnected ? '#059669' : '#dc2626',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            {isConnected ? <span className="pulse-dot"></span> : <WifiOff size={14} />}
            {isConnected ? 'Gate Live' : 'Reconnecting...'}
          </div>

          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#475569'
            }}
          >
            🕒 {time}
          </div>

          <button
            onClick={onOpenManualModal}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Edit3 size={15} />
            Manual Entry
          </button>

          {/* User Profile & Logout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '10px',
              borderLeft: '1px solid #e2e8f0'
            }}
          >
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0f172a' }}>
                {user?.name || 'Administrator'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {user?.email || 'admin@bgroup.com'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fee2e2',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: '#e2e8f0',
          padding: '6px',
          borderRadius: '12px'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#fff' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: isActive ? '600' : '500',
                fontSize: '13.5px'
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
