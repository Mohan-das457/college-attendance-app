import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast = () => {
  const { toast } = useAttendance();

  if (!toast) return null;

  let icon = <CheckCircle2 color="var(--safe)" size={20} />;
  let border = 'var(--safe-border)';
  let bg = 'rgba(16, 185, 129, 0.15)';

  if (toast.type === 'warning' || toast.type === 'danger') {
    icon = <AlertTriangle color="var(--warning)" size={20} />;
    border = 'var(--warning-border)';
    bg = 'rgba(245, 158, 11, 0.15)';
  } else if (toast.type === 'info') {
    icon = <Info color="var(--primary)" size={20} />;
    border = 'var(--primary-glow)';
    bg = 'rgba(99, 102, 241, 0.15)';
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem 1.25rem',
      background: 'var(--bg-dark)',
      border: `1px solid ${border}`,
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {icon}
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
        {toast.message}
      </span>
    </div>
  );
};
