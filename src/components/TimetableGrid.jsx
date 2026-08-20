import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, Clock, MapPin, User, Plus, X, BookOpen } from 'lucide-react';

const PERIOD_COLORS = [
  '#6366f1', '#06b6d4', '#8b5cf6', '#10b981',
  '#f59e0b', '#ec4899', '#14b8a6', '#3b82f6'
];

export const TimetableGrid = () => {
  const { weeklyTimetable, courses, role, addTimetableSlot } = useAttendance();

  const days = weeklyTimetable.map(item => item.day);

  // Default to today's day name
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [activeDay, setActiveDay] = useState(
    days.includes(todayName) ? todayName : (days[0] || 'Monday')
  );
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  const [slotTime, setSlotTime] = useState('09:00 AM – 10:00 AM');
  const [slotCourseId, setSlotCourseId] = useState(courses[0]?.id || '');
  const [slotRoom, setSlotRoom] = useState('LH-1');

  const currentDayData = weeklyTimetable.find(d => d.day === activeDay) || { day: activeDay, slots: [] };
  const isToday = activeDay === todayName;

  const handleAddSlot = (e) => {
    e.preventDefault();
    const courseObj = courses.find(c => c.id === slotCourseId);
    if (!courseObj) return;
    addTimetableSlot(activeDay, {
      time: slotTime,
      courseCode: courseObj.code,
      name: courseObj.name,
      room: slotRoom,
      faculty: courseObj.faculty
    });
    setShowAddSlotModal(false);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0 0.25rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Calendar size={20} color="var(--primary)" /> Class Timetable
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Weekly lectures · venues · timings
          </p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button
            onClick={() => setShowAddSlotModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', borderRadius: 10 }}
          >
            <Plus size={15} /> Add Slot
          </button>
        )}
      </div>

      {/* ── Day Selector Pills (horizontal scroll) ── */}
      <div style={{
        display: 'flex',
        gap: '0.45rem',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {days.map(d => {
          const isActiveDay = activeDay === d;
          const isTodayDay = d === todayName;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 12,
                flexShrink: 0,
                border: `1.5px solid ${isActiveDay ? 'var(--primary)' : isTodayDay ? 'rgba(99,102,241,0.3)' : 'var(--border-light)'}`,
                background: isActiveDay
                  ? 'linear-gradient(135deg, var(--primary), var(--accent-purple))'
                  : isTodayDay
                  ? 'rgba(99,102,241,0.08)'
                  : 'rgba(255,255,255,0.03)',
                color: isActiveDay ? '#ffffff' : isTodayDay ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActiveDay ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'var(--font-main)'
              }}
            >
              {isTodayDay && !isActiveDay && <span style={{ fontSize: '0.6rem' }}>●</span>}
              {d.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* ── Today Banner ── */}
      {isToday && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.07))',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14,
          padding: '0.65rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--primary)'
        }}>
          <span style={{ fontSize: '1rem' }}>📅</span>
          <span>
            Today — <strong>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
          </span>
          <span className="badge badge-safe" style={{ fontSize: '0.65rem', marginLeft: 'auto' }}>
            {currentDayData.slots.length} Classes
          </span>
        </div>
      )}

      {/* ── Slot List ── */}
      {currentDayData.slots.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {currentDayData.slots.map((slot, index) => {
            const accentColor = PERIOD_COLORS[index % PERIOD_COLORS.length];
            return (
              <div
                key={index}
                className="glass-card"
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                  padding: '0.9rem 1rem',
                  borderRadius: 14,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-glass)',
                  transition: 'all 0.2s ease',
                  animation: `cardReveal 0.3s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Period Number / Color Bar */}
                <div style={{
                  width: 3,
                  minHeight: '100%',
                  borderRadius: 4,
                  background: accentColor,
                  flexShrink: 0,
                  alignSelf: 'stretch'
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Time badge + Course Code row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-dim)',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid var(--border-light)'
                    }}>
                      <Clock size={11} /> {slot.time}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: accentColor,
                      background: `${accentColor}15`,
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: `1px solid ${accentColor}30`,
                      letterSpacing: '0.03em'
                    }}>
                      {slot.courseCode}
                    </span>
                  </div>

                  {/* Subject Name */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', lineHeight: 1.3, color: 'var(--text-main)' }}>
                    {slot.name}
                  </h4>

                  {/* Room + Faculty row */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} color="var(--primary)" />
                      {slot.room}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      <User size={12} color="var(--accent-cyan)" />
                      {slot.faculty}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: '2.5rem 1rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 16,
          border: '1px dashed var(--border-light)'
        }}>
          <BookOpen size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: '0.85rem' }}>No lectures scheduled for {activeDay}</p>
        </div>
      )}

      {/* ── Add Slot Modal ── */}
      {showAddSlotModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Add Lecture · {activeDay}</h3>
              <button onClick={() => setShowAddSlotModal(false)} className="btn btn-secondary" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Subject
                </label>
                <select value={slotCourseId} onChange={(e) => setSlotCourseId(e.target.value)} className="input-field">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Time Slot
                </label>
                <input
                  type="text"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  placeholder="e.g. 10:15 AM – 11:15 AM"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Room / Venue
                </label>
                <input
                  type="text"
                  value={slotRoom}
                  onChange={(e) => setSlotRoom(e.target.value)}
                  placeholder="e.g. LH-3 / Lab 204"
                  required
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowAddSlotModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={15} /> Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
