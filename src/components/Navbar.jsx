import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Paper,
  Divider,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Sensors as SensorsIcon,
  Contactless as ContactlessIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarMonthIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Settings as SettingsIcon,
  MenuBook as MenuBookIcon,
  EditNote as EditNoteIcon,
  WifiOff as WifiOffIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

export default function Navbar({ activeTab, setActiveTab, isConnected, schoolName, onOpenManualModal }) {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'live', label: 'Live Gate Stream', icon: SensorsIcon },
    { id: 'enroll', label: 'Card Enrollment Studio', icon: ContactlessIcon },
    { id: 'daily', label: 'Daily Reports', icon: TodayIcon },
    { id: 'monthly', label: 'Monthly Matrix', icon: CalendarMonthIcon },
    { id: 'students', label: 'Student Directory', icon: SchoolIcon },
    { id: 'teachers', label: 'Class Teachers', icon: BadgeIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'guide', label: 'Setup Guide', icon: MenuBookIcon }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMobileTabSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <Box component="header" sx={{ mb: 3 }}>
      {/* Top Banner Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          borderRadius: 3,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Branding & Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'primary.50',
                color: 'primary.main',
                width: { xs: 42, sm: 48 },
                height: { xs: 42, sm: 48 },
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                borderRadius: 2.5
              }}
            >
              🏫
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: 'text.primary',
                  fontSize: { xs: '1.05rem', sm: '1.2rem' },
                  lineHeight: 1.2
                }}
              >
                RFID Attendance Alert System
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.3 }}>
                {schoolName || 'Smart School RFID Gate & Parent Alert Dashboard'}
              </Typography>
            </Box>
          </Box>

          {/* Mobile Hamburger Toggle */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileDrawerOpen(true)}
              color="primary"
              aria-label="open navigation menu"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        {/* Desktop Controls & Profile */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Live Status Badge */}
            <Chip
              icon={
                isConnected ? (
                  <Box
                    className="pulse-dot"
                    sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }}
                  />
                ) : (
                  <WifiOffIcon sx={{ fontSize: '1rem !important' }} />
                )
              }
              label={isConnected ? 'Gate Live' : 'Reconnecting...'}
              color={isConnected ? 'success' : 'error'}
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                bgcolor: isConnected ? '#ecfdf5' : '#fef2f2',
                borderColor: isConnected ? '#a7f3d0' : '#fecaca',
                height: 32,
                px: 0.5
              }}
            />

            {/* Live Clock */}
            <Chip
              icon={<AccessTimeIcon sx={{ fontSize: '1rem !important' }} />}
              label={time}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                bgcolor: 'grey.100',
                color: 'text.secondary',
                height: 32
              }}
            />

            {/* Manual Entry Action */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditNoteIcon />}
              onClick={onOpenManualModal}
              size="small"
              sx={{ height: 36, px: 1.75 }}
            >
              Manual Entry
            </Button>

            {/* User Profile & Logout */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                pl: 1.5,
                borderLeft: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  {user?.name || 'Administrator'}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1 }}>
                  {user?.email || 'admin'}
                </Typography>
              </Box>

              <IconButton
                onClick={logout}
                title="Sign Out"
                size="small"
                sx={{
                  bgcolor: '#fef2f2',
                  color: 'error.main',
                  border: '1px solid #fee2e2',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#fee2e2' }
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Desktop Navigation Tabs */}
      {!isMobile && (
        <Paper
          elevation={0}
          sx={{
            p: 0.75,
            bgcolor: '#f1f5f9',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 44,
              '& .MuiTabs-indicator': {
                display: 'none'
              },
              '& .MuiTab-root': {
                minHeight: 40,
                px: 2,
                py: 1,
                borderRadius: 2,
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  color: 'primary.main',
                  bgcolor: '#ffffff',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)'
                }
              }
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Tab
                  key={item.id}
                  value={item.id}
                  label={item.label}
                  icon={<Icon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
              );
            })}
          </Tabs>
        </Paper>
      )}

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: { width: 300, p: 2, display: 'flex', flexDirection: 'column' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: 'primary.main' }}>
              RFID Attendance
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Live Status and Clock */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={
              isConnected ? (
                <Box className="pulse-dot" sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
              ) : (
                <WifiOffIcon sx={{ fontSize: '1rem !important' }} />
              )
            }
            label={isConnected ? 'Gate Live' : 'Reconnecting...'}
            color={isConnected ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <Chip icon={<AccessTimeIcon sx={{ fontSize: '1rem !important' }} />} label={time} size="small" />
        </Box>

        {/* Manual Entry Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<EditNoteIcon />}
          onClick={() => {
            onOpenManualModal();
            setMobileDrawerOpen(false);
          }}
          sx={{ mb: 2 }}
        >
          Manual Entry
        </Button>

        {/* Navigation List */}
        <List sx={{ flex: 1, py: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleMobileTabSelect(item.id)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isSelected ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* User Info & Logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {user?.name || 'Administrator'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email || 'admin'}
            </Typography>
          </Box>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => {
              setMobileDrawerOpen(false);
              logout();
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
