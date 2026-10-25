import React, { useState } from 'react';
import { BookOpen, Cpu, CreditCard, Clock, MessageSquare, FileSpreadsheet, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../api';

export default function SetupGuide({ config }) {
  const [activeSection, setActiveSection] = useState('hardware');

  const sections = [
    { id: 'hardware', label: '1. Hardware & Wiring', icon: Cpu },
    { id: 'enrollment', label: '2. Card Enrollment', icon: CreditCard },
    { id: 'cutoffs', label: '3. Gate Cutoffs & Logic', icon: Clock },
    { id: 'alerts', label: '4. SMS & WhatsApp Setup', icon: MessageSquare },
    { id: 'reports', label: '5. Reports & Exports', icon: FileSpreadsheet },
    { id: 'faq', label: '6. Troubleshooting & FAQ', icon: HelpCircle }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
      {/* Sidebar Navigation */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', padding: '8px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          User Setup Guide
        </h3>

        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#2563eb' : '#475569',
                fontWeight: isActive ? '700' : '500',
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <Icon size={16} />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* Guide Content Body */}
      <div className="card" style={{ padding: '30px' }}>
        {/* SECTION 1: HARDWARE & WIRING */}
        {activeSection === 'hardware' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Chapter 1: Hardware Connections & Wiring Guide
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
              Learn how to connect your ESP32 microcontroller with the MFRC522 RFID reader, indicator LEDs, and audio buzzer.
            </p>

            <div style={{ padding: '14px 18px', backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '8px', marginBottom: '24px' }}>
              <strong style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> CRITICAL POWER WARNING:
              </strong>
              <p style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>
                Always wire the MFRC522 reader VCC pin to <strong>3.3V</strong> on the ESP32. Connecting it to the 5V pin will permanently burn the RFID chip.
              </p>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Pinout Connection Table</h3>
            <table className="data-table" style={{ marginBottom: '24px' }}>
              <thead>
                <tr>
                  <th>MFRC522 RFID Pin</th>
                  <th>ESP32 GPIO Pin</th>
                  <th>Recommended Color</th>
                  <th>Function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>3.3V</strong></td>
                  <td><strong>3.3V</strong></td>
                  <td>Red</td>
                  <td>Power (Do NOT use 5V)</td>
                </tr>
                <tr>
                  <td><strong>GND</strong></td>
                  <td><strong>GND</strong></td>
                  <td>Black</td>
                  <td>Ground</td>
                </tr>
                <tr>
                  <td><strong>RST</strong></td>
                  <td><strong>GPIO 22</strong></td>
                  <td>Orange</td>
                  <td>Chip Reset</td>
                </tr>
                <tr>
                  <td><strong>SDA (SS)</strong></td>
                  <td><strong>GPIO 5</strong></td>
                  <td>Yellow</td>
                  <td>SPI Chip Select</td>
                </tr>
                <tr>
                  <td><strong>SCK</strong></td>
                  <td><strong>GPIO 18</strong></td>
                  <td>Green</td>
                  <td>SPI Clock</td>
                </tr>
                <tr>
                  <td><strong>MISO</strong></td>
                  <td><strong>GPIO 19</strong></td>
                  <td>Blue</td>
                  <td>SPI Master In / Slave Out</td>
                </tr>
                <tr>
                  <td><strong>MOSI</strong></td>
                  <td><strong>GPIO 23</strong></td>
                  <td>Purple</td>
                  <td>SPI Master Out / Slave In</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>LEDs & Buzzer Feedback</h3>
            <ul style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>Green LED</strong>: Connect anode (+) through a 220Ω resistor to <strong>GPIO 2</strong>, cathode (-) to GND. Lights up on valid scans.</li>
              <li><strong>Red LED</strong>: Connect anode (+) through a 220Ω resistor to <strong>GPIO 4</strong>, cathode (-) to GND. Lights up on unregistered cards.</li>
              <li><strong>Buzzer</strong>: Connect positive (+) to <strong>GPIO 15</strong>, negative (-) to GND. Emits 1 sharp beep for valid scans, 3 warning beeps for unknown cards.</li>
            </ul>
          </div>
        )}

        {/* SECTION 2: CARD ENROLLMENT */}
        {activeSection === 'enrollment' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Chapter 2: How to Enroll & Issue New RFID Smart Cards
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              Issuing smart cards to students takes under 10 seconds using the Card Enrollment Studio.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Tap the Blank Card on the Gate / Desk Reader</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Take any blank RFID 13.56MHz card or keyfob and tap it against the reader. The reader will beep 3 times (unregistered), and its UID will instantly pop up in the top banner of the <strong>"Card Enrollment"</strong> tab.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Fill in Student Details</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Type the student's Full Name, GR Number, Roll Number, Class (e.g. 9A), and the Parent Mobile Number (which will receive SMS and WhatsApp notifications).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Click "Enroll Card & Save Student"</h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    The card is instantly linked in <strong>MongoDB Atlas</strong>. Hand the physical card to the student. The next time they tap it at the gate, the Green LED will illuminate, the chime will sound, and their parent will receive an attendance alert.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: GATE CUTOFFS & LOGIC */}
        {activeSection === 'cutoffs' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Chapter 3: Morning Gate Timings & Cutoff Rules
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              The system automatically classifies student arrival times based on configurable school timings.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#15803d' }}>
                  Condition 1: Present (On-Time) — Scans &lt;= {config?.onTimeCutoff || '08:15'}
                </h4>
                <p style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                  Students scanning before or at the on-time cutoff are marked as <strong>Present (P)</strong>. Green LED turns ON, 1 beep sounds, and the On-Time Parent alert is sent.
                </p>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fffbeb', borderLeft: '4px solid #d97706', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#b45309' }}>
                  Condition 2: Present (Late) — Scans between {config?.onTimeCutoff || '08:15'} and {config?.absentCutoff || '09:00'}
                </h4>
                <p style={{ fontSize: '13px', color: '#92400e', marginTop: '4px' }}>
                  Students scanning after the on-time cutoff are marked as <strong>Present (Late) (L)</strong>. The parent receives an alert indicating their child was late, with the exact arrival time.
                </p>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#b91c1c' }}>
                  Condition 3: Automated Absent Cutoff — Triggered at {config?.absentCutoff || '09:00'} AM
                </h4>
                <p style={{ fontSize: '13px', color: '#991b1b', marginTop: '4px' }}>
                  At 09:00 AM, the background cron engine checks all active students in the database. Anyone who has NOT scanned is automatically marked <strong>Absent (A)</strong>, parents receive the Absent alert, and summary reports are dispatched to Class Teachers and the Principal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ALERTS & WHATSAPP */}
        {activeSection === 'alerts' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Chapter 4: SMS & WhatsApp Notifications Setup
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
              Configure Fast2SMS for cellular SMS and WhatsApp for smartphone notifications.
            </p>

            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Fast2SMS Configuration (India)</h3>
            <ul style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '20px' }}>
              <li>Create an account on <strong>fast2sms.com</strong> and copy your API authorization key.</li>
              <li>Recharge wallet with at least ₹100 once to activate the API sending route.</li>
              <li>Set <code>SMS_PROVIDER=FAST2SMS</code> in your <code>.env</code> file.</li>
            </ul>

            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '10px' }}>Notification Channel Selector</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
              In your backend <code>.env</code> file, set <code>NOTIFICATION_CHANNEL</code>:
            </p>
            <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', border: '1px solid #e2e8f0' }}>
              <div># Send both Cellular SMS and WhatsApp:</div>
              <strong>NOTIFICATION_CHANNEL=BOTH</strong>
              <div style={{ marginTop: '6px' }}># Send WhatsApp only (no SMS cost):</div>
              <strong>NOTIFICATION_CHANNEL=WHATSAPP</strong>
            </div>
          </div>
        )}

        {/* SECTION 5: REPORTS & EXPORTS */}
        {activeSection === 'reports' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Chapter 5: Attendance Reports & Excel/CSV Exports
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
              How to export and print official attendance spreadsheets for state compliance and audits.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>Daily Attendance CSV</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
                  Go to the <strong>"Daily Reports"</strong> tab, pick your target date and class, and click <strong>"Export CSV"</strong> to download a clean log of student check-in times.
                </p>
              </div>

              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#2563eb' }}>Monthly 1-31 Matrix Grid</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
                  Go to <strong>"Monthly Matrix"</strong>, select the month (e.g., 2026-10), and click <strong>"Export Monthly CSV"</strong> to download the complete 31-day P/L/A attendance matrix with calculated %.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: TROUBLESHOOTING & FAQ */}
        {activeSection === 'faq' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Chapter 6: Troubleshooting & Common Questions
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
              Quick resolutions for common hardware and network issues.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                  ❓ Why did the buzzer beep 3 times and Red LED light up?
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  The scanned card is not registered to any student in the database. Open the <strong>"Card Enrollment"</strong> tab — the detected card UID will be shown at the top, ready for assignment!
                </p>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                  ❓ What if a student scans their card twice on the same morning?
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  The system has anti-duplicate protection. It acknowledges the student with a green light and "Already Logged Today", and will NOT duplicate the record or send a second SMS.
                </p>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                  ❓ Can we place multiple RFID readers at different school gates?
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Yes! All ESP32 devices can post to the same centralized cloud endpoint (`/api/rfid/scan`). Set <code>DEVICE_ID = "GATE_NORTH"</code>, <code>DEVICE_ID = "GATE_SOUTH"</code> in each ESP32 code to distinguish which entrance was used.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
