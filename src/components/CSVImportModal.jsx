import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';

const COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#84cc16'];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];
  
  // Parse CSV line handling quotes and commas
  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));
  return lines.slice(1).map(line => {
    const vals = parseLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = vals[i] || '';
    });
    return obj;
  });
}

export default function CSVImportModal({ onClose }) {
  const { setStudents, setCourses, setTeachers, showToast } = useAttendance();
  const [status, setStatus] = useState({});

  const downloadSample = (type) => {
    let csvContent = '';
    let filename = '';
    if (type === 'students') {
      csvContent = "roll_no,name,email,department,semester,section\n24691A2899,NATARAJAN B MOHAN,24691a2899@mits.ac.in,Computer Science & Technology,3-1 Semester,CAT-B\n24691A2895,T. Manohar,24691a2895@mits.ac.in,Computer Science & Technology,3-1 Semester,CAT-B\n24691A2867,Syed Mahammad Irfan,24691a2867@mits.ac.in,Computer Science & Technology,3-1 Semester,CAT-B";
      filename = "students_template.csv";
    } else if (type === 'faculty') {
      csvContent = "name,email,department,designation,password\nMr. Ashok Kambaluru,ashokkambaluru@mits.ac.in,Computer Science & Technology,Assistant Professor,ashok123\nMr. L. Arul Jayaprakash,aruljayaprakashl@mits.ac.in,Computer Science & Technology,Assistant Professor,arul123";
      filename = "faculty_template.csv";
    } else {
      csvContent = "course_code,course_name,faculty,room,credits,conducted,attended,schedule\n23CST108,Artificial Intelligence,Mr. Ashok Kambaluru,NPN106,3,15,9,\"Mon, Tue, Fri\"\n23CST107,Automata Theory and Compiler Design,Mr. L. Arul Jayaprakash,NPN106,3,14,12,\"Mon, Tue, Thu\"";
      filename = "courses_template.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFile = (type, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        if (!rows || rows.length === 0) {
          showToast('CSV file is empty or invalid format.', 'danger');
          return;
        }

        if (type === 'students') {
          const students = rows.map((r, i) => {
            const roll = r.roll_no || r.rollno || r.register_no || r.reg_no || r.htno || r.hall_ticket_no || `STU${String(i + 1).padStart(3, '0')}`;
            const studentName = r.name || r.student_name || r.candidate_name || `Student ${roll}`;
            const studentEmail = r.email || r.mail || `${roll.toLowerCase()}@mits.ac.in`;
            const studentId = roll.toLowerCase();
            return {
              id: studentId,
              name: studentName,
              rollNo: roll.toUpperCase(),
              email: studentEmail,
              password: r.password || roll.toLowerCase(),
              department: r.department || r.dept || r.branch || 'Computer Science & Technology',
              semester: r.semester || r.sem || '3-1 Semester',
              section: r.section || r.sec || 'CAT-B',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=6366f1&color=fff`
            };
          });

          setStudents(students);
          localStorage.setItem('attendtrack_students', JSON.stringify(students));
          setStatus(p => ({ ...p, students: `✓ ${students.length} students imported successfully` }));
          showToast(`${students.length} students imported! Each student can now log in using Roll No & Password.`, 'success');
        } else if (type === 'faculty') {
          const teachers = rows.map((r, i) => ({
            id: `TCH-${String(i + 1).padStart(3, '0')}`,
            name: r.name || r.faculty_name || '',
            title: r.designation || r.title || 'Assistant Professor',
            department: r.department || r.dept || 'Computer Science & Technology',
            email: r.email || '',
            password: r.password || `faculty${String(i + 1).padStart(3, '0')}`,
            assignedCourses: [],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'F')}&background=ec4899&color=fff`
          }));
          setTeachers(teachers);
          localStorage.setItem('attendtrack_teachers', JSON.stringify(teachers));
          setStatus(p => ({ ...p, faculty: `✓ ${teachers.length} faculty imported` }));
          showToast(`${teachers.length} faculty imported successfully!`, 'success');
        } else if (type === 'courses') {
          const courses = rows.map((r, i) => ({
            id: r.course_code || r.code || `C${String(i + 1).padStart(3, '0')}`,
            name: r.course_name || r.subject || r.name || '',
            code: r.course_code || r.code || '',
            facultyId: `TCH-${String(i + 1).padStart(3, '0')}`,
            faculty: r.faculty || r.faculty_name || '',
            room: r.room || r.classroom || 'NPN106',
            credits: Number(r.credits) || 3,
            color: COLORS[i % COLORS.length],
            conducted: Number(r.conducted) || 0,
            attended: Number(r.attended) || 0,
            schedule: r.schedule || ''
          }));
          setCourses(courses);
          localStorage.setItem('attendtrack_courses', JSON.stringify(courses));
          setStatus(p => ({ ...p, courses: `✓ ${courses.length} courses imported` }));
          showToast(`${courses.length} courses imported successfully!`, 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to parse CSV. Check file format.', 'danger');
      }
    };
    reader.readAsText(file);
  };

  const sections = [
    { type: 'students', label: 'Students List CSV', hint: 'Columns: roll_no, name, email, department, semester, section' },
    { type: 'faculty',  label: 'Faculty Roster CSV',  hint: 'Columns: name, email, department, designation, password' },
    { type: 'courses',  label: 'Courses & Attendance CSV',  hint: 'Columns: course_code, course_name, faculty, room, credits, conducted, attended' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 18, padding: 28, width: '100%', maxWidth: 540, border: '1px solid var(--border-light)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Import College Roster (CSV / Excel)</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bulk upload entire classroom / department rosters at once</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {sections.map(({ type, label, hint }) => (
          <div key={type} style={{ marginBottom: 16, padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
              <button 
                onClick={() => downloadSample(type)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Download Sample Template
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 10 }}>{hint}</div>
            <input
              type="file"
              accept=".csv"
              onChange={e => handleFile(type, e.target.files[0])}
              style={{ fontSize: '0.85rem', color: 'var(--text-primary)', width: '100%' }}
            />
            {status[type] && <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>{status[type]}</div>}
          </div>
        ))}

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: 12, borderRadius: 10 }}>
          💡 <strong>Tip</strong>: When you import students, each student will automatically get their login enabled. They can sign in using their <strong>Roll Number</strong> (e.g. <code>24691A2899</code>) and their roll number in lowercase as password!
        </div>
      </div>
    </div>
  );
}
