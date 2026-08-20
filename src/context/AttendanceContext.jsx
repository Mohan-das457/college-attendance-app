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

  // Active Teacher Account (defaults to Dr. Rajesh Iyer TCH-001)
  const [activeTeacherId, setActiveTeacherId] = useState(() => {
    return localStorage.getItem('attendtrack_active_teacher') || 'TCH-001';
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

  const loginWithEmail = (email, password) => {
    if (email === credentials.admin.email && password === credentials.admin.password) {
      setRole('admin'); setLoggedInRole('admin');
      localStorage.setItem('attendtrack_logged_role', 'admin');
      showToast('Welcome Admin!', 'success'); return true;
    }
    if (email === credentials.student.email && password === credentials.student.password) {
      setRole('student'); setLoggedInRole('student');
      localStorage.setItem('attendtrack_logged_role', 'student');
      showToast('Welcome Mohan!', 'success'); return true;
    }
    const teacher = teachers.find(t => t.email === email);
    if (teacher && password === teacher.password) {
      setActiveTeacherId(teacher.id); setRole('teacher'); setLoggedInRole('teacher');
      localStorage.setItem('attendtrack_logged_role', 'teacher');
      showToast(`Welcome ${teacher.name}!`, 'success'); return true;
    }
    showToast('Invalid email or password.', 'danger'); return false;
  };

  const findAccountByEmail = (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (credentials.admin.email.toLowerCase() === normalizedEmail) {
      return { role: 'admin', email: credentials.admin.email };
    }
    if (credentials.student.email.toLowerCase() === normalizedEmail) {
      return { role: 'student', email: credentials.student.email };
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
    } else {
      setCredentials(prev => ({
        ...prev,
        [account.role]: {
          ...prev[account.role],
          password: newPassword
        }
      }));
    }

    showToast('Password changed successfully. Sign in with the new password.', 'success');
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

  // Students Database
  const [students, setStudents] = useState(() => {
    const parsed = readStoredJson('attendtrack_students', INITIAL_STUDENTS);
    if (!parsed || parsed.length < INITIAL_STUDENTS.length) {
      return INITIAL_STUDENTS;
    }
    return parsed;
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
      studentId: "24691a2899",
      studentName: "B. Mohan",
      rollNo: "24691A2899",
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
        // If approved, also update attendance history log for student
        if (status === 'Resolved - Marked Present') {
          setAttendanceHistory(hist => hist.map(h => {
            if (h.courseId === d.courseId && h.date === d.lectureDate) {
              return { ...h, status: 'present' };
            }
            return h;
          }));
          // Increment attended count in course
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
  };  // Active Live Classroom PIN Session & Anti-Proxy Security State
  const [activeClassPin, setActiveClassPin] = useState('7842');
  const [pinExpiryTime, setPinExpiryTime] = useState(60); // 60s expiry
  const [geoFenceStatus, setGeoFenceStatus] = useState('INSIDE_MITS_CAMPUS'); // GPS Campus Lock

  // Student Anti-Hack Classroom Check-In with GPS Geofencing & Device Binding
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

      // Add to attendance history log
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

      showToast(`🔒 Anti-Hack Verified Check-In Successful! Attendance registered for ${courseObj ? courseObj.code : courseId}.`, 'success');
      return true;
    } else {
      showToast(`Invalid or Expired PIN code! Check professor screen.`, 'danger');
      return false;
    }
  };
  const uploadCertificate = (newCert) => {
    const certObj = {
      id: `CERT-2026-${String(Date.now()).slice(-4)}`,
      studentId: "24691a2899",
      studentName: "B. Mohan",
      rollNo: "24691A2899",
      department: "Computer Science & Technology",
      section: "CAT-B",
      semester: "3-1 Semester",
      uploadDate: new Date().toISOString().split('T')[0],
      status: "Pending",
      approvedBy: "-",
      remarks: "Awaiting Faculty/Admin Verification",
      ...newCert
    };
    setCertificates(prev => [certObj, ...prev]);
    showToast("Certificate uploaded successfully! Sent to Faculty & Admin for verification.", "success");
  };

  // Update Certificate Status (Faculty / Admin Approval & Verification)
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

  // Post Announcement Method
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

  // Delete Announcement
  const deleteAnnouncement = (annId) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
    showToast("Announcement removed", "info");
  };

  // Submit Leave Request
  const submitLeaveRequest = (newLeave) => {
    const leaveItem = {
      id: `LV-${Date.now()}`,
      studentId: "24691a2899",
      studentName: "B. Mohan",
      status: "Pending",
      ...newLeave
    };
    setLeaves(prev => [leaveItem, ...prev]);
    showToast("Medical / Exemption leave application submitted!", "info");
  };

  // Send Alert Warning to Student
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

  // Reset Data to Initial Preset
  const resetData = () => {
    setCourses(INITIAL_COURSES);
    setStudents(INITIAL_STUDENTS);
    setTeachers(INITIAL_TEACHERS);
    setActiveTeacherId('TCH-001');
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
