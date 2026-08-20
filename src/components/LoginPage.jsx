import React, { useState, useEffect, useRef } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { GraduationCap, Eye, EyeOff, ArrowRight, Mail, Lock, Shield, BookOpen, UserCog, Sparkles, ChevronDown, KeyRound } from 'lucide-react';

const ROLES = [
  { key: 'student', label: 'Student', icon: GraduationCap, emoji: '🎓', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', desc: 'Track your attendance & bunk allowance' },
  { key: 'teacher', label: 'Faculty', icon: BookOpen, emoji: '👨‍🏫', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', desc: 'Manage classes & mark attendance' },
  { key: 'admin',   label: 'Admin',   icon: Shield,   emoji: '🛡️', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', desc: 'Full system control & analytics' },
];

const DEMO = {
  student: { email: '24691a2899@mits.ac.in', password: 'mohan123' },
  teacher: { email: 'rajesh.iyer@mits.edu', password: 'rajesh123' },
  admin:   { email: 'admin@mits.edu', password: 'admin123' },
};

/* ─── Floating Orb Animation ─── */
const FloatingOrbs = ({ activeColor }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${activeColor}22, ${activeColor}08)`,
            filter: 'blur(60px)',
            width: `${120 + i * 80}px`,
            height: `${120 + i * 80}px`,
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 25}%`,
            animation: `orbFloat${i} ${8 + i * 2}s ease-in-out infinite`,
            transition: 'background 0.8s ease',
          }}
        />
      ))}
      <style>{`
        @keyframes orbFloat0 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -40px) scale(1.1); } }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-50px, 30px) scale(0.9); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0) scale(1.05); } 50% { transform: translate(40px, 50px) scale(0.95); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0) scale(0.95); } 50% { transform: translate(-30px, -60px) scale(1.1); } }
        @keyframes orbFloat4 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(60px, -20px) scale(1.05); } }
      `}</style>
    </div>
  );
};

/* ─── Animated Input Component ─── */
const AnimatedInput = ({ icon: Icon, label, type, value, onChange, placeholder, suffix, autoFocus }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        fontSize: '0.78rem',
        fontWeight: 600,
        color: focused ? 'var(--primary)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        transition: 'color 0.2s ease',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}>
        <Icon size={13} />
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoFocus={autoFocus}
          className="input-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            padding: '14px 16px',
            paddingRight: suffix ? 44 : 16,
            fontSize: '0.92rem',
            borderRadius: 12,
            background: focused ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.5)',
            borderColor: focused ? 'var(--primary)' : 'var(--border-light)',
            boxShadow: focused ? '0 0 0 3px var(--primary-glow), 0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.25s ease',
          }}
        />
        {suffix}
      </div>
    </div>
  );
};

/* ─── Main Login Page ─── */
export default function LoginPage({ onLogin }) {
  const { loginWithEmail, teachers, findAccountByEmail, updatePasswordWithOtp } = useAttendance();
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState('email');
  const [authMode, setAuthMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [roleTransition, setRoleTransition] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const activeRoleData = ROLES.find(r => r.key === selectedRole);

  const resetPasswordState = () => {
    setResetEmail('');
    setResetOtp('');
    setGeneratedOtp('');
    setNewPassword('');
    setResetStep('email');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a brief auth delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));

    const ok = loginWithEmail(email.trim(), password);
    if (ok) {
      onLogin();
    } else {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    if (selectedRole === 'teacher') {
      const t = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
      setEmail(t.email);
      setPassword(t.password);
    } else {
      setEmail(DEMO[selectedRole].email);
      setPassword(DEMO[selectedRole].password);
    }
    setError('');
  };

  const switchRole = (key) => {
    if (key === selectedRole) return;
    setRoleTransition(true);
    setTimeout(() => {
      setSelectedRole(key);
      setEmail('');
      setPassword('');
      setError('');
      setSelectedTeacherId('');
      setAuthMode('login');
      resetPasswordState();
      setRoleTransition(false);
    }, 200);
  };

  const handleTeacherSelect = (id) => {
    setSelectedTeacherId(id);
    const t = teachers.find(t => t.id === id);
    if (t) { setEmail(t.email); setPassword(t.password); }
    setError('');
  };

  const startPasswordReset = () => {
    setAuthMode('reset');
    setResetEmail(email);
    setPassword('');
    setError('');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    const account = findAccountByEmail(resetEmail);
    if (!account) {
      setError('No account found for this email.');
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setResetStep('otp');
    setError('');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (resetOtp.trim() !== generatedOtp) {
      setError('Invalid OTP. Please enter the 6-digit code shown below.');
      return;
    }
    setResetStep('password');
    setError('');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const ok = updatePasswordWithOtp(resetEmail, newPassword.trim());
    if (ok) {
      setEmail(resetEmail);
      setPassword('');
      setAuthMode('login');
      resetPasswordState();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '1.5rem',
      overflow: 'hidden',
    }}>
      <FloatingOrbs activeColor={activeRoleData.color} />

      {/* Subtle grid pattern overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        position: 'relative',
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* ─── Logo & Branding ─── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: 22,
            background: activeRoleData.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 12px 32px ${activeRoleData.color}55`,
            transition: 'all 0.5s ease',
            position: 'relative',
          }}>
            <GraduationCap size={34} color="#fff" strokeWidth={2.2} />
            {/* Glow ring */}
            <div style={{
              position: 'absolute', inset: -4,
              borderRadius: 26,
              border: `2px solid ${activeRoleData.color}30`,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
          </div>

          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
            Attend<span style={{
              background: activeRoleData.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.5s ease',
            }}>Track</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.5em', fontWeight: 500, marginLeft: 2 }}>.AI</span>
          </h1>
          <p style={{
            color: 'var(--text-dim)',
            fontSize: '0.85rem',
            marginTop: 6,
            letterSpacing: '0.01em',
          }}>
            MITS Campus Attendance Portal
          </p>
        </div>

        {/* ─── Main Card ─── */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: `
            0 24px 48px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.03) inset,
            0 1px 0 rgba(255,255,255,0.06) inset
          `,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0, left: '10%', right: '10%',
            height: 2,
            background: activeRoleData.gradient,
            borderRadius: '0 0 4px 4px',
            transition: 'all 0.5s ease',
          }} />

          <h2 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Sparkles size={16} style={{ color: activeRoleData.color, transition: 'color 0.3s ease' }} />
            {authMode === 'login' ? 'Sign In' : 'Reset Password'}
          </h2>

          {/* ─── Role Selector Tabs ─── */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 24,
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 14,
            padding: 4,
          }}>
            {ROLES.map(r => {
              const isActive = selectedRole === r.key;
              const RoleIcon = r.icon;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => switchRole(r.key)}
                  style={{
                    flex: 1,
                    padding: '12px 8px',
                    borderRadius: 11,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    background: isActive ? `${r.color}18` : 'transparent',
                    color: isActive ? r.color : 'var(--text-dim)',
                    boxShadow: isActive ? `0 2px 12px ${r.color}20, inset 0 0 0 1.5px ${r.color}40` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <RoleIcon size={20} strokeWidth={isActive ? 2.5 : 1.8} style={{ transition: 'all 0.3s ease' }} />
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Role description */}
          <div style={{
            fontSize: '0.78rem',
            color: activeRoleData.color,
            background: `${activeRoleData.color}10`,
            border: `1px solid ${activeRoleData.color}20`,
            padding: '8px 14px',
            borderRadius: 10,
            marginBottom: 20,
            textAlign: 'center',
            fontWeight: 500,
            opacity: roleTransition ? 0 : 1,
            transform: roleTransition ? 'translateY(-8px)' : 'translateY(0)',
            transition: 'all 0.2s ease',
          }}>
            {activeRoleData.desc}
          </div>

          {/* ─── Form ─── */}
          {authMode === 'login' ? (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              opacity: roleTransition ? 0 : 1,
              transform: roleTransition ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.25s ease',
            }}
          >
            {/* Faculty Dropdown */}
            {selectedRole === 'teacher' && (
              <div>
                <label style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}>
                  <UserCog size={13} />
                  Select Faculty
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="input-field"
                    value={selectedTeacherId}
                    onChange={e => handleTeacherSelect(e.target.value)}
                    required
                    style={{
                      padding: '14px 40px 14px 16px',
                      fontSize: '0.92rem',
                      borderRadius: 12,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer',
                      background: 'rgba(15, 23, 42, 0.5)',
                    }}
                  >
                    <option value="">— Choose your name —</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} — {t.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>
            )}

            {/* Email */}
            <AnimatedInput
              icon={Mail}
              label="Email Address"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="Enter your institutional email"
              autoFocus={selectedRole !== 'teacher'}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
              <button
                type="button"
                onClick={startPasswordReset}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeRoleData.color,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Password */}
            <AnimatedInput
              icon={Lock}
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: showPass ? 'var(--primary)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 6,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />

            {/* Error Message */}
            {error && (
              <div style={{
                fontSize: '0.82rem',
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                padding: '10px 14px',
                borderRadius: 10,
                textAlign: 'center',
                fontWeight: 500,
                animation: 'shakeX 0.4s ease',
              }}>
                {error}
              </div>
            )}

            {/* Demo Credentials Panel */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
                {selectedRole === 'teacher' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>☝️</span>
                    <span>Select name above to auto-fill</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <span style={{ opacity: 0.6 }}>Email: </span>
                      <strong style={{ color: activeRoleData.color, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        {DEMO[selectedRole].email}
                      </strong>
                    </div>
                    <div>
                      <span style={{ opacity: 0.6 }}>Pass: </span>
                      <strong style={{ color: activeRoleData.color, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        {DEMO[selectedRole].password}
                      </strong>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={fillDemo}
                style={{
                  background: `${activeRoleData.color}18`,
                  color: activeRoleData.color,
                  border: `1px solid ${activeRoleData.color}35`,
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-main)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={e => {
                  e.target.style.background = `${activeRoleData.color}30`;
                  e.target.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = `${activeRoleData.color}18`;
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ✨ Auto Fill
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '14px 20px',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-main)',
                borderRadius: 12,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? `${activeRoleData.color}60` : activeRoleData.gradient,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 4,
                boxShadow: `0 6px 20px ${activeRoleData.color}40`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 10px 30px ${activeRoleData.color}50`;
                }
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 6px 20px ${activeRoleData.color}40`;
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In as {activeRoleData.label}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          ) : (
          <form
            onSubmit={resetStep === 'email' ? handleSendOtp : resetStep === 'otp' ? handleVerifyOtp : handleChangePassword}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              opacity: roleTransition ? 0 : 1,
              transform: roleTransition ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.25s ease',
            }}
          >
            <AnimatedInput
              icon={Mail}
              label="Registered Email"
              type="email"
              value={resetEmail}
              onChange={e => { setResetEmail(e.target.value); setError(''); }}
              placeholder="Enter your account email"
              autoFocus
            />

            {resetStep === 'otp' && (
              <>
                <div style={{
                  fontSize: '0.78rem',
                  color: activeRoleData.color,
                  background: `${activeRoleData.color}12`,
                  border: `1px solid ${activeRoleData.color}30`,
                  padding: '10px 14px',
                  borderRadius: 10,
                  textAlign: 'center',
                  fontWeight: 700,
                }}>
                  Demo OTP: {generatedOtp}
                </div>
                <AnimatedInput
                  icon={KeyRound}
                  label="OTP Code"
                  type="text"
                  value={resetOtp}
                  onChange={e => { setResetOtp(e.target.value); setError(''); }}
                  placeholder="Enter 6-digit OTP"
                />
              </>
            )}

            {resetStep === 'password' && (
              <AnimatedInput
                icon={Lock}
                label="New Password"
                type="text"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                placeholder="Minimum 6 characters"
              />
            )}

            {error && (
              <div style={{
                fontSize: '0.82rem',
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                padding: '10px 14px',
                borderRadius: 10,
                textAlign: 'center',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '14px 20px',
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'var(--font-main)',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: activeRoleData.gradient,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 4,
                boxShadow: `0 6px 20px ${activeRoleData.color}40`,
              }}
            >
              {resetStep === 'email' ? 'Send OTP' : resetStep === 'otp' ? 'Verify OTP' : 'Change Password'}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('login'); resetPasswordState(); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              Back to sign in
            </button>
          </form>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div style={{
          textAlign: 'center',
          marginTop: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <p style={{
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.02em',
          }}>
            © 2026 MITS · SmartCampus AttendTrack
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            fontSize: '0.7rem',
          }}>
            {['Privacy', 'Terms', 'Support'].map(item => (
              <span
                key={item}
                style={{
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--text-muted)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        [data-theme='light'] .login-demo-panel {
          background: rgba(0,0,0,0.03) !important;
        }
      `}</style>
    </div>
  );
}
