import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TimetableGrid } from './TimetableGrid';
import { QuestionBankModal } from './QuestionBankModal';
import { MaterialVaultModal } from './MaterialVaultModal';
import { CertificateModal } from './CertificateModal';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  QrCode, 
  Save, 
  Send, 
  Users, 
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Calendar,
  FileQuestion,
  Presentation,
  CheckSquare,
  User,
  Search,
  BarChart2,
  Bell,
  Award,
  Plus,
  History,
  Trash2,
  X,
  Timer,
  ShieldCheck
} from 'lucide-react';

export const TeacherDashboard = () => {
  const { 
    courses, 
    students, 
    teachers,
    activeTeacher,
    setActiveTeacherId,
    targetThreshold, 
    markSessionAttendance, 
    sendLowAttendanceAlert,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    sessionHistory,
    disputes,
    resolveDispute
  } = useAttendance();

  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'certificates' | 'analytics' | 'announcements' | 'timetable' | 'qbank' | 'ppt'

  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Search & Filter state for Roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState('all'); // 'all' | 'present' | 'absent'

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState('');
  const [annMsg, setAnnMsg] = useState('');
  const [annPriority, setAnnPriority] = useState('medium');

  // Attendance Map for Roster
  const [attendanceMap, setAttendanceMap] = useState(() => {
    const initial = {};
    students.forEach(s => { initial[s.id] = 'present'; });
    return initial;
  });

  const [showQrModal, setShowQrModal] = useState(false);
  const [sessionPin, setSessionPin] = useState('7842');
  const [pinCountdown, setPinCountdown] = useState(60);
  const [pinTimerActive, setPinTimerActive] = useState(false);

  // Dispute resolve state (inline, no prompt)
  const [resolveId, setResolveId] = useState(null);
  const [resolveRemarks, setResolveRemarks] = useState('');

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = () => {
    markSessionAttendance(selectedCourseId, attendanceMap);
  };

  const generateNewPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setSessionPin(pin);
    setPinCountdown(60);
    setPinTimerActive(true);
  };

  const startSession = () => {
    generateNewPin();
    setShowQrModal(true);
  };

  // Countdown timer for PIN
  useEffect(() => {
    if (!pinTimerActive || !showQrModal) return;
    if (pinCountdown <= 0) { setPinTimerActive(false); return; }
    const t = setTimeout(() => setPinCountdown(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [pinTimerActive, pinCountdown, showQrModal]);

  const handleResolveDispute = (disputeId, newStatus) => {
    if (!resolveRemarks.trim()) return;
    resolveDispute(disputeId, newStatus, resolveRemarks, activeTeacher.name);
    setResolveId(null);
    setResolveRemarks('');
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle || !annMsg) return;
    addAnnouncement({
      title: annTitle,
      message: annMsg,
      priority: annPriority,
      courseId: selectedCourseId
    });
    setAnnTitle('');
    setAnnMsg('');
  };

  // Filter students in roster
  const filteredStudents = students.filter(st => {
    if (rosterSearch) {
      const q = rosterSearch.toLowerCase();
      if (!st.name.toLowerCase().includes(q) && !st.rollNo.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (rosterFilter !== 'all') {
      const status = attendanceMap[st.id] || 'present';
      if (status !== rosterFilter) return false;
    }
    return true;
  });

  // Stats calculation for active marking session
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter(v => v === 'present' || v === 'late').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'absent').length;
  const todayPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  return (
    <div style={{ padding: '1.5rem 0' }}>
      
      {/* Faculty Header Banner with Account Switcher */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={activeTeacher.avatar} 
            alt={activeTeacher.name} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem' }}>{activeTeacher.name}</h2>
              <span className="badge badge-safe">{activeTeacher.title}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              {activeTeacher.department} • Email: {activeTeacher.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Switch Faculty Account Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <User size={15} color="var(--primary)" />
            <select
              value={activeTeacher.id}
              onChange={(e) => setActiveTeacherId(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id} style={{ background: 'var(--bg-dark)' }}>
                  Switch Faculty: {t.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={startSession} 
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', animation: 'pulseGlow 2.5s ease-in-out infinite' }}
          >
            <QrCode size={18} />
            Start Live PIN Session
          </button>
        </div>

      </div>

      {/* Faculty Module Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        {[
          { id: 'roster', label: 'Mark Roster', icon: CheckSquare },
          { id: 'certificates', label: 'Certificates', icon: Award },
          { id: 'disputes', label: `Disputes (${disputes.filter(d => d.status === 'Pending').length})`, icon: AlertTriangle },
          { id: 'analytics', label: 'Analytics', icon: BarChart2 },
          { id: 'announcements', label: 'Notice Board', icon: Bell },
          { id: 'timetable', label: 'Timetable', icon: Calendar },
          { id: 'qbank', label: 'Question Banks', icon: FileQuestion },
          { id: 'ppt', label: 'PPT Vault', icon: Presentation },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>



      {/* Render Active Sub-Components */}
      {activeTab === 'certificates' && <CertificateModal role="teacher" />}
      {activeTab === 'timetable' && <TimetableGrid />}
      {activeTab === 'qbank' && <QuestionBankModal />}
      {activeTab === 'ppt' && <MaterialVaultModal />}

      {/* SUB-TAB: Attendance Disputes & Correction Review */}
      {activeTab === 'disputes' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--warning)" /> Student Attendance Correction Requests ({disputes.length})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Review attendance disputes raised by students. Approving automatically updates the student's attendance percentage.
          </p>

          {disputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
              No pending attendance disputes.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {disputes.map(d => {
                const isPending = d.status === 'Pending';
                return (
                  <div 
                    key={d.id} 
                    style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      padding: '1.25rem', 
                      borderRadius: '12px', 
                      borderLeft: `4px solid ${isPending ? 'var(--warning)' : (d.status.includes('Resolved') ? 'var(--safe)' : 'var(--danger)')}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{d.studentName}</strong>
                        <span className="badge badge-safe">{d.rollNo}</span>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)' }}>{d.courseName}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <strong>Lecture Date & Time:</strong> {d.lectureDate} ({d.time})
                      </div>
                      <div style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <strong>Student Reason:</strong> "{d.reason}"
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                        Status: <strong style={{ color: isPending ? 'var(--warning)' : (d.status.includes('Resolved') ? 'var(--safe)' : 'var(--danger)') }}>{d.status}</strong> • Handled by: {d.resolvedBy}
                      </div>
                    </div>

                    {isPending && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '240px' }}>
                        {resolveId === d.id ? (
                          <>
                            <textarea
                              rows="2"
                              value={resolveRemarks}
                              onChange={e => setResolveRemarks(e.target.value)}
                              className="input-field"
                              placeholder="Enter remarks for student..."
                              style={{ fontSize: '0.78rem', resize: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleResolveDispute(d.id, 'Resolved - Marked Present')}
                                className="btn btn-success"
                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                onClick={() => handleResolveDispute(d.id, 'Rejected')}
                                className="btn btn-danger"
                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                              >
                                <XCircle size={13} /> Reject
                              </button>
                              <button
                                onClick={() => { setResolveId(null); setResolveRemarks(''); }}
                                className="btn btn-secondary"
                                style={{ padding: '0.4rem', fontSize: '0.75rem' }}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => { setResolveId(d.id); setResolveRemarks(''); }}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
                          >
                            <UserCheck size={14} /> Review & Decide
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: Attendance Analytics & Bar Charts */}
      {activeTab === 'analytics' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} color="var(--primary)" /> Subject-Wise Class Turnout &amp; Weekly Trends
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Subject Turnout — Horizontal Bars */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>📊 Subject Attendance (%)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {courses.map((c, i) => {
                  const pct = Math.round((c.attended / c.conducted) * 100);
                  return (
                    <div key={c.id} style={{ animation: `cardReveal 0.4s ease-out ${i * 0.07}s both` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                          {c.code}
                        </span>
                        <strong style={{ color: pct >= targetThreshold ? 'var(--safe)' : 'var(--danger)', fontFamily: 'var(--font-mono)' }}>{pct}%</strong>
                      </div>
                      <div className="progress-bar-bg" style={{ height: '9px' }}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c.color}, ${c.color}aa)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5-Week SVG Bar Chart */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>📅 5-Week Attendance Trend</h4>
              <div style={{ position: 'relative' }}>
                <svg width="100%" viewBox="0 0 300 160" preserveAspectRatio="none">
                  <defs>
                    {[['#10b981',88],['#10b981',84],['#f59e0b',79],['#10b981',83],['#10b981',89]].map(([c,], idx) => (
                      <linearGradient key={idx} id={`wg${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity="0.9"/>
                        <stop offset="100%" stopColor={c} stopOpacity="0.4"/>
                      </linearGradient>
                    ))}
                  </defs>
                  {/* Threshold line */}
                  <line x1="0" y1={160 - (75/100)*130} x2="300" y2={160 - (75/100)*130}
                    stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="6,4"/>
                  <text x="302" y={160 - (75/100)*130 + 4} fill="rgba(245,158,11,0.7)" fontSize="8">75%</text>
                  {[{w:'W1',pct:88,c:'#10b981'},{w:'W2',pct:84,c:'#10b981'},{w:'W3',pct:79,c:'#f59e0b'},{w:'W4',pct:83,c:'#10b981'},{w:'W5',pct:89,c:'#10b981'}].map((wk, idx) => {
                    const barW = 36, gap = 20, x = idx * (barW + gap) + 14;
                    const barH = (wk.pct / 100) * 130;
                    return (
                      <g key={idx}>
                        <rect x={x} y={160 - barH} width={barW} height={barH}
                          fill={`url(#wg${idx})`} rx="4"
                          style={{ animation: `barGrow 0.6s cubic-bezier(0.34,1.56,0.64,1) ${idx * 0.1}s both`, transformOrigin: `${x + barW/2}px 160px` }}
                        />
                        <text x={x + barW/2} y={160 - barH - 6} fill={wk.c} fontSize="10" textAnchor="middle" fontWeight="700">{wk.pct}%</text>
                        <text x={x + barW/2} y="158" fill="rgba(107,114,128,0.9)" fontSize="9" textAnchor="middle">{wk.w}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Bulk Past Session History Logs */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} color="var(--primary)" /> Past Lecture Sessions Log
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '0.75rem' }}>Date & Time</th>
                    <th style={{ padding: '0.75rem' }}>Subject Name</th>
                    <th style={{ padding: '0.75rem' }}>Classroom</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Turnout</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Present / Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionHistory.map(s => {
                    const turnoutPct = Math.round((s.presentCount / s.totalStudents) * 100);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.date} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>({s.time})</span></td>
                        <td style={{ padding: '0.75rem' }}>{s.courseName}</td>
                        <td style={{ padding: '0.75rem' }}>{s.room}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span className={`badge ${turnoutPct >= targetThreshold ? 'badge-safe' : 'badge-danger'}`}>{turnoutPct}%</span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{ color: 'var(--safe)', fontWeight: 700 }}>{s.presentCount} P</span> / <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{s.absentCount} A</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Post Announcement & Notices */}
      {activeTab === 'announcements' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--primary)" /> Broadcast Announcements to Students
          </h3>

          <form onSubmit={handlePostAnnouncement} style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Announcement Title:
                </label>
                <input 
                  type="text" 
                  value={annTitle} 
                  onChange={e => setAnnTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Lab Test Schedule Announced" 
                  required 
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Priority Level:
                </label>
                <select 
                  value={annPriority} 
                  onChange={e => setAnnPriority(e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  <option value="high">🔴 High Priority (Exam / Urgent)</option>
                  <option value="medium">🟡 Medium Priority (Schedule)</option>
                  <option value="low">🟢 General Notice</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Message Content:
              </label>
              <textarea 
                rows="3" 
                value={annMsg} 
                onChange={e => setAnnMsg(e.target.value)}
                placeholder="Enter details about the announcement..." 
                required 
                className="input-field" 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> Publish Announcement
              </button>
            </div>
          </form>

          {/* List of Active Announcements */}
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Active Published Announcements ({announcements.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {announcements.map(ann => (
              <div key={ann.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{ann.title}</strong>
                    <span className="badge" style={{ background: ann.priority === 'high' ? 'var(--danger-bg)' : 'rgba(255,255,255,0.06)', color: ann.priority === 'high' ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.7rem' }}>
                      {ann.priority.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{ann.message}</p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Posted on {ann.date} by {ann.author} ({ann.authorRole})
                  </span>
                </div>

                <button 
                  onClick={() => deleteAnnouncement(ann.id)} 
                  className="btn btn-danger" 
                  style={{ padding: '0.35rem', borderRadius: '6px' }}
                  title="Delete announcement"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: Attendance Roster */}
      {activeTab === 'roster' && (
        <>
          {/* Selector Controls Bar */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Select Class / Subject:
              </label>
              <select 
                value={selectedCourseId} 
                onChange={(e) => setSelectedCourseId(e.target.value)} 
                className="input-field"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - {c.schedule}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Lecture Date:
              </label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
                className="input-field" 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Batch Quick Actions:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleMarkAll('present')} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem' }}
                >
                  All Present
                </button>
                <button 
                  onClick={() => handleMarkAll('absent')} 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem' }}
                >
                  All Absent
                </button>
              </div>
            </div>
          </div>

          {/* Main Roster Section & Session Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* Student Marking Table */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="var(--primary)" /> Student Roster - {activeCourse.name}
                </h3>

                {/* Roster Search Bar */}
                <div style={{ position: 'relative', width: '200px' }}>
                  <input 
                    type="text" 
                    placeholder="Search student..."
                    value={rosterSearch}
                    onChange={e => setRosterSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2rem', padding: '0.35rem 0.6rem 0.35rem 2rem', fontSize: '0.78rem' }}
                  />
                  <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '0.75rem' }}>Student Name & Roll</th>
                      <th style={{ padding: '0.75rem' }}>Current %</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Mark Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((st, idx) => {
                      const currentStatus = attendanceMap[st.id] || 'present';
                      const currentCoursePct = idx === 1 ? 71.4 : (idx === 2 ? 63.3 : 88.0);

                      return (
                        <tr key={st.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img 
                                src={st.avatar} 
                                alt={st.name} 
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                              />
                              <div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{st.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.rollNo}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem' }}>
                            <span className={`badge ${currentCoursePct >= targetThreshold ? 'badge-safe' : 'badge-danger'}`}>
                              {currentCoursePct}%
                            </span>
                          </td>

                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '8px' }}>
                              <button
                                onClick={() => handleStatusChange(st.id, 'present')}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: currentStatus === 'present' ? 'var(--safe)' : 'transparent',
                                  color: currentStatus === 'present' ? '#fff' : 'var(--text-muted)',
                                  fontWeight: 600
                                }}
                              >
                                P
                              </button>

                              <button
                                onClick={() => handleStatusChange(st.id, 'absent')}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: currentStatus === 'absent' ? 'var(--danger)' : 'transparent',
                                  color: currentStatus === 'absent' ? '#fff' : 'var(--text-muted)',
                                  fontWeight: 600
                                }}
                              >
                                A
                              </button>

                              <button
                                onClick={() => handleStatusChange(st.id, 'late')}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: currentStatus === 'late' ? 'var(--warning)' : 'transparent',
                                  color: currentStatus === 'late' ? '#fff' : 'var(--text-muted)',
                                  fontWeight: 600
                                }}
                              >
                                L
                              </button>
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            {currentCoursePct < targetThreshold && (
                              <button
                                onClick={() => sendLowAttendanceAlert(st.name, activeCourse.name, currentCoursePct)}
                                className="btn btn-danger"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                                title="Send Low Attendance Alert to Student"
                              >
                                <Send size={12} /> Alert
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleSaveAttendance} 
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                >
                  <Save size={18} /> Save & Register Session Attendance
                </button>
              </div>
            </div>

            {/* Session Summary Widget */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Today's Class Summary</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Class Turnout:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--safe)' }}>{todayPct}%</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Present Count:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--safe)' }}>{presentCount} / {totalCount}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Absent Count:</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)' }}>{absentCount}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', background: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={18} /> Debarment Policy Alert
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  Students with attendance below <strong>{targetThreshold}%</strong> will not be eligible to write upcoming mid-term examinations.
                </p>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Live PIN Session Modal */}
      {showQrModal && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.9)' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f1729, #090d16)',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            width: '100%', maxWidth: '480px',
            textAlign: 'center',
            boxShadow: '0 0 80px rgba(99,102,241,0.25), 0 30px 60px rgba(0,0,0,0.8)',
            position: 'relative',
          }}>
            <button onClick={() => { setShowQrModal(false); setPinTimerActive(false); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(99,102,241,0.15)' }}>
                <QrCode size={20} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live Classroom Session</h3>
              <span className="badge badge-safe" style={{ fontSize: '0.65rem' }}>🔴 LIVE</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {activeCourse?.name} &bull; Show PIN on projector for students to check in
            </p>

            {/* Big PIN Display */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '2px solid rgba(99,102,241,0.4)',
              borderRadius: '20px', padding: '1.5rem',
              marginBottom: '1.5rem',
              animation: 'countdownPulse 2s ease-in-out infinite'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Session PIN Code
              </div>
              <div style={{
                fontSize: '4rem', fontWeight: 900, letterSpacing: '0.3em',
                fontFamily: 'var(--font-mono)',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                textShadow: 'none',
              }}>
                {sessionPin}
              </div>
              {/* Countdown ring */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                <Timer size={14} color={pinCountdown <= 10 ? 'var(--danger)' : 'var(--text-dim)'} />
                <span style={{
                  fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                  color: pinCountdown <= 10 ? 'var(--danger)' : 'var(--text-muted)'
                }}>
                  {pinTimerActive ? `Expires in ${pinCountdown}s` : 'Timer inactive'}
                </span>
              </div>
            </div>

            {/* Session Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Present', value: presentCount, color: 'var(--safe)' },
                { label: 'Absent', value: absentCount, color: 'var(--danger)' },
                { label: 'Turnout', value: `${todayPct}%`, color: 'var(--primary)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color, marginTop: '0.25rem' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={generateNewPin} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }}>
                <RefreshCw size={15} /> New PIN
              </button>
              <button
                onClick={() => { markSessionAttendance(selectedCourseId, attendanceMap); setShowQrModal(false); setPinTimerActive(false); }}
                className="btn btn-primary" style={{ flex: 2, fontSize: '0.85rem' }}
              >
                <Save size={15} /> Save &amp; Close Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
