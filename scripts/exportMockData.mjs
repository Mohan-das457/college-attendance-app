import { writeFileSync } from 'node:fs';
import {
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  WEEKLY_TIMETABLE
} from '../src/mockData.js';

const csvEscape = (value) => {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
};

const toCsv = (rows, columns) => {
  const header = columns.map(({ header }) => csvEscape(header)).join(',');
  const body = rows.map(row => (
    columns.map(({ key, value }) => csvEscape(value ? value(row) : row[key])).join(',')
  ));
  return [header, ...body].join('\n') + '\n';
};

const timetableRows = WEEKLY_TIMETABLE.flatMap(dayItem => (
  dayItem.slots.map(slot => ({
    day: dayItem.day,
    ...slot
  }))
));

const files = [
  {
    path: 'exported-data/students.csv',
    rows: INITIAL_STUDENTS,
    columns: [
      { header: 'id', key: 'id' },
      { header: 'name', key: 'name' },
      { header: 'roll_no', key: 'rollNo' },
      { header: 'email', key: 'email' },
      { header: 'department', key: 'department' },
      { header: 'semester', key: 'semester' },
      { header: 'section', key: 'section' },
      { header: 'avatar', key: 'avatar' }
    ]
  },
  {
    path: 'exported-data/faculty.csv',
    rows: INITIAL_TEACHERS,
    columns: [
      { header: 'id', key: 'id' },
      { header: 'name', key: 'name' },
      { header: 'designation', key: 'title' },
      { header: 'department', key: 'department' },
      { header: 'email', key: 'email' },
      { header: 'password', key: 'password' },
      { header: 'assigned_courses', value: row => row.assignedCourses?.join('|') || '' },
      { header: 'avatar', key: 'avatar' }
    ]
  },
  {
    path: 'exported-data/courses.csv',
    rows: INITIAL_COURSES,
    columns: [
      { header: 'id', key: 'id' },
      { header: 'course_code', key: 'code' },
      { header: 'course_name', key: 'name' },
      { header: 'faculty_id', key: 'facultyId' },
      { header: 'faculty', key: 'faculty' },
      { header: 'room', key: 'room' },
      { header: 'credits', key: 'credits' },
      { header: 'conducted', key: 'conducted' },
      { header: 'attended', key: 'attended' },
      { header: 'schedule', key: 'schedule' }
    ]
  },
  {
    path: 'exported-data/weekly_timetable.csv',
    rows: timetableRows,
    columns: [
      { header: 'day', key: 'day' },
      { header: 'time', key: 'time' },
      { header: 'course_code', key: 'courseCode' },
      { header: 'subject_name', key: 'name' },
      { header: 'room', key: 'room' },
      { header: 'faculty', key: 'faculty' }
    ]
  }
];

files.forEach(file => {
  writeFileSync(file.path, toCsv(file.rows, file.columns));
  console.log(`${file.path}: ${file.rows.length} rows`);
});
