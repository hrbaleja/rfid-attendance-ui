import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Key, ShieldCheck, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@bgroup.com');
  const [password, setPassword] = useState('123Bgroup@');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@bgroup.com');
    setPassword('123Bgroup@');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          pointerEvents: 'none'
        }}
      />

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          padding: '36px 32px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
              marginBottom: '16px'
            }}
          >
            <Lock size={26} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            RFID Attendance Portal
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '6px' }}>
            Sign in with your administrator credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              color: '#dc2626',
              fontSize: '13px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                required
                placeholder="admin@bgroup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '40px',
                  paddingTop: '11px',
                  paddingBottom: '11px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#64748b'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '13px',
              borderRadius: '10px',
              fontSize: '14.5px',
              fontWeight: '700',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
              marginTop: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Credentials Quick-Fill helper */}
        <div
          style={{
            marginTop: '24px',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Default Initial System Credentials:
          </span>
          <code style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af' }}>
            admin@bgroup.com • 123Bgroup@
          </code>
          <div style={{ marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                fontSize: '11.5px',
                padding: '4px 10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
                fontWeight: '600'
              }}
            >
              Fill Credentials
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: '#94a3b8',
            fontSize: '11.5px'
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>Secured with JWT Token Authentication</span>
        </div>
      </div>
    </div>
  );
}
