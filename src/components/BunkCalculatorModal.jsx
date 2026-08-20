import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Calculator, X, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const BunkCalculatorModal = ({ course: initialCourse, onClose }) => {
  const { courses, targetThreshold, calculateBunkStats } = useAttendance();

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourse ? initialCourse.id : courses[0]?.id || '');
  const [target, setTarget] = useState(targetThreshold);
  
  // Custom manual calculation fields
  const [useCustom, setUseCustom] = useState(false);
  const [customConducted, setCustomConducted] = useState(30);
  const [customAttended, setCustomAttended] = useState(22);

  // Find active course details
  const activeCourse = courses.find(c => c.id === selectedCourseId);

  const conducted = useCustom ? Number(customConducted) : (activeCourse ? activeCourse.conducted : 0);
  const attended = useCustom ? Number(customAttended) : (activeCourse ? activeCourse.attended : 0);

  const stats = calculateBunkStats(conducted, attended, target);

  // What-If Simulation State
  const [futureAttend, setFutureAttend] = useState(0);
  const [futureMiss, setFutureMiss] = useState(0);

  const simulatedConducted = conducted + Number(futureAttend) + Number(futureMiss);
  const simulatedAttended = attended + Number(futureAttend);
  const simulatedPct = simulatedConducted > 0 ? Math.round((simulatedAttended / simulatedConducted) * 1000) / 10 : 100;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--primary-glow)', borderRadius: '10px' }}>
              <Calculator color="var(--primary)" size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Attendance Bunk & Goal Predictor</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculate safe bunks & recovery requirement</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Source Switcher: Select Course vs Custom Input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setUseCustom(false)}
            className="btn"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.85rem',
              background: !useCustom ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
              color: !useCustom ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${!useCustom ? 'var(--primary)' : 'var(--border-light)'}`
            }}
          >
            Select My Course
          </button>
          <button
            onClick={() => setUseCustom(true)}
            className="btn"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.85rem',
              background: useCustom ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)',
              color: useCustom ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${useCustom ? 'var(--primary)' : 'var(--border-light)'}`
            }}
          >
            Custom Numbers
          </button>
        </div>

        {!useCustom ? (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Choose Subject / Course:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="input-field"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - Current: {Math.round((c.attended / c.conducted) * 100)}% ({c.attended}/{c.conducted})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Total Conducted Classes:
              </label>
              <input
                type="number"
                min="1"
                value={customConducted}
                onChange={(e) => setCustomConducted(Math.max(1, Number(e.target.value)))}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Total Attended Classes:
              </label>
              <input
                type="number"
                min="0"
                max={customConducted}
                value={customAttended}
                onChange={(e) => setCustomAttended(Math.min(customConducted, Math.max(0, Number(e.target.value))))}
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Target Threshold Slider */}
        <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target Attendance Goal:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{target}%</span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="5"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>

        {/* Dynamic Prediction Results Display Card */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '12px',
          background: stats.status === 'safe' ? 'var(--safe-bg)' : 'var(--danger-bg)',
          border: `1px solid ${stats.status === 'safe' ? 'var(--safe-border)' : 'var(--danger-border)'}`,
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            {stats.status === 'safe' ? (
              <CheckCircle color="var(--safe)" size={22} />
            ) : (
              <AlertTriangle color="var(--danger)" size={22} />
            )}
            <h4 style={{ fontSize: '1.05rem', color: stats.status === 'safe' ? 'var(--safe)' : 'var(--danger)' }}>
              {stats.status === 'safe' ? 'Safe Zone!' : 'Recovery Required!'}
            </h4>
          </div>

          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {stats.message}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Current %</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stats.currentPct}%</span>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Bunk Allowance</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--safe)' }}>
                {stats.maxBunks} {stats.maxBunks === 1 ? 'class' : 'classes'}
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Must Attend</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: stats.neededClasses > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                {stats.neededClasses} {stats.neededClasses === 1 ? 'class' : 'classes'}
              </span>
            </div>
          </div>
        </div>

        {/* Future "What-If" Scenario Simulator */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <h4 style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
            <Sparkles size={16} /> Interactive "What-If" Simulator
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>If I attend next N classes:</label>
              <input
                type="number"
                min="0"
                value={futureAttend}
                onChange={(e) => setFutureAttend(Math.max(0, Number(e.target.value)))}
                className="input-field"
                style={{ marginTop: '0.25rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>If I miss next N classes:</label>
              <input
                type="number"
                min="0"
                value={futureMiss}
                onChange={(e) => setFutureMiss(Math.max(0, Number(e.target.value)))}
                className="input-field"
                style={{ marginTop: '0.25rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Projected Result:</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                fontSize: '1.1rem', 
                fontWeight: 800, 
                color: simulatedPct >= target ? 'var(--safe)' : 'var(--danger)' 
              }}>
                {simulatedPct}% ({attended + Number(futureAttend)} / {simulatedConducted})
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
