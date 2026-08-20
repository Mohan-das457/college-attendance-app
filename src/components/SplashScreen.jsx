import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 300);
    const t2 = setTimeout(() => setPhase('out'), 2000);
    const t3 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #090d16 0%, #0f1729 50%, #090d16 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: phase === 'out' ? 0 : 1,
      transition: 'opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes splashOrbPulse {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.5; }
          50% { transform: scale(1.18) translate(20px, -20px); opacity: 0.8; }
        }
        @keyframes splashOrbPulse2 {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.4; }
          50% { transform: scale(0.88) translate(-30px, 25px); opacity: 0.7; }
        }
        @keyframes splashLogoReveal {
          0% { transform: scale(0.6) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes splashTextSlide {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes splashTagline {
          0% { transform: translateY(15px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes splashRingRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splashRingRotateReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Background Orbs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        borderRadius: '50%', left: '-100px', top: '-100px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'splashOrbPulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', right: '-80px', bottom: '-80px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'splashOrbPulse2 5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        borderRadius: '50%', left: '60%', top: '15%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        filter: 'blur(35px)',
        animation: 'splashOrbPulse 6s ease-in-out infinite 1s',
      }} />

      {/* Decorative rings */}
      <div style={{
        position: 'absolute',
        width: '320px', height: '320px',
        borderRadius: '50%',
        border: '1px solid rgba(99,102,241,0.12)',
        animation: 'splashRingRotate 12s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: '420px', height: '420px',
        borderRadius: '50%',
        border: '1px dashed rgba(139,92,246,0.08)',
        animation: 'splashRingRotateReverse 18s linear infinite',
      }} />

      {/* Main Content */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '1.5rem',
        position: 'relative', zIndex: 2,
        animation: 'splashLogoReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
      }}>
        {/* Logo Icon */}
        <div style={{
          width: '88px', height: '88px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #06b6d4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(99,102,241,0.55), 0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
        }}>
          {/* Graduation Cap SVG */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          {/* Glow dot */}
          <div style={{
            position: 'absolute', top: '-3px', right: '-3px',
            width: '16px', height: '16px',
            borderRadius: '50%',
            background: '#06b6d4',
            boxShadow: '0 0 12px rgba(6,182,212,0.8)',
            border: '2px solid #090d16',
          }} />
        </div>

        {/* Brand Name */}
        <div style={{
          textAlign: 'center',
          animation: 'splashTextSlide 0.5s ease-out 0.35s both',
        }}>
          <h1 style={{
            fontSize: '2.4rem', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.1,
            background: 'linear-gradient(90deg, #ffffff 0%, #c4b5fd 50%, #67e8f9 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            AttendTrack<span style={{ WebkitTextFillColor: '#67e8f9' }}>.AI</span>
          </h1>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(156,163,175,0.8)',
            fontWeight: 500, marginTop: '0.3rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            animation: 'splashTagline 0.5s ease-out 0.55s both',
          }}>
            SmartCampus · MITS · 2026
          </p>
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center',
          animation: 'splashTagline 0.5s ease-out 0.7s both',
        }}>
          {['📍 GPS Geo-Fenced', '🔐 PIN Sessions', '📊 AI Analytics'].map((pill, i) => (
            <span key={i} style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              fontSize: '0.72rem', fontWeight: 600,
              color: 'rgba(196,181,253,0.9)',
              letterSpacing: '0.02em',
            }}>{pill}</span>
          ))}
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.8)',
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{
        position: 'absolute', bottom: '2rem',
        fontSize: '0.72rem', color: 'rgba(107,114,128,0.7)',
        letterSpacing: '0.05em', animation: 'splashTagline 0.5s ease-out 0.8s both',
      }}>
        Malineni Institute of Technology &amp; Science
      </div>
    </div>
  );
};

export default SplashScreen;
