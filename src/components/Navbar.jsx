import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { PasskeyAuthModal } from './PasskeyAuthModal';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Bell, 
  RotateCcw, 
  SlidersHorizontal,
  X,
  LogOut
} from 'lucide-react';

export const Navbar = ({ theme, toggleTheme, onLogout }) => {
  const { 
    role, 
    setRole,
    loggedInRole,
    targetThreshold, 
    setTargetThreshold, 
    notifications, 
    resetData 
  } = useAttendance();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}>
              <GraduationCap size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AttendTrack<span style={{ color: '#6366f1', WebkitTextFillColor: '#6366f1' }}>.AI</span>
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 500 }}>Passkey Protected Campus Portal</p>
            </div>
          </div>

          {/* Role Switcher — admin only */}
          {loggedInRole === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '0.3rem', borderRadius: '12px', border: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
              <button onClick={() => setRole('student')} className="btn"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', background: role === 'student' ? 'var(--primary)' : 'transparent', color: role === 'student' ? '#fff' : 'var(--text-muted)', border: 'none' }}>
                <GraduationCap size={16} /> Student View
              </button>
              <button onClick={() => setRole('teacher')} className="btn"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', background: role === 'teacher' ? 'var(--primary)' : 'transparent', color: role === 'teacher' ? '#fff' : 'var(--text-muted)', border: 'none' }}>
                <UserCheck size={16} /> Teacher View
              </button>
              <button onClick={() => setRole('admin')} className="btn"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px', background: role === 'admin' ? 'var(--primary)' : 'transparent', color: role === 'admin' ? '#fff' : 'var(--text-muted)', border: 'none' }}>
                <ShieldCheck size={16} /> Admin Portal
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Settings Trigger */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              title="Configure Target Threshold Rule"
            >
              <SlidersHorizontal size={15} color="var(--primary)" />
              <span>Rule: <strong>{targetThreshold}%</strong></span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem', borderRadius: '8px' }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
            </button>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="btn btn-secondary"
                style={{ padding: '0.45rem', borderRadius: '8px', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444'
                  }} />
                )}
              </button>

              {showNotifs && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  padding: '1rem',
                  zIndex: 60,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem' }}>Activity & Alerts</h4>
                    <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ 
                        padding: '0.6rem', 
                        borderRadius: '8px', 
                        background: n.type === 'warning' ? 'var(--warning-bg)' : 'rgba(255,255,255,0.03)',
                        borderLeft: `3px solid ${n.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}`
                      }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{n.text}</p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button 
              onClick={onLogout}
              className="btn btn-danger" 
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              title="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>

            {/* Reset Preset Data */}
            <button 
              onClick={resetData}
              className="btn btn-secondary" 
              style={{ padding: '0.45rem', borderRadius: '8px' }}
              title="Reset Data & Passkeys to Defaults"
            >
              <RotateCcw size={16} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        {/* Threshold Settings Modal Bar */}
        {showSettings && (
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.95)', 
            borderTop: '1px solid var(--border-light)', 
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
              Minimum Attendance Policy Rule:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {[65, 75, 80, 85].map(val => (
                <button
                  key={val}
                  onClick={() => setTargetThreshold(val)}
                  className="btn"
                  style={{
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.8rem',
                    background: targetThreshold === val ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: targetThreshold === val ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  {val}% {val === 75 ? '(Standard)' : ''}
                </button>
              ))}
            </div>
            <button onClick={() => setShowSettings(false)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              Done
            </button>
          </div>
        )}
      </nav>

      {/* Passkey Authentication Challenge Modal */}
      {false && null}
    </>
  );
};
