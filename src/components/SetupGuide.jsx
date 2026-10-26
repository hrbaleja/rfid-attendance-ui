import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Stack
} from '@mui/material';
import {
  Memory as MemoryIcon,
  Contactless as ContactlessIcon,
  AccessTime as AccessTimeIcon,
  Chat as ChatIcon,
  Description as DescriptionIcon,
  Help as HelpIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';

export default function SetupGuide({ config }) {
  const [activeSection, setActiveSection] = useState('hardware');

  const sections = [
    { id: 'hardware', label: '1. Hardware & Wiring', icon: MemoryIcon },
    { id: 'enrollment', label: '2. Card Enrollment', icon: ContactlessIcon },
    { id: 'cutoffs', label: '3. Gate Cutoffs & Logic', icon: AccessTimeIcon },
    { id: 'alerts', label: '4. SMS & WhatsApp Setup', icon: ChatIcon },
    { id: 'reports', label: '5. Reports & Exports', icon: DescriptionIcon },
    { id: 'faq', label: '6. Troubleshooting & FAQ', icon: HelpIcon }
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
        gap: 3,
        width: '100%',
        alignItems: 'start'
      }}
    >
      {/* Sidebar Navigation (Left Side) */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, width: '100%' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            px: 1,
            display: 'block',
            mb: 1
          }}
        >
          User Setup Guide
        </Typography>

        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <ListItem key={sec.id} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => setActiveSection(sec.id)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    '&.Mui-selected': {
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={sec.label}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500 }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Guide Content Body (Always on the Right Side) */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, width: '100%' }}>
        {/* SECTION 1: HARDWARE & WIRING */}
        {activeSection === 'hardware' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Chapter 1: Hardware Connections & Wiring Guide
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Learn how to wire your ESP32 microcontroller with the MFRC522 RFID reader, status LEDs, and buzzer.
            </Typography>

            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                CRITICAL POWER WARNING:
              </Typography>
              <Typography variant="body2">
                Always connect the MFRC522 reader VCC pin to <strong>3.3V</strong> on the ESP32. Connecting to the 5V pin will permanently burn the RFID chip.
              </Typography>
            </Alert>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Pinout Connection Table
            </Typography>
            <TableContainer sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>MFRC522 RFID Pin</TableCell>
                    <TableCell>ESP32 GPIO Pin</TableCell>
                    <TableCell>Recommended Wire</TableCell>
                    <TableCell>Function</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell><strong>3.3V</strong></TableCell>
                    <TableCell><strong>3.3V</strong></TableCell>
                    <TableCell>Red</TableCell>
                    <TableCell>Power (Do NOT use 5V)</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>GND</strong></TableCell>
                    <TableCell><strong>GND</strong></TableCell>
                    <TableCell>Black</TableCell>
                    <TableCell>Ground</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>RST</strong></TableCell>
                    <TableCell><strong>GPIO 22</strong></TableCell>
                    <TableCell>Orange</TableCell>
                    <TableCell>Reset Line</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>SDA (SS)</strong></TableCell>
                    <TableCell><strong>GPIO 5</strong></TableCell>
                    <TableCell>Yellow</TableCell>
                    <TableCell>SPI Slave Select</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>SCK</strong></TableCell>
                    <TableCell><strong>GPIO 18</strong></TableCell>
                    <TableCell>Green</TableCell>
                    <TableCell>SPI Clock</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>MOSI</strong></TableCell>
                    <TableCell><strong>GPIO 23</strong></TableCell>
                    <TableCell>Blue</TableCell>
                    <TableCell>Master Out Slave In</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>MISO</strong></TableCell>
                    <TableCell><strong>GPIO 19</strong></TableCell>
                    <TableCell>Purple</TableCell>
                    <TableCell>Master In Slave Out</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Indicator LEDs & Buzzer Wiring
            </Typography>
            <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell>ESP32 Pin</TableCell>
                    <TableCell>Significance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell><strong>Green LED (+)</strong></TableCell>
                    <TableCell><strong>GPIO 12</strong> (via 220Ω resistor)</TableCell>
                    <TableCell>Successful On-Time or Late Attendance Scan</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>Red LED (+)</strong></TableCell>
                    <TableCell><strong>GPIO 14</strong> (via 220Ω resistor)</TableCell>
                    <TableCell>Unregistered Card or Network Error</TableCell>
                  </TableRow>
                  <TableRow hover>
                    <TableCell><strong>Audio Buzzer (+)</strong></TableCell>
                    <TableCell><strong>GPIO 27</strong> (Buzzer - to GND)</TableCell>
                    <TableCell>Instant Auditory Feedback Beep</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* SECTION 2: CARD ENROLLMENT */}
        {activeSection === 'enrollment' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Chapter 2: How to Enroll & Issue RFID Smart Cards
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Assign RFID smart cards to students in two easy clicks using live tap-to-detect.
            </Typography>

            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Step 1: Tap Any Blank Card
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Tap any blank RFID 13.56MHz card on the ESP32 reader. Its UID will immediately appear in the top banner of the <strong>Card Enrollment</strong> tab.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Step 2: Click "Use Detected"
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Click the <strong>Use Detected</strong> button to automatically copy the UID into the enrollment form without typing hexadecimal numbers manually.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Step 3: Enter Student Information
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Fill in the student's name, class, GR number, and parent mobile number, then click <strong>Assign & Activate RFID Card</strong>.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* SECTION 3: CUTOFFS */}
        {activeSection === 'cutoffs' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Chapter 3: Gate Cutoff Timings & Automation
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Configure automated morning cutoffs and absent student marking.
            </Typography>

            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                  1. On-Time Reporting Cutoff (e.g. 08:15)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Students scanning before 08:15 are marked <strong>Present (On-Time)</strong> and a green status notification is dispatched. Scans after 08:15 are flagged as <strong>Present (Late)</strong>.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
                  2. Absent Student Cutoff (e.g. 09:00)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  At 09:00, the system automatically checks every student who hasn't scanned their card, marks them <strong>Absent</strong>, and dispatches absent notices to parents and the class teacher.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* SECTION 4: ALERTS */}
        {activeSection === 'alerts' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Chapter 4: SMS, WhatsApp & Email Alerts
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Send instant alerts across multiple channels with zero duplicate costs.
            </Typography>

            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Fast2SMS (Quick Cellular Delivery)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Uses the Fast2SMS Quick Route API with high delivery rates across Indian mobile operators.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  WhatsApp Notifications
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Direct WhatsApp notifications via Meta Cloud API or UltraMsg with rich formatted text.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Gmail SMTP & Resend Email Alerts
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Formatted HTML report cards sent straight to parent inboxes.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* SECTION 5: REPORTS */}
        {activeSection === 'reports' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Chapter 5: CSV Reports & Monthly Matrix
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Export full demographic spreadsheets and monthly attendance tables.
            </Typography>

            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Daily Attendance CSV Export
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Download complete reporting records including exact scan timestamp, gate device ID, and notification statuses.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Monthly Matrix Grid
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  31-day visual attendance spreadsheet with automatic present, late, absent totals, and attendance percentage.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        )}

        {/* SECTION 6: FAQ */}
        {activeSection === 'faq' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Chapter 6: Troubleshooting & Frequently Asked Questions
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Quick answers to common hardware, network, and operational questions.
            </Typography>

            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  ❓ Why did the buzzer beep 3 times and Red LED light up?
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  The scanned card is not registered to any student in the database. Open the <strong>Card Enrollment</strong> tab — the detected card UID will be shown at the top, ready for assignment!
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  ❓ What if a student scans their card twice on the same morning?
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  The system has anti-duplicate protection. It acknowledges the student with a green light and "Already Logged Today", and will not duplicate records or resend redundant alerts.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  ❓ Can we place multiple RFID readers at different school gates?
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Yes! All ESP32 devices can post to the centralized cloud endpoint (<code>/api/rfid/scan</code>). Set <code>DEVICE_ID = "GATE_NORTH"</code>, <code>DEVICE_ID = "GATE_SOUTH"</code> in each ESP32 firmware to identify which gate was used.
                </Typography>
              </Paper>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
