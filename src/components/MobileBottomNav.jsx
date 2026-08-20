import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Camera, 
  Calculator, 
  User, 
  QrCode,
  Award,
  History,
  FileQuestion,
  Users
} from 'lucide-react';

export default function MobileBottomNav({ activeTab, onTabChange, onOpenScanner, onStartSession }) {
  const { role, activeStudent, activeTeacher, activeSession } = useAttendance();

  const handleTabClick = (tabId) => {
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch {}
    }
    onTabChange(tabId);
  };

  const handleCenterFabClick = () => {
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch {}
    }
    if (role === 'student' && onOpenScanner) {
      onOpenScanner();
    } else if (role === 'teacher' && onStartSession) {
      onStartSession();
    }
  };

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner">
        
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => handleTabClick(role === 'student' ? 'overview' : (role === 'teacher' ? 'roster' : 'overview'))}
          className={`mobile-nav-item ${(activeTab === 'overview' || activeTab === 'roster') ? 'active' : ''}`}
        >
          <div className="nav-icon-wrap">
            <LayoutDashboard size={20} />
          </div>
          <span>Home</span>
        </button>

        {/* Tab 2: Timetable */}
        <button
          onClick={() => handleTabClick('timetable')}
          className={`mobile-nav-item ${activeTab === 'timetable' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrap">
            <Calendar size={20} />
          </div>
          <span>Timetable</span>
        </button>

        {/* Center Floating Action Button (FAB) */}
        <div className="mobile-fab-container">
          <button
            onClick={handleCenterFabClick}
            className="mobile-fab-btn"
            title={role === 'student' ? "Scan Live QR" : "Start Live Session"}
          >
            {role === 'student' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Camera size={24} color="#ffffff" />
                <span style={{ fontSize: '0.62rem', fontWeight: 800, marginTop: 1, letterSpacing: '0.02em' }}>SCAN</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QrCode size={24} color="#ffffff" />
                <span style={{ fontSize: '0.62rem', fontWeight: 800, marginTop: 1, letterSpacing: '0.02em' }}>LIVE</span>
              </div>
            )}
            
            {activeSession?.active && (
              <span className="fab-pulse-ring" />
            )}
          </button>
        </div>

        {/* Tab 4: Calculator / Analytics */}
        <button
          onClick={() => handleTabClick(role === 'student' ? 'calc' : 'analytics')}
          className={`mobile-nav-item ${activeTab === 'analytics' || activeTab === 'calc' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrap">
            <Calculator size={20} />
          </div>
          <span>{role === 'student' ? 'Bunk Calc' : 'Analytics'}</span>
        </button>

        {/* Tab 5: History / Vault */}
        <button
          onClick={() => handleTabClick(role === 'student' ? 'history' : 'certificates')}
          className={`mobile-nav-item ${activeTab === 'history' || activeTab === 'certificates' ? 'active' : ''}`}
        >
          <div className="nav-icon-wrap">
            {role === 'student' ? <History size={20} /> : <Award size={20} />}
          </div>
          <span>{role === 'student' ? 'History' : 'Certificates'}</span>
        </button>

      </div>
    </div>
  );
}
