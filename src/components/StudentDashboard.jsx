import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { BunkCalculatorModal } from './BunkCalculatorModal';
import { TimetableGrid } from './TimetableGrid';
import { QuestionBankModal } from './QuestionBankModal';
import { MaterialVaultModal } from './MaterialVaultModal';
import { CertificateModal } from './CertificateModal';
import QRScannerModal from './QRScannerModal';
import MobileBottomNav from './MobileBottomNav';
import { 
  Calculator, 
  Camera, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  BookOpen,
  Award,
  Send,
  Plus,
  FileQuestion,
  Presentation,
  LayoutDashboard,
  QrCode,
  Flame,
  GraduationCap,
  Bell,
  History,
  ShieldCheck,
  TrendingUp,
  X,
  MessageSquareWarning
} from 'lucide-react';

/* ── Attendance Trend SVG Chart ── */
const AttendanceTrendChart = ({ history }) => {
  const W = 560, H = 110, PAD = 12;
  // Aggregate by date → daily presence rate
  const byDate = {};
  history.forEach(h => {
    if (!byDate[h.date]) byDate[h.date] = { present: 0, total: 0 };
    byDate[h.date].total += 1;
    if (h.status === 'present' || h.status === 'late') byDate[h.date].present += 1;
  });
  const dates = Object.keys(byDate).sort();
  if (dates.length < 2) return null;
  const points = dates.map(d => (byDate[d].present / byDate[d].total) * 100);
  const minP = Math.min(...points), maxP = Math.max(...points);
  const range = maxP - minP || 10;

  const toX = i => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const toY = v => H - PAD - ((v - minP) / range) * (H - PAD * 2);

  const polyline = points.map((p, i) => `${toX(i)},${toY(p)}`).join(' ');
  const area = `M ${toX(0)},${H} ` + points.map((p, i) => `L ${toX(i)},${toY(p)}`).join(' ') + ` L ${toX(points.length - 1)},${H} Z`;
  const last = points[points.length - 1];

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <filter id="glowLine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* 75% threshold line */}
        <line
          x1={PAD} y1={toY(75)} x2={W - PAD} y2={toY(75)}
          stroke="rgba(245,158,11,0.35)" strokeWidth="1" strokeDasharray="5,4"
        />
        <text x={W - PAD + 2} y={toY(75) + 4} fill="rgba(245,158,11,0.7)" fontSize="9" textAnchor="start">75%</text>
        {/* Gradient fill */}
        <path d={area} fill="url(#trendGrad)" />
        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#glowLine)" />
        {/* Data dots */}
        {points.map((p, i) => (
          <circle key={i} cx={toX(i)} cy={toY(p)} r="4"
            fill={p >= 75 ? '#10b981' : '#ef4444'}
            stroke="#090d16" strokeWidth="1.5"
          />
        ))}
        {/* Last value label */}
        <text x={toX(points.length - 1)} y={toY(last) - 10} fill="#fff" fontSize="10" textAnchor="middle" fontWeight="700">
          {Math.round(last)}%
        </text>
      </svg>
      {/* Date labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {[dates[0], dates[Math.floor(dates.length / 2)], dates[dates.length - 1]].map(d => (
          <span key={d} style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
            {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Circular Ring ── */
const AttRing = ({ pct, color, size = 64 }) => {
  const r = 15.9155, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

/* ─── Dispute Modal ─── */
const DisputeModal = ({ item, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquareWarning size={20} color="var(--warning)" /> Raise Attendance Dispute
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
          <strong>{item.courseName}</strong>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Date: {item.date} at {item.time} — Marked: <span style={{ color: 'var(--danger)', fontWeight: 700 }}>ABSENT</span>
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
            Reason for Correction Request:
          </label>
          <textarea
            rows="4" value={reason} onChange={e => setReason(e.target.value)}
            className="input-field"
            placeholder="e.g. I was present but the portal timed out during check-in. Faculty allowed entry but marked absent."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={() => { if (reason.trim()) { onSubmit(reason); onClose(); } }}
            className="btn btn-primary" disabled={!reason.trim()}
          >
            <Send size={15} /> Submit Dispute
          </button>
        </div>
      </div>
    </div>
  );
};

export const StudentDashboard = () => {
  const { 
    courses, 
    students, 
    activeStudent,
    timetable, 
    leaves, 
    attendanceHistory,
    announcements,
    disputes,
    targetThreshold, 
    calculateAttendance, 
    calculateBunkStats,
    submitLeaveRequest,
    studentCheckInWithPin,
    studentCheckInWithQR,
    activeSession,
    raiseDispute
  } = useAttendance();

  const student = activeStudent || students[0];
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCourseForCalc, setActiveCourseForCalc] = useState(null);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [disputeItem, setDisputeItem] = useState(null);

  // PIN & QR Check-in State
  const [inputPin, setInputPin] = useState('');
  const [selectedPinCourse, setSelectedPinCourse] = useState(() => activeSession?.courseId || courses[0]?.id || '');

  // Auto-sync selected course when a live session starts
  useEffect(() => {
    if (activeSession?.courseId && activeSession.active) {
      setSelectedPinCourse(activeSession.courseId);
    }
  }, [activeSession]);

  // Leave Form State
  const [leaveCourseId, setLeaveCourseId] = useState(courses[0]?.id || '');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Overall Attendance Math
  const totalConducted = courses.reduce((acc, c) => acc + c.conducted, 0);
  const totalAttended = courses.reduce((acc, c) => acc + c.attended, 0);
  const overallPct = calculateAttendance(totalAttended, totalConducted);
  const safeCourses = courses.filter(c => calculateAttendance(c.attended, c.conducted) >= targetThreshold);
  const warningCourses = courses.filter(c => calculateAttendance(c.attended, c.conducted) < targetThreshold);
  const isExamEligible = warningCourses.length === 0;
  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const estimatedSgpa = (8.2 + (overallPct >= 80 ? 0.6 : (overallPct >= 75 ? 0.3 : -0.5))).toFixed(2);

  // Streak calculation
  const sortedHistory = [...attendanceHistory].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const datesSeen = new Set();
  for (const h of sortedHistory) {
    if (!datesSeen.has(h.date)) {
      datesSeen.add(h.date);
      if (h.status === 'present') streak++;
      else break;
    }
  }

  const handlePinCheckIn = (e) => {
    e.preventDefault();
    if (!inputPin) return;
    if (studentCheckInWithPin(inputPin, selectedPinCourse)) setInputPin('');
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;
    const courseObj = courses.find(c => c.id === leaveCourseId);
    submitLeaveRequest({ subjectId: leaveCourseId, subjectName: courseObj?.name || 'General', date: leaveDate, reason: leaveReason });
    setLeaveDate(''); setLeaveReason(''); setShowLeaveModal(false);
  };

  const TABS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History Log', icon: History },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'qbank', label: 'Question Banks', icon: FileQuestion },
    { id: 'ppt', label: 'PPT Vault', icon: Presentation },
  ];

  const pctColor = (pct) => pct >= targetThreshold + 5 ? 'var(--safe)' : pct >= targetThreshold ? 'var(--warning)' : 'var(--danger)';

  return (
    <div style={{ padding: '1.5rem 0' }}>

      {/* ── Student Hero Banner ── */}
      <div className="glass-panel" style={{
        padding: '1.5rem', marginBottom: '1.25rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.07) 100%)',
        borderColor: 'rgba(99,102,241,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <img src={student.avatar} alt={student.name}
                style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--primary)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'var(--safe)', border: '2px solid var(--bg-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={10} color="white" />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.3rem' }}>{student.name}</h2>
                <span className="badge badge-safe">{student.rollNo}</span>
                <span className="badge badge-info">3-1 Sem</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '0.25rem' }}>
                {student.department} &bull; {student.section}
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                📧 {student.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Streak Badge */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.12))',
              padding: '0.6rem 1.1rem', borderRadius: '14px',
              border: '1px solid rgba(245,158,11,0.35)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <Flame size={22} color="#f59e0b" style={{ animation: 'streakFlame 1.5s ease-in-out infinite' }} />
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Streak</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>{streak} Days 🔥</div>
              </div>
            </div>

            <button onClick={() => { setActiveCourseForCalc(null); setShowCalcModal(true); }} className="btn btn-primary" style={{ padding: '0.7rem 1.3rem' }}>
              <Calculator size={17} /> Bunk Predictor
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Sub-views ── */}
      {activeTab === 'certificates' && <CertificateModal role="student" />}
      {activeTab === 'timetable' && <TimetableGrid />}
      {activeTab === 'qbank' && <QuestionBankModal />}
      {activeTab === 'ppt' && <MaterialVaultModal />}

      {/* ── History Log Tab ── */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--primary)" /> Attendance History Timeline
          </h3>

          {/* Trend Chart */}
          {attendanceHistory.length > 3 && (
            <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={16} color="var(--primary)" /> Daily Attendance Trend
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Last {Object.keys(attendanceHistory.reduce((a,h)=>{a[h.date]=1;return a;},{})).length} active days</span>
              </div>
              <AttendanceTrendChart history={attendanceHistory} />
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...attendanceHistory].sort((a,b) => b.date.localeCompare(a.date)).map((item, idx) => {
                  const isA = item.status === 'absent';
                  const isL = item.status === 'late';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)', animation: `cardReveal 0.3s ease-out ${idx * 0.02}s both` }}>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {item.date} <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 400 }}>({item.time})</span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-muted)', maxWidth: '200px' }}>{item.courseName}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <span className={`badge ${isA ? 'badge-danger' : isL ? 'badge-warning' : 'badge-safe'}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                        {isA && (
                          <button
                            onClick={() => setDisputeItem(item)}
                            className="btn"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', color: 'var(--warning)', border: '1px solid var(--warning-border)', background: 'var(--warning-bg)', borderRadius: '6px', gap: '0.3rem' }}
                          >
                            <AlertTriangle size={11} /> Dispute
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Disputes submitted */}
          {disputes.length > 0 && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={16} /> My Dispute Requests ({disputes.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {disputes.map(d => (
                  <div key={d.id} className="ann-card" style={{ borderLeftColor: d.status.includes('Resolved') ? 'var(--safe)' : d.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.88rem' }}>{d.courseName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '0.5rem' }}>{d.lectureDate} · {d.time}</span>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{d.reason}</p>
                        {d.remarks && d.remarks !== 'Awaiting Faculty Verification' && (
                          <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginTop: '0.15rem' }}>Remarks: {d.remarks}</p>
                        )}
                      </div>
                      <span className={`badge ${d.status.includes('Resolved') ? 'badge-safe' : d.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Overview Dashboard ── */}
      {activeTab === 'overview' && (
        <>
          {/* Live Classroom Check-In (QR & PIN) */}
          <div className="glass-panel" style={{
            padding: '1.25rem', marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(6,182,212,0.08))',
            borderColor: 'rgba(99,102,241,0.35)',
            boxShadow: '0 8px 32px rgba(99,102,241,0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <QrCode size={18} color="var(--primary)" /> Live Classroom Attendance
                  </h4>
                  {activeSession?.active && (
                    <span className="badge badge-safe" style={{ fontSize: '0.68rem', animation: 'pulse 2s infinite' }}>
                      🔴 LIVE: {activeSession.courseCode || activeSession.courseName}
                    </span>
                  )}
                  <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.3)' }}>
                    🔒 Anti-Proxy
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                  📍 Campus Bound &bull; 📸 Auto Course Detection &bull; ⚡ Instant Verification
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {/* 1. Camera QR Scanner Button */}
                <button
                  type="button"
                  onClick={() => setShowScannerModal(true)}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={16} />
                  Scan QR Code
                </button>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>OR</span>

                {/* 2. Manual PIN Form */}
                <form onSubmit={handlePinCheckIn} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <select
                    value={selectedPinCourse}
                    onChange={e => setSelectedPinCourse(e.target.value)}
                    className="input-field"
                    style={{ width: 'auto', padding: '0.5rem 0.65rem', fontSize: '0.8rem', borderRadius: 10 }}
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} {c.id === activeSession?.courseId ? '• (LIVE)' : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    maxLength={4}
                    value={inputPin}
                    onChange={e => setInputPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN"
                    className="input-field"
                    style={{ width: '80px', textAlign: 'center', letterSpacing: '3px', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-mono)', borderRadius: 10 }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '0.55rem 0.85rem', fontSize: '0.82rem', borderRadius: 10 }}>
                    <CheckCircle2 size={14} /> PIN
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>

            {/* Overall % */}
            <div className="stat-card" style={{ '--accent-top': `linear-gradient(90deg, ${pctColor(overallPct)}, transparent)` }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Overall Attendance</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AttRing pct={overallPct} color={pctColor(overallPct)} size={64} />
                  <span style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 800, color: pctColor(overallPct) }}>{overallPct}%</span>
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pctColor(overallPct) }}>{overallPct}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{totalAttended}/{totalConducted} classes</div>
                </div>
              </div>
            </div>

            {/* Exam Eligibility */}
            <div className="stat-card" style={{ '--accent-top': `linear-gradient(90deg, ${isExamEligible ? 'var(--safe)' : 'var(--danger)'}, transparent)` }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mid-Exam Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ padding: '0.7rem', borderRadius: '12px', background: isExamEligible ? 'var(--safe-bg)' : 'var(--danger-bg)' }}>
                  <ShieldCheck size={24} color={isExamEligible ? 'var(--safe)' : 'var(--danger)'} />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isExamEligible ? 'var(--safe)' : 'var(--danger)' }}>
                    {isExamEligible ? '✅ ELIGIBLE' : '❌ SHORTAGE'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isExamEligible ? `${safeCourses.length} courses safe` : `${warningCourses.length} course(s) critical`}
                  </div>
                </div>
              </div>
            </div>

            {/* SGPA */}
            <div className="stat-card" style={{ '--accent-top': 'linear-gradient(90deg, var(--accent-purple), transparent)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Est. SGPA</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ padding: '0.7rem', borderRadius: '12px', background: 'rgba(139,92,246,0.12)' }}>
                  <GraduationCap size={24} color="var(--accent-purple)" />
                </div>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)', lineHeight: 1 }}>
                    {estimatedSgpa}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{totalCredits} Credits · out of 10.0</div>
                </div>
              </div>
            </div>

            {/* Safe / Danger Courses */}
            <div className="stat-card" style={{ '--accent-top': 'linear-gradient(90deg, var(--accent-cyan), transparent)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Course Health</span>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--safe)', fontWeight: 700 }}>✓ Safe ({safeCourses.length})</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 700 }}>✗ Critical ({warningCourses.length})</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(safeCourses.length / courses.length) * 100}%`, background: 'linear-gradient(90deg, var(--safe), var(--accent-cyan))' }} />
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>Threshold: {targetThreshold}% required</p>
              </div>
            </div>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--primary)' }}>
              <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                <Bell size={17} color="var(--primary)" /> Campus Notice Board
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                {announcements.map((ann, i) => {
                  const borderColor = ann.priority === 'high' ? 'var(--danger)' : ann.priority === 'medium' ? 'var(--warning)' : 'var(--border-glow)';
                  return (
                    <div key={ann.id} className="ann-card" style={{ borderLeftColor: borderColor, animationDelay: `${i * 0.06}s` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <strong style={{ fontSize: '0.88rem' }}>{ann.title}</strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{ann.date}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.45 }}>{ann.message}</p>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--primary)' }}>— {ann.author} · {ann.authorRole}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Grid — 2 cols desktop / 1 col mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) clamp(260px, 30%, 340px)', gap: '1.5rem', alignItems: 'start' }} className="overview-main-grid">

            {/* Subject Cards */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={19} color="var(--primary)" /> Subject Attendance
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{courses.length} courses enrolled</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {courses.map((course, idx) => {
                  const pct = calculateAttendance(course.attended, course.conducted);
                  const { canBunk, neededToAttend } = calculateBunkStats(course.conducted, course.attended, targetThreshold);
                  const color = pctColor(pct);
                  let badgeClass = pct >= targetThreshold + 5 ? 'badge-safe' : pct >= targetThreshold ? 'badge-warning' : 'badge-danger';
                  return (
                    <div key={course.id} className="course-card"
                      style={{ borderLeftColor: course.color, animationDelay: `${idx * 0.05}s` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: course.color, flexShrink: 0, boxShadow: `0 0 6px ${course.color}80` }} />
                            <h4 style={{ fontSize: '0.97rem', lineHeight: 1.3 }}>{course.name}</h4>
                            <span className="badge" style={{ background: `${course.color}18`, color: course.color, border: `1px solid ${course.color}40` }}>{course.code}</span>
                          </div>
                          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {course.faculty} · {course.room} · {course.credits} Credits
                          </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AttRing pct={pct} color={color} size={52} />
                            <span style={{ position: 'absolute', fontSize: '0.65rem', fontWeight: 800, color }}>{pct}%</span>
                          </div>
                          <button onClick={() => { setActiveCourseForCalc(course); setShowCalcModal(true); }}
                            className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                            <Calculator size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                          <span>{course.attended}/{course.conducted} classes</span>
                          <span style={{ fontWeight: 700, color }}>{pct}%</span>
                        </div>
                        <div className="progress-bar-bg" style={{ height: '8px' }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}bb)` }} />
                        </div>
                      </div>

                      <div style={{
                        padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem',
                        background: pct >= targetThreshold ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        color: pct >= targetThreshold ? 'var(--safe)' : 'var(--danger)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span>
                          {pct >= targetThreshold
                            ? `✓ Can skip ${canBunk} more class${canBunk !== 1 ? 'es' : ''}`
                            : `⚠ Attend ${neededToAttend} more to reach ${targetThreshold}%`}
                        </span>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem' }}>
                          {pct >= targetThreshold + 5 ? 'SAFE' : pct >= targetThreshold ? 'BORDERLINE' : 'CRITICAL'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Today's Schedule */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
                  <Clock size={17} color="var(--accent-cyan)" /> Today's Schedule
                  <span style={{ fontSize: '0.68rem', marginLeft: 'auto', color: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {timetable.map((slot, i) => {
                    const statusColor = slot.status === 'Present' ? 'var(--safe)'
                      : slot.status === 'Absent' ? 'var(--danger)'
                      : 'var(--accent-amber)';
                    const statusBg = slot.status === 'Present' ? 'rgba(16,185,129,0.08)'
                      : slot.status === 'Absent' ? 'rgba(239,68,68,0.08)'
                      : 'rgba(245,158,11,0.08)';
                    return (
                      <div key={slot.id} style={{
                        borderRadius: 12,
                        background: statusBg,
                        border: `1px solid ${statusColor}30`,
                        padding: '0.7rem 0.85rem',
                        borderLeft: `3px solid ${statusColor}`,
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            {slot.time}
                          </span>
                          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: statusColor, background: `${statusColor}15`, padding: '2px 7px', borderRadius: 6 }}>
                            {slot.status}
                          </span>
                        </div>
                        <h5 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, margin: '0 0 0.15rem 0' }}>
                          {slot.courseName}
                        </h5>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                          {slot.room} · {slot.type}
                        </p>
                      </div>
                    );
                  })}
                  {timetable.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>
                      No classes today 🎉
                    </p>
                  )}
                </div>
              </div>

              {/* Leave Logs */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={17} color="var(--accent-purple)" /> Leave Requests
                  </h3>
                  <button onClick={() => setShowLeaveModal(true)} className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}>
                    <Plus size={13} /> Apply
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {leaves.map(lv => (
                    <div key={lv.id} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.025)', fontSize: '0.78rem', borderLeft: `2px solid ${lv.status === 'Approved' ? 'var(--safe)' : 'var(--warning)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '0.82rem' }}>{lv.subjectName}</strong>
                        <span style={{ fontSize: '0.7rem', color: lv.status === 'Approved' ? 'var(--safe)' : 'var(--warning)', fontWeight: 700 }}>
                          {lv.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>{lv.reason}</p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{lv.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── QR Scanner Camera Modal ── */}
      {showScannerModal && (
        <QRScannerModal
          activeSession={activeSession}
          onClose={() => setShowScannerModal(false)}
          onScanSuccess={(decodedText) => {
            return studentCheckInWithQR(decodedText);
          }}
        />
      )}

      {/* ── Bunk Calculator Modal ── */}
      {showCalcModal && (
        <BunkCalculatorModal course={activeCourseForCalc} onClose={() => setShowCalcModal(false)} />
      )}

      {/* ── Dispute Modal ── */}
      {disputeItem && (
        <DisputeModal
          item={disputeItem}
          onClose={() => setDisputeItem(null)}
          onSubmit={(reason) => raiseDispute({
            courseId: disputeItem.courseId,
            courseName: disputeItem.courseName,
            lectureDate: disputeItem.date,
            time: disputeItem.time,
            reason
          })}
        />
      )}

      {/* ── Leave Modal ── */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '430px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Medical / Duty Exemption Request</h3>
              <button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>Subject</label>
                <select value={leaveCourseId} onChange={e => setLeaveCourseId(e.target.value)} className="input-field">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>Date of Absence</label>
                <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)} required className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>Reason / Document Details</label>
                <textarea rows="3" value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
                  placeholder="e.g. Medical viral fever / Inter-college hackathon event" required className="input-field" style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Send size={15} /> Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Pro Mobile Bottom Navigation Bar ── */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenScanner={() => setShowScannerModal(true)}
      />
    </div>
  );
};
