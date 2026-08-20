import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { ShieldAlert, KeyRound, Lock, Eye, EyeOff, X, ArrowRight, UserCheck } from 'lucide-react';

export const PasskeyAuthModal = ({ targetRole, onClose, onSuccess }) => {
  const { passkeys, teachers, verifyPasskey, verifyFacultyPasskey } = useAttendance();

  const [selectedProfId, setSelectedProfId] = useState(teachers[0]?.id || 'TCH-001');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeProf = teachers.find(t => t.id === selectedProfId) || teachers[0];
  const defaultHintPin = targetRole === 'teacher' ? activeProf.passkey : (passkeys[targetRole] || '1234');

  const roleTitleMap = {
    student: 'Student Portal Access',
    teacher: 'Faculty / Professor Portal Access',
    admin: 'College Admin Security Access'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin) {
      setErrorMsg('Please enter your 4-digit passkey');
      return;
    }

    let success = false;
    if (targetRole === 'teacher') {
      success = verifyFacultyPasskey(selectedProfId, pin);
    } else {
      success = verifyPasskey(targetRole, pin);
    }

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg(`Incorrect Passkey for ${targetRole === 'teacher' ? activeProf.name : targetRole.toUpperCase()}.`);
      setPin('');
    }
  };

  const handleAutoFill = () => {
    setPin(defaultHintPin);
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '440px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--primary-glow)', borderRadius: '10px' }}>
              <KeyRound color="var(--primary)" size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>{roleTitleMap[targetRole]}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Authenticate portal credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* Specific Faculty Account Selector */}
          {targetRole === 'teacher' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Select Faculty Account to Log In:
              </label>
              <select
                value={selectedProfId}
                onChange={(e) => {
                  setSelectedProfId(e.target.value);
                  setPin('');
                  setErrorMsg('');
                }}
                className="input-field"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department.split(' ')[0]}) - Passkey: {t.passkey}
                  </option>
                ))}
              </select>

              {/* Faculty Info Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <img src={activeProf.avatar} alt={activeProf.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{activeProf.name}</div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{activeProf.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* Passkey Input Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Security Passkey / PIN:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPin ? "text" : "password"}
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter 4-digit PIN"
                autoFocus
                className="input-field"
                style={{ 
                  paddingRight: '2.5rem', 
                  fontSize: '1.2rem', 
                  letterSpacing: '4px',
                  fontWeight: 700,
                  textAlign: 'center' 
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--danger)', 
              background: 'var(--danger-bg)', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '8px',
              border: '1px solid var(--danger-border)',
              textAlign: 'center'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Quick Fill Passkey Hint Pill */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed var(--border-light)',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            fontSize: '0.78rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Passkey for {targetRole === 'teacher' ? activeProf.name : targetRole.toUpperCase()}: <strong style={{ color: 'var(--primary)' }}>{defaultHintPin}</strong>
            </span>
            <button
              type="button"
              onClick={handleAutoFill}
              style={{
                background: 'var(--primary-glow)',
                color: 'var(--primary)',
                border: '1px solid var(--border-glow)',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Auto-Fill PIN
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Log In <ArrowRight size={16} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
