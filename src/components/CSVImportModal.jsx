import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';

const COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#84cc16'];

function parseCSV(text) {
  const [headerLine, ...rows] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return rows.filter(r => r.trim()).map(row => {
    const vals = row.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] || '']));
  });
}

export default function CSVImportModal({ onClose }) {
  const { setStudents, setCourses, setTeachers, showToast } = useAttendance();
  const [status, setStatus] = useState({});

  const handleFile = (type, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        if (type === 'students') {
          const students = rows.map((r, i) => ({
            id: `STU-${String(i + 1).padStart(3, '0')}`,
            name: r.name || r.student_name || '',
            rollNo: r.roll_no || r.register_no || r.rollno || '',
            email: r.email || `${(r.name || 'student').toLowerCase().replace(/\s/g, '.')}@mits.edu`,
            department: r.department || r.dept || '',
            semester: r.semester || r.sem || '',
            section: r.section || '',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'S')}&background=6366f1&color=fff`
          }));
          setStudents(students);
          setStatus(p => ({ ...p, students: `✓ ${students.length} students imported` }));
          showToast(`${students.length} students imported successfully!`, 'success');
        } else if (type === 'faculty') {
          const teachers = rows.map((r, i) => ({
            id: `TCH-${String(i + 1).padStart(3, '0')}`,
            name: r.name || r.faculty_name || '',
            title: r.designation || r.title || 'Assistant Professor',
            department: r.department || r.dept || '',
            email: r.email || '',
            password: r.password || `faculty${String(i + 1).padStart(3, '0')}`,
            assignedCourses: [],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'F')}&background=ec4899&color=fff`
          }));
          setTeachers(teachers);
          setStatus(p => ({ ...p, faculty: `✓ ${teachers.length} faculty imported` }));
          showToast(`${teachers.length} faculty imported successfully!`, 'success');
        } else if (type === 'courses') {
          const courses = rows.map((r, i) => ({
            id: r.course_code || r.code || `C${String(i + 1).padStart(3, '0')}`,
            name: r.course_name || r.subject || r.name || '',
            code: r.course_code || r.code || '',
            facultyId: `TCH-${String(i + 1).padStart(3, '0')}`,
            faculty: r.faculty || r.faculty_name || '',
            room: r.room || r.classroom || 'LH-1',
            credits: Number(r.credits) || 3,
            color: COLORS[i % COLORS.length],
            conducted: Number(r.conducted) || 0,
            attended: Number(r.attended) || 0,
            schedule: r.schedule || ''
          }));
          setCourses(courses);
          setStatus(p => ({ ...p, courses: `✓ ${courses.length} courses imported` }));
          showToast(`${courses.length} courses imported successfully!`, 'success');
        }
      } catch {
        showToast('Failed to parse CSV. Check the format.', 'danger');
      }
    };
    reader.readAsText(file);
  };

  const sections = [
    { type: 'students', label: 'Students CSV', hint: 'Columns: name, roll_no, email, department, semester, section' },
    { type: 'faculty',  label: 'Faculty CSV',  hint: 'Columns: name, designation, department, email, password' },
    { type: 'courses',  label: 'Courses CSV',  hint: 'Columns: course_code, course_name, faculty, room, credits, schedule' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Import College Data (CSV)</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {sections.map(({ type, label, hint }) => (
          <div key={type} style={{ marginBottom: 20, padding: 16, background: 'var(--bg-hover)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 10 }}>{hint}</div>
            <input
              type="file"
              accept=".csv"
              onChange={e => handleFile(type, e.target.files[0])}
              style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}
            />
            {status[type] && <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#10b981' }}>{status[type]}</div>}
          </div>
        ))}

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 8 }}>
          Export CSVs from GEMS admin panel → Import here → Data updates instantly.
        </div>
      </div>
    </div>
  );
}
