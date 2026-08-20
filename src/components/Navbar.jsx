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
    activeStudent,
    activeTeacher,
    targetThreshold, 
    setTargetThreshold, 
    notifications, 
    resetData 
  } = useAttendance();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentUser = role === 'student' ? activeStudent : (role === 'teacher' ? activeTeacher : { name: 'Admin', rollNo: 'MITS-ADM' });

  return (
    <>
      <nav className="glass-panel" style={{ 
        borderRadius: 0, 
        borderTop: 0, 
        borderLeft: 0, 
        borderRight: 0, 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          
          {/* Brand Logo & College Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              flexShrink: 0
            }}>
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
                  AttendTrack
                </h1>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 6, background: 'rgba(99,102,241,0.18)', color: '#818cf8', fontWeight: 700 }}>
                  MITS
                </span>
              </div>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600, margin: 0 }}>
                {role === 'student' ? (currentUser?.rollNo || '3-1 Semester') : (role === 'teacher' ? 'Faculty Portal' : 'Admin')}
              </p>
            </div>
          </div>

          {/* Role Switcher — admin only */}
          {loggedInRole === 'admin' && (
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.25)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <button onClick={() => setRole('student')} className="btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', background: role === 'student' ? 'var(--primary)' : 'transparent', color: role === 'student' ? '#fff' : 'var(--text-muted)', border: 'none' }}>
                <GraduationCap size={14} /> Student
              </button>
              <button onClick={() => setRole('teacher')} className="btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', background: role === 'teacher' ? 'var(--primary)' : 'transparent', color: role === 'teacher' ? '#fff' : 'var(--text-muted)', border: 'none' }}>
                <UserCheck size={14} /> Teacher
              </button>
              <button onClick={() => setRole('admin')} className="btn"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', background: role === 'admin' ? 'var(--primary)' : 'transparent', color: role === 'admin' ? '#fff' : 'var(--text-muted)', border: 'none' }}>
                <ShieldCheck size={14} /> Admin
              </button>
            </div>
          )}

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            
            {/* Target Rule Badge */}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem', borderRadius: 8 }}
              title="Attendance Policy Target"
            >
              <SlidersHorizontal size={13} color="var(--primary)" />
              <span><strong>{targetThreshold}%</strong></span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem', borderRadius: '8px' }}
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
            </button>

            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem', borderRadius: '8px', position: 'relative' }}
                title="Notifications"
              >
                <Bell size={16} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '7px',
                    height: '7px',
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
                  width: '290px',
                  padding: '0.85rem',
                  zIndex: 60,
                  boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                  borderRadius: 14
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', margin: 0 }}>Alerts & Activity</h4>
                    <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{ 
                        padding: '0.5rem', 
                        borderRadius: '8px', 
                        background: n.type === 'warning' ? 'var(--warning-bg)' : 'rgba(255,255,255,0.03)',
                        borderLeft: `3px solid ${n.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}`
                      }}>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-main)', margin: 0 }}>{n.text}</p>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{n.time}</span>
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
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 8 }}
              title="Logout"
            >
              <LogOut size={14} />
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
