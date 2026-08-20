import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calendar, Clock, MapPin, User, Plus, X } from 'lucide-react';

export const TimetableGrid = () => {
  const { weeklyTimetable, courses, role, addTimetableSlot } = useAttendance();

  const days = weeklyTimetable.map(item => item.day);
  const [activeDay, setActiveDay] = useState("Monday");
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  // Add Slot Form State
  const [slotTime, setSlotTime] = useState("09:00 - 10:00");
  const [slotCourseId, setSlotCourseId] = useState(courses[0]?.id || '');
  const [slotRoom, setSlotRoom] = useState("LH-1");

  const currentDayData = weeklyTimetable.find(d => d.day === activeDay) || { day: activeDay, slots: [] };

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
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={22} color="var(--primary)" /> Academic Class Timetable
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly lecture schedules, venues, and timings</p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <button 
            onClick={() => setShowAddSlotModal(true)} 
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add Lecture Slot
          </button>
        )}
      </div>

      {/* Day Selector Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {days.map(d => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className="btn"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              borderRadius: '10px',
              background: activeDay === d ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
              color: activeDay === d ? '#ffffff' : 'var(--text-muted)',
              border: `1px solid ${activeDay === d ? 'var(--primary-glow)' : 'var(--border-light)'}`,
              whiteSpace: 'nowrap'
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Slots List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {currentDayData.slots.length > 0 ? (
          currentDayData.slots.map((slot, index) => (
            <div key={index} className="glass-card" style={{ padding: '1.15rem', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span className="badge badge-safe" style={{ fontSize: '0.72rem' }}>
                  <Clock size={12} /> {slot.time}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                  {slot.courseCode}
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {slot.name}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>Venue: <strong>{slot.room}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} color="var(--accent-cyan)" />
                  <span>Faculty: <strong>{slot.faculty}</strong></span>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', gridColumn: '1 / -1' }}>
            No lectures scheduled for {activeDay}.
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddSlotModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Add Lecture to {activeDay} Timetable</h3>
              <button onClick={() => setShowAddSlotModal(false)} className="btn btn-secondary" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Course / Subject:
                </label>
                <select 
                  value={slotCourseId} 
                  onChange={(e) => setSlotCourseId(e.target.value)} 
                  className="input-field"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Time Slot:
                </label>
                <input 
                  type="text" 
                  value={slotTime} 
                  onChange={(e) => setSlotTime(e.target.value)} 
                  placeholder="e.g. 10:15 AM - 11:15 AM" 
                  required 
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Room / Lab Venue:
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddSlotModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
