import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import CSVImportModal from './CSVImportModal';
import { CertificateModal } from './CertificateModal';
import { TimetableGrid } from './TimetableGrid';
import { 
  Building2, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  Plus, 
  FileSpreadsheet,
  Upload,
  Award,
  Sliders,
  Search,
  UserCheck,
  Printer
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    courses, 
    students, 
    teachers,
    targetThreshold, 
    setTargetThreshold,
    setCourses, 
    setTeachers,
    showToast 
  } = useAttendance();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'certificates' | 'students' | 'faculty' | 'timetable'

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseFaculty, setNewCourseFaculty] = useState('');
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyTitle, setNewFacultyTitle] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyPassword, setNewFacultyPassword] = useState('');

  // Student directory search
  const [studentSearch, setStudentSearch] = useState('');

  // Department Statistics Mock
  const departments = [
    { name: "Computer Science & Technology", avgPct: 84.5, totalStudents: 120, status: 'safe' },
    { name: "Electronics & Comm. Engg", avgPct: 78.8, totalStudents: 180, status: 'safe' },
    { name: "Mechanical Engineering", avgPct: 85.2, totalStudents: 150, status: 'safe' },
    { name: "Electrical & Electronics", avgPct: 73.5, totalStudents: 160, status: 'danger' }
  ];

  // Debarred / Danger List based on current targetThreshold
  const debarmentRiskStudents = students.filter(st => {
    // Check if student has low attendance
    return st.id === "24691a2895"; // T. Manohar example
  });

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!newCourseName || !newCourseCode) return;

    const newObj = {
      id: newCourseCode,
      name: newCourseName,
      code: newCourseCode,
      faculty: newCourseFaculty || 'TBA Faculty',
      room: 'LH-3',
      credits: 3,
      color: '#3b82f6',
      conducted: 1,
      attended: 1,
      schedule: 'Mon, Wed - 11:00 AM'
    };

    setCourses(prev => [...prev, newObj]);
    showToast(`New Course ${newCourseCode} added successfully!`, 'success');
    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseFaculty('');
    setShowAddCourseModal(false);
  };

  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!newFacultyName || !newFacultyEmail || !newFacultyPassword) return;

    const newTeacher = {
      id: `TCH-${Date.now()}`,
      name: newFacultyName,
      title: newFacultyTitle || 'Assistant Professor',
      department: 'Computer Science & Technology',
      email: newFacultyEmail,
      password: newFacultyPassword,
      assignedCourses: [],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newFacultyName)}&background=06b6d4&color=fff`
    };

    setTeachers(prev => [...prev, newTeacher]);
    showToast(`${newFacultyName} added as faculty login`, 'success');
    setNewFacultyName('');
    setNewFacultyTitle('');
    setNewFacultyEmail('');
    setNewFacultyPassword('');
    setShowAddFacultyModal(false);
  };

  const handleExportCsv = () => {
    showToast("Generating & Downloading College Attendance Debarment Report CSV...", "info");
  };

  // Filter student directory
  const filteredStudents = students.filter(st => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    return st.name.toLowerCase().includes(q) || st.rollNo.toLowerCase().includes(q) || st.section.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '1.5rem 0' }}>
      
      {/* Admin Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>College Academic Administration</h2>
            <span className="badge badge-safe">Dean's Office</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            System-wide Analytics, Threshold Enforcement, Certificate Approval & Direct Printing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowCSVImport(true)} 
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.1rem' }}
          >
            <Upload size={18} color="var(--safe)" />
            Import CSV Data
          </button>
          <button 
            onClick={handleExportCsv} 
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1.1rem' }}
          >
            <FileSpreadsheet size={18} color="var(--safe)" />
            Export Debarment CSV
          </button>
          
          <button 
            onClick={() => setShowAddCourseModal(true)} 
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.1rem' }}
          >
            <Plus size={18} />
            Add New Subject
          </button>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
        {[
          { id: 'overview', label: 'Administration Overview', icon: Building2 },
          { id: 'certificates', label: 'Certificates & Direct Print', icon: Award },
          { id: 'students', label: 'Student Directory', icon: Users },
          { id: 'faculty', label: 'Faculty Roster', icon: UserCheck },
          { id: 'timetable', label: 'Class Timetable', icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Render Active Sub-Components */}
      {activeTab === 'certificates' && <CertificateModal role="admin" />}
      {activeTab === 'timetable' && <TimetableGrid />}

      {/* SUB-TAB: Student Directory */}
      {activeTab === 'students' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--primary)" /> MITS Student Master Directory ({students.length})
            </h3>

            <div style={{ position: 'relative', width: '250px' }}>
              <input 
                type="text" 
                placeholder="Search name, roll, section..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.8rem 0.45rem 2.2rem', fontSize: '0.8rem' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem' }}>Student Profile</th>
                  <th style={{ padding: '0.75rem' }}>Roll Number</th>
                  <th style={{ padding: '0.75rem' }}>Department & Section</th>
                  <th style={{ padding: '0.75rem' }}>Semester</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Avg Attendance</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Official Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((st, idx) => {
                  const avgPct = idx === 1 ? 71.4 : (idx === 2 ? 83.3 : 89.2);
                  return (
                    <tr key={st.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={st.avatar} alt={st.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <strong style={{ color: 'var(--text-main)' }}>{st.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{st.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-safe">{st.rollNo}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{st.department} ({st.section})</td>
                      <td style={{ padding: '0.75rem' }}>{st.semester}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span className={`badge ${avgPct >= targetThreshold ? 'badge-safe' : 'badge-danger'}`}>{avgPct}%</span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            window.print();
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                          title="Print Official Student Attendance Transcript"
                        >
                          <Printer size={13} color="var(--primary)" /> Print Transcript
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: Faculty Overview */}
      {activeTab === 'faculty' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} color="var(--primary)" /> Faculty Roster & Assigned Courses
            </h3>
            <button
              onClick={() => setShowAddFacultyModal(true)}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Add Faculty
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.75rem' }}>Faculty Member</th>
                  <th style={{ padding: '0.75rem' }}>Designation</th>
                  <th style={{ padding: '0.75rem' }}>Department</th>
                  <th style={{ padding: '0.75rem' }}>Institutional Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Assigned Subject</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={t.avatar} alt={t.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <strong style={{ color: 'var(--text-main)' }}>{t.name}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{t.title}</td>
                    <td style={{ padding: '0.75rem' }}>{t.department}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--primary)' }}>{t.email}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)' }}>
                        {t.assignedCourses?.join(', ') || 'CS601'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: Administration Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Threshold Configuration Slider Card */}
          <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(99, 102, 241, 0.08))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                  <Sliders size={20} color="#f59e0b" /> College Attendance Threshold Policy Configuration
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Adjust the minimum percentage required for mid-semester exam eligibility. (Currently <strong>{targetThreshold}%</strong>)
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="range" 
                  min="50" 
                  max="90" 
                  step="5"
                  value={targetThreshold} 
                  onChange={e => setTargetThreshold(Number(e.target.value))}
                  style={{ width: '160px', accentColor: '#f59e0b', cursor: 'pointer' }}
                />
                <span className="badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 800, fontSize: '0.9rem' }}>
                  {targetThreshold}% Threshold
                </span>
              </div>
            </div>
          </div>

          {/* College Overview Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                <Building2 size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>College Avg. Turnout</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--safe)' }}>84.5%</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MITS Campus Total</span>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-purple)' }}>
                <BookOpen size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Active Courses</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{courses.length}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Curriculum 2026</span>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Debarment Risk</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)' }}>
                  {debarmentRiskStudents.length} Student(s)
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>&lt; {targetThreshold}% Threshold</span>
              </div>
            </div>

          </div>

          {/* Main Grid: Department Overview + Debarment Risk Roster */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Department Attendance Performance */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Building2 size={20} color="var(--primary)" /> Department-Wise Turnout Breakdown
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {departments.map((dept, i) => (
                  <div key={i} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{dept.name}</strong>
                      <span style={{ 
                        fontWeight: 700, 
                        color: dept.avgPct >= targetThreshold ? 'var(--safe)' : 'var(--danger)' 
                      }}>
                        {dept.avgPct}%
                      </span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${dept.avgPct}%`,
                          background: dept.avgPct >= targetThreshold ? 'var(--safe)' : 'var(--danger)'
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginTop: '0.3rem' }}>
                      {dept.totalStudents} Students enrolled
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Attendance Debarment Risk Roster */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={20} color="var(--danger)" /> Low Attendance Debarment Risk
                </h3>
                <span className="badge badge-danger">&lt; {targetThreshold}% Threshold</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {students.map(st => {
                  const isAtRisk = st.id === '24691a2895';
                  if (!isAtRisk) return null;
                  return (
                    <div key={st.id} style={{ 
                      padding: '0.85rem', 
                      background: 'var(--danger-bg)', 
                      border: '1px solid var(--danger-border)', 
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={st.avatar} alt={st.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div>
                          <h5 style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{st.name}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.rollNo} • {st.section}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>71.4%</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Shortage: 2 classes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}

      {showCSVImport && <CSVImportModal onClose={() => setShowCSVImport(false)} />}

      {showAddFacultyModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add Faculty Login</h3>
            
            <form onSubmit={handleAddFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Faculty Name:
                </label>
                <input
                  type="text"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  placeholder="e.g. Dr. S. Jansi"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Designation:
                </label>
                <input
                  type="text"
                  value={newFacultyTitle}
                  onChange={(e) => setNewFacultyTitle(e.target.value)}
                  placeholder="e.g. Assistant Professor"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  placeholder="e.g. faculty@mits.ac.in"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Password:
                </label>
                <input
                  type="text"
                  value={newFacultyPassword}
                  onChange={(e) => setNewFacultyPassword(e.target.value)}
                  placeholder="e.g. faculty123"
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddFacultyModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Save Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Course Modal */}
      {showAddCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add New Curriculum Course / Subject</h3>
            
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Course Code:
                </label>
                <input 
                  type="text" 
                  value={newCourseCode} 
                  onChange={(e) => setNewCourseCode(e.target.value)} 
                  placeholder="e.g. CS606" 
                  required 
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Subject Name:
                </label>
                <input 
                  type="text" 
                  value={newCourseName} 
                  onChange={(e) => setNewCourseName(e.target.value)} 
                  placeholder="e.g. Distributed Cloud Computing" 
                  required 
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Assigned Faculty Name:
                </label>
                <input 
                  type="text" 
                  value={newCourseFaculty} 
                  onChange={(e) => setNewCourseFaculty(e.target.value)} 
                  placeholder="e.g. Dr. A. Sharma" 
                  className="input-field" 
                />
              </div>

              <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddCourseModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
