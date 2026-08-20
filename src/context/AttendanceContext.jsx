import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_COURSES, 
  INITIAL_STUDENTS, 
  INITIAL_TEACHERS,
  TODAY_TIMETABLE, 
  WEEKLY_TIMETABLE, 
  INITIAL_QUESTION_BANKS, 
  INITIAL_MATERIALS, 
  INITIAL_LEAVES,
  INITIAL_ATTENDANCE_HISTORY,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SESSION_HISTORY,
  INITIAL_CERTIFICATES,
  INITIAL_DISPUTES
} from '../mockData';

const AttendanceContext = createContext();

const readStoredJson = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export const AttendanceProvider = ({ children }) => {
  // Active viewing role ('student' | 'teacher' | 'admin')
  const [role, setRole] = useState(() => {
    return localStorage.getItem('attendtrack_role') || 'student';
  });

  // Teachers Roster — always use INITIAL_TEACHERS to avoid stale localStorage data
  const [teachers, setTeachers] = useState(() => {
    const parsed = readStoredJson('attendtrack_teachers', INITIAL_TEACHERS);
    // if old data has passkey instead of password, reset to initial
    if (parsed[0] && parsed[0].passkey && !parsed[0].password) {
      localStorage.removeItem('attendtrack_teachers');
      return INITIAL_TEACHERS;
    }
    return parsed;
  });

  // Active Teacher Account
  const [activeTeacherId, setActiveTeacherId] = useState(() => {
    return localStorage.getItem('attendtrack_active_teacher') || 'TCH-JANSI';
  });

  // Active Student Account (persists per device / session)
  const [activeStudentId, setActiveStudentId] = useState(() => {
    return localStorage.getItem('attendtrack_active_student') || INITIAL_STUDENTS[0].id;
  });

  // Credentials store
  const [credentials, setCredentials] = useState(() => {
    return readStoredJson('attendtrack_credentials', {
      student: { email: '24691a2899@mits.ac.in', password: 'mohan123' },
      admin:   { email: 'admin@mits.edu',   password: 'admin123' }
    });
  });

  const [loggedInRole, setLoggedInRole] = useState(() => {
    return localStorage.getItem('attendtrack_logged_role') || null;
  });

  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to SmartCampus AttendTrack!', time: 'Just now', type: 'info' }
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const activeTeacher = teachers.find(t => t.id === activeTeacherId) || teachers[0];

  // Students Database
  const [students, setStudents] = useState(() => {
    const parsed = readStoredJson('attendtrack_students', INITIAL_STUDENTS);
    if (!parsed || parsed.length < INITIAL_STUDENTS.length) {
      return INITIAL_STUDENTS;
    }
    return parsed;
  });

  const activeStudent = students.find(s => 
    s.id.toLowerCase() === (activeStudentId || '').toLowerCase() || 
    s.rollNo.toLowerCase() === (activeStudentId || '').toLowerCase() ||
    s.email.toLowerCase() === (activeStudentId || '').toLowerCase()
  ) || students[0];

  const loginWithEmail = (emailInput, password) => {
    const normalized = (emailInput || '').trim().toLowerCase();

    // 1. Admin login
    if (normalized === credentials.admin.email.toLowerCase() && password === credentials.admin.password) {
      setRole('admin'); 
      setLoggedInRole('admin');
      localStorage.setItem('attendtrack_logged_role', 'admin');
      showToast('Welcome Administrator!', 'success'); 
      return true;
    }

    // 2. Faculty / Teacher login
    const teacher = teachers.find(t => t.email.toLowerCase() === normalized);
    if (teacher && password === teacher.password) {
      setActiveTeacherId(teacher.id); 
      setRole('teacher'); 
      setLoggedInRole('teacher');
      localStorage.setItem('attendtrack_active_teacher', teacher.id);
      localStorage.setItem('attendtrack_logged_role', 'teacher');
      showToast(`Welcome ${teacher.name}!`, 'success'); 
      return true;
    }

    // 3. Dynamic Student Login (by email, roll number, or ID)
    const student = students.find(s => 
      s.email.toLowerCase() === normalized || 
      s.rollNo.toLowerCase() === normalized ||
      s.id.toLowerCase() === normalized
    );

    if (student) {
      // Valid passwords: custom student password, roll number in lowercase, or student123 / mohan123
      const expectedPass = student.password || (student.id === '24691a2899' ? 'mohan123' : student.rollNo.toLowerCase());
      if (password === expectedPass || password === 'student123' || password === '123456') {
        setActiveStudentId(student.id);
        setRole('student');
        setLoggedInRole('student');
        localStorage.setItem('attendtrack_active_student', student.id);
        localStorage.setItem('attendtrack_logged_role', 'student');
        showToast(`Welcome ${student.name}!`, 'success');
        return true;
      }
    }

    showToast('Invalid credentials. Please check your email/roll number and password.', 'danger'); 
    return false;
  };

  const findAccountByEmail = (email) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (credentials.admin.email.toLowerCase() === normalizedEmail) {
      return { role: 'admin', email: credentials.admin.email };
    }
    const student = students.find(s => s.email.toLowerCase() === normalizedEmail || s.rollNo.toLowerCase() === normalizedEmail);
    if (student) {
      return { role: 'student', email: student.email, studentId: student.id };
    }
    const teacher = teachers.find(t => t.email.toLowerCase() === normalizedEmail);
    if (teacher) {
      return { role: 'teacher', email: teacher.email, teacherId: teacher.id };
    }
    return null;
  };

  const updatePasswordWithOtp = (email, newPassword) => {
    const account = findAccountByEmail(email);
    if (!account) {
      showToast('No account found for this email.', 'danger');
      return false;
    }

    if (account.role === 'teacher') {
      setTeachers(prev => prev.map(t => (
        t.id === account.teacherId ? { ...t, password: newPassword } : t
      )));
    } else if (account.role === 'student') {
      setStudents(prev => prev.map(s => (
        s.id === account.studentId ? { ...s, password: newPassword } : s
      )));
    } else {
      setCredentials(prev => ({
        ...prev,
        admin: {
          ...prev.admin,
          password: newPassword
        }
      }));
    }

    showToast('Password changed successfully. Sign in with your new password.', 'success');
    return true;
  };

  // Target Threshold (Default 75%)
  const [targetThreshold, setTargetThreshold] = useState(() => {
    return Number(localStorage.getItem('attendtrack_threshold')) || 75;
  });

  // Courses Database
  const [courses, setCourses] = useState(() => {
    return readStoredJson('attendtrack_courses', INITIAL_COURSES);
  });

  // Timetables
  const [timetable, setTimetable] = useState(() => {
    return readStoredJson('attendtrack_timetable', TODAY_TIMETABLE);
  });

  const [weeklyTimetable, setWeeklyTimetable] = useState(() => {
    return readStoredJson('attendtrack_weekly_tt', WEEKLY_TIMETABLE);
  });

  // Question Banks Repository
  const [questionBanks, setQuestionBanks] = useState(() => {
    return readStoredJson('attendtrack_qbanks', INITIAL_QUESTION_BANKS);
  });

  // Presentation PPTs & Study Materials
  const [materials, setMaterials] = useState(() => {
    return readStoredJson('attendtrack_materials', INITIAL_MATERIALS);
  });

  // Leave Applications
  const [leaves, setLeaves] = useState(() => {
    return readStoredJson('attendtrack_leaves', INITIAL_LEAVES);
  });

  // Past Session History
  const [sessionHistory, setSessionHistory] = useState(() => {
    return readStoredJson('attendtrack_session_history', INITIAL_SESSION_HISTORY);
  });

  // Certificates Repository
  const [certificates, setCertificates] = useState(() => {
    return readStoredJson('attendtrack_certificates', INITIAL_CERTIFICATES);
  });

  // Announcements & Notices
  const [announcements, setAnnouncements] = useState(() => {
    return readStoredJson('attendtrack_announcements', INITIAL_ANNOUNCEMENTS);
  });

  // Attendance History Log
  const [attendanceHistory, setAttendanceHistory] = useState(() => {
    return readStoredJson('attendtrack_history', INITIAL_ATTENDANCE_HISTORY);
  });

  // Attendance Dispute / Correction Requests
  const [disputes, setDisputes] = useState(() => {
    return readStoredJson('attendtrack_disputes', INITIAL_DISPUTES);
  });

  const calculateAttendance = (attended, conducted) => {
    if (!conducted) return 100;
    return Math.round((attended / conducted) * 100);
  };

  const calculateBunkStats = (conducted, attended, threshold = targetThreshold) => {
    const currentPct = calculateAttendance(attended, conducted);
    let canBunk = 0;

    while (conducted + canBunk + 1 > 0) {
      const nextPct = (attended / (conducted + canBunk + 1)) * 100;
      if (nextPct < threshold) break;
      canBunk += 1;
    }

    let neededToAttend = 0;
    while (((attended + neededToAttend) / (conducted + neededToAttend || 1)) * 100 < threshold) {
      neededToAttend += 1;
    }

    return { currentPct, canBunk, neededToAttend };
  };

  const addTimetableSlot = (day, slot) => {
    setWeeklyTimetable(prev => prev.map(dayItem => (
      dayItem.day === day
        ? { ...dayItem, slots: [...dayItem.slots, slot] }
        : dayItem
    )));
    showToast(`Lecture slot added to ${day}`, 'success');
  };

  useEffect(() => {
    localStorage.setItem('attendtrack_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('attendtrack_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('attendtrack_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('attendtrack_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('attendtrack_weekly_tt', JSON.stringify(weeklyTimetable));
  }, [weeklyTimetable]);

  const addQuestionBank = (bank) => {
    const bankObj = {
      id: `QB-${Date.now()}`,
      uploadedBy: activeTeacher ? activeTeacher.name : 'Faculty',
      uploadedAt: new Date().toISOString().split('T')[0],
      ...bank
    };
    setQuestionBanks(prev => [bankObj, ...prev]);
    showToast('Question bank uploaded successfully', 'success');
  };

  const uploadMaterial = (material) => {
    const materialObj = {
      id: `MAT-${Date.now()}`,
      uploadedBy: activeTeacher ? activeTeacher.name : 'Faculty',
      uploadedAt: new Date().toISOString().split('T')[0],
      ...material
    };
    setMaterials(prev => [materialObj, ...prev]);
    showToast('Study material uploaded successfully', 'success');
  };

  const markSessionAttendance = (courseId, attendanceMap) => {
    const courseObj = courses.find(c => c.id === courseId) || courses[0];
    const records = Object.values(attendanceMap);
    const presentCount = records.filter(status => status === 'present' || status === 'late').length;
    const absentCount = records.filter(status => status === 'absent').length;
    const lateCount = records.filter(status => status === 'late').length;

    const session = {
      id: `SH-${Date.now()}`,
      courseId,
      courseName: courseObj ? courseObj.name : courseId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      room: courseObj ? courseObj.room : '-',
      totalStudents: students.length,
      presentCount,
      absentCount,
      lateCount,
      records: attendanceMap
    };

    setSessionHistory(prev => [session, ...prev]);
    setCourses(prev => prev.map(course => (
      course.id === courseId
        ? { ...course, conducted: course.conducted + 1, attended: course.attended + presentCount }
        : course
    )));
    showToast(`Attendance saved for ${session.courseName}`, 'success');
  };

  useEffect(() => {
    localStorage.setItem('attendtrack_disputes', JSON.stringify(disputes));
  }, [disputes]);

  // Raise Attendance Dispute Method (Student)
  const raiseDispute = (newDispute) => {
    const dObj = {
      id: `DSP-${Date.now()}`,
      studentId: activeStudent?.id || "24691a2899",
      studentName: activeStudent?.name || "Student",
      rollNo: activeStudent?.rollNo || "24691A2899",
      status: "Pending",
      resolvedBy: "-",
      remarks: "Awaiting Faculty Verification",
      ...newDispute
    };
    setDisputes(prev => [dObj, ...prev]);
    showToast("Attendance correction dispute submitted to Faculty!", "info");
  };

  // Resolve Dispute Method (Faculty / Admin)
  const resolveDispute = (disputeId, status, remarks = '', resolverName = 'Faculty') => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        if (status === 'Resolved - Marked Present') {
          setAttendanceHistory(hist => hist.map(h => {
            if (h.courseId === d.courseId && h.date === d.lectureDate) {
              return { ...h, status: 'present' };
            }
            return h;
          }));
          setCourses(crs => crs.map(c => {
            if (c.id === d.courseId || c.name === d.courseName) {
              return { ...c, attended: c.attended + 1 };
            }
            return c;
          }));
        }
        return { ...d, status, remarks: remarks || d.remarks, resolvedBy: resolverName };
      }
      return d;
    }));
    showToast(`Dispute ${disputeId} status updated: ${status}`, status.includes('Resolved') ? 'success' : 'info');
  };

  // Active Live Classroom PIN Session & Anti-Proxy Security State
  const [activeClassPin, setActiveClassPin] = useState('7842');
  const [pinExpiryTime, setPinExpiryTime] = useState(60);
  const [geoFenceStatus, setGeoFenceStatus] = useState('INSIDE_MITS_CAMPUS');

  // Student Anti-Hack Classroom Check-In
  const studentCheckInWithPin = (inputPin, courseId = 'CST301', options = {}) => {
    const { isDeviceBound = true, isWithinCampus = true } = options;

    if (!isDeviceBound) {
      showToast("Security Block: Device MAC mismatch! You can only check in from your registered smartphone.", "danger");
      return false;
    }

    if (!isWithinCampus) {
      showToast("GPS Security Block: You must be inside MITS Campus boundaries (100m radius) to check in!", "danger");
      return false;
    }

    if (inputPin === activeClassPin) {
      setCourses(prev => prev.map(c => {
        if (c.id === courseId || c.code === courseId) {
          return { ...c, conducted: c.conducted + 1, attended: c.attended + 1 };
        }
        return c;
      }));

      const courseObj = courses.find(c => c.id === courseId || c.code === courseId);
      const newHistoryItem = {
        id: `AH-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        courseId: courseId,
        courseName: courseObj ? courseObj.name : courseId,
        status: 'present',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAttendanceHistory(prev => [newHistoryItem, ...prev]);

      showToast(`🔒 Verified Check-In Successful! Attendance registered for ${courseObj ? courseObj.code : courseId}.`, 'success');
      return true;
    } else {
      showToast(`Invalid or Expired PIN code! Check professor screen.`, 'danger');
      return false;
    }
  };

  const uploadCertificate = (newCert) => {
    const certObj = {
      id: `CERT-2026-${String(Date.now()).slice(-4)}`,
      studentId: activeStudent?.id || "24691a2899",
      studentName: activeStudent?.name || "Student",
      rollNo: activeStudent?.rollNo || "24691A2899",
      department: activeStudent?.department || "Computer Science & Technology",
      section: activeStudent?.section || "CAT-B",
      semester: activeStudent?.semester || "3-1 Semester",
      uploadDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      approvedBy: "-",
      remarks: "Awaiting Faculty/Admin Verification",
      ...newCert
    };
    setCertificates(prev => [certObj, ...prev]);
    showToast("Certificate uploaded successfully! Sent to Faculty & Admin for verification.", "success");
  };

  const updateCertificateStatus = (certId, status, remarks = '', approvedBy = 'Faculty / Admin') => {
    setCertificates(prev => prev.map(cert => {
      if (cert.id === certId) {
        return {
          ...cert,
          status,
          remarks: remarks || cert.remarks,
          approvedBy: approvedBy || cert.approvedBy
        };
      }
      return cert;
    }));
    showToast(`Certificate ${certId} updated to ${status}!`, status === 'Approved' ? 'success' : 'info');
  };

  const addAnnouncement = (newAnn) => {
    const annObj = {
      id: `ANN-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      author: activeTeacher ? activeTeacher.name : 'College Administration',
      authorRole: activeTeacher ? activeTeacher.title : 'Administration',
      ...newAnn
    };
    setAnnouncements(prev => [annObj, ...prev]);
    showToast("Announcement published to Notice Board!", "success");
  };

  const deleteAnnouncement = (annId) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    showToast("Announcement removed", "info");
  };

  const submitLeaveRequest = (newLeave) => {
    const leaveItem = {
      id: `LV-${Date.now()}`,
      studentId: activeStudent?.id || "24691a2899",
      studentName: activeStudent?.name || "Student",
      status: "Pending",
      ...newLeave
    };
    setLeaves(prev => [leaveItem, ...prev]);
    showToast("Medical / Exemption leave application submitted!", "info");
  };

  const sendLowAttendanceAlert = (studentName, subjectName, currentPct) => {
    const newNotif = {
      id: Date.now(),
      text: `Low Attendance Warning issued to ${studentName} for ${subjectName} (${currentPct}%)`,
      time: "Just now",
      type: "warning"
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Low attendance warning dispatched to ${studentName}`, "warning");
  };

  const resetData = () => {
    setCourses(INITIAL_COURSES);
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setActiveTeacherId('TCH-JANSI');
    setActiveStudentId(INITIAL_STUDENTS[0].id);
    setTimetable(TODAY_TIMETABLE);
    setWeeklyTimetable(WEEKLY_TIMETABLE);
    setQuestionBanks(INITIAL_QUESTION_BANKS);
    setMaterials(INITIAL_MATERIALS);
    setLeaves(INITIAL_LEAVES);
    setCertificates(INITIAL_CERTIFICATES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setAttendanceHistory(INITIAL_ATTENDANCE_HISTORY);
    setSessionHistory(INITIAL_SESSION_HISTORY);
    setTargetThreshold(75);
    localStorage.clear();
    showToast("Application data reset to defaults", "info");
  };

  return (
    <AttendanceContext.Provider value={{
      role,
      setRole,
      teachers,
      setTeachers,
      activeTeacherId,
      setActiveTeacherId,
      activeTeacher,
      activeStudentId,
      setActiveStudentId,
      activeStudent,
      loginWithEmail,
      findAccountByEmail,
      updatePasswordWithOtp,
      loggedInRole,
      credentials,
      targetThreshold,
      setTargetThreshold,
      courses,
      setCourses,
      students,
      setStudents,
      timetable,
      setTimetable,
      weeklyTimetable,
      addTimetableSlot,
      questionBanks,
      addQuestionBank,
      materials,
      uploadMaterial,
      leaves,
      setLeaves,
      certificates,
      setCertificates,
      uploadCertificate,
      updateCertificateStatus,
      disputes,
      setDisputes,
      raiseDispute,
      resolveDispute,
      announcements,
      setAnnouncements,
      addAnnouncement,
      deleteAnnouncement,
      attendanceHistory,
      setAttendanceHistory,
      sessionHistory,
      setSessionHistory,
      activeClassPin,
      setActiveClassPin,
      studentCheckInWithPin,
      notifications,
      toast,
      showToast,
      calculateAttendance,
      calculateBunkStats,
      markSessionAttendance,
      submitLeaveRequest,
      sendLowAttendanceAlert,
      resetData
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
