import React, { useState, useEffect } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationToast } from './components/NotificationToast';
import LoginPage from './components/LoginPage';
import SplashScreen from './components/SplashScreen';

const MainContent = ({ theme, toggleTheme, onLogout }) => {
  const { role } = useAttendance();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} />
      
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        {role === 'student' && <StudentDashboard />}
        {role === 'teacher' && <TeacherDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--border-light)', 
        padding: '1.25rem 0', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--text-dim)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>SmartCampus AttendTrack &copy; 2026 · Malineni Institute of Technology &amp; Science</span>
          <span style={{ color: 'var(--text-dim)' }}>College Attendance Management System &amp; Bunk Goal Engine</span>
        </div>
      </footer>

      <NotificationToast />
    </div>
  );
};

const AppInner = ({ theme, toggleTheme }) => {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('attendtrack_session') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('attendtrack_session', 'true');
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('attendtrack_session');
    localStorage.removeItem('attendtrack_logged_role');
    setLoggedIn(false);
  };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;
  return <MainContent theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />;
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('attendtrack_theme') || 'dark';
  });

  // Show splash only on very first ever visit (no session token)
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('attendtrack_splash_seen');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('attendtrack_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSplashDone = () => {
    localStorage.setItem('attendtrack_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <AttendanceProvider>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <AppInner theme={theme} toggleTheme={toggleTheme} />
    </AttendanceProvider>
  );
}
