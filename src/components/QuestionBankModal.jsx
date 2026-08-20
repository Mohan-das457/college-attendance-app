import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { FileQuestion, Download, Plus, X, BookOpen, CheckCircle, FileText, Send, Upload, File } from 'lucide-react';

export const QuestionBankModal = () => {
  const { questionBanks, courses, role, addQuestionBank, showToast } = useAttendance();

  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [unitTitle, setUnitTitle] = useState('');
  const [courseIdInput, setCourseIdInput] = useState(courses[0]?.id || '');
  const [q2m, setQ2m] = useState('');
  const [q5m, setQ5m] = useState('');
  const [q10m, setQ10m] = useState('');
  const [selectedQbFile, setSelectedQbFile] = useState(null);
  const [qbFileDetails, setQbFileDetails] = useState(null);

  const filteredBanks = selectedCourseId === 'ALL' 
    ? questionBanks 
    : questionBanks.filter(q => q.courseId === selectedCourseId);

  const handleQbFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toUpperCase();
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const reader = new FileReader();
    reader.onload = () => {
      setQbFileDetails({
        name: file.name,
        size: fileSizeMb,
        ext: fileExt,
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
    setSelectedQbFile(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    const courseObj = courses.find(c => c.id === courseIdInput);
    if (!courseObj || !unitTitle) return;

    const questionsList = [];
    if (q2m) questionsList.push({ id: 'q1', marks: '2 Marks', text: q2m });
    if (q5m) questionsList.push({ id: 'q2', marks: '5 Marks', text: q5m });
    if (q10m) questionsList.push({ id: 'q3', marks: '10 Marks', text: q10m });

    const fileInfo = qbFileDetails || {
      name: `${courseObj.code}_QuestionBank.pdf`,
      size: '2.1 MB',
      ext: 'PDF',
      dataUrl: null
    };

    addQuestionBank({
      courseId: courseIdInput,
      courseName: courseObj.name,
      unit: unitTitle,
      questions: questionsList.length > 0 ? questionsList : [
        { id: 'q1', marks: '5 Marks', text: 'Sample midterm exam paper question.' }
      ],
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileExt: fileInfo.ext,
      fileUrl: fileInfo.name,
      fileDataUrl: fileInfo.dataUrl
    });

    setUnitTitle('');
    setQ2m('');
    setQ5m('');
    setQ10m('');
    setSelectedQbFile(null);
    setQbFileDetails(null);
    setShowUploadModal(false);
  };

  const handleDownload = (bank) => {
    if (bank.fileDataUrl) {
      const a = document.createElement('a');
      a.href = bank.fileDataUrl;
      a.download = bank.fileName || bank.fileUrl || 'Question_Bank';
      a.click();
      showToast(`Downloading uploaded Question Bank: ${bank.fileName || bank.fileUrl}...`, 'success');
    } else {
      showToast(`Downloading Exam Question Bank: ${bank.fileUrl || 'Question_Bank.pdf'}...`, 'info');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileQuestion size={22} color="var(--accent-purple)" /> Important Question Bank Repository
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload & download PDF, Word, PPT & Image question papers</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Subjects</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
          </select>

          {role === 'teacher' && (
            <button 
              onClick={() => setShowUploadModal(true)} 
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
            >
              <Upload size={16} /> Upload Question Bank File
            </button>
          )}
        </div>
      </div>

      {/* Question Banks Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredBanks.map(bank => {
          const ext = bank.fileExt || 'PDF';

          return (
            <div key={bank.id} className="glass-card" style={{ padding: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
                      {bank.courseName}
                    </span>
                    <span className="badge badge-safe" style={{ fontSize: '0.7rem' }}>
                      {ext}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginTop: '0.4rem', color: 'var(--text-main)' }}>
                    {bank.unit}
                  </h4>
                </div>

                <button 
                  onClick={() => handleDownload(bank)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  title="Download Question Bank File"
                >
                  <Download size={14} color="var(--safe)" /> {ext}
                </button>
              </div>

              {/* Questions Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '0.85rem 0' }}>
                {bank.questions.map(q => (
                  <div key={q.id} style={{ 
                    padding: '0.6rem 0.85rem', 
                    background: 'rgba(0,0,0,0.25)', 
                    borderRadius: '8px', 
                    fontSize: '0.8rem',
                    borderLeft: '3px solid var(--primary)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{q.marks}</span>
                    </div>
                    <p style={{ color: 'var(--text-main)', lineHeight: 1.3 }}>{q.text}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-light)', paddingTop: '0.6rem' }}>
                <span>Faculty: {bank.uploadedBy}</span>
                <span>{bank.fileSize || '2.1 MB'} • {bank.date}</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Upload Question Bank Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Upload Question Bank (PDF, Word, PPT, Image)</h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Subject / Course:
                </label>
                <select 
                  value={courseIdInput} 
                  onChange={(e) => setCourseIdInput(e.target.value)} 
                  className="input-field"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Unit / Exam Title:
                </label>
                <input 
                  type="text" 
                  value={unitTitle} 
                  onChange={(e) => setUnitTitle(e.target.value)} 
                  placeholder="e.g. Unit 3: Midterm Question Paper & Answer Key" 
                  required 
                  className="input-field" 
                />
              </div>

              {/* File Attachment input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Attach Question Bank File (PDF, PPT, DOCX, PNG, JPG):
                </label>
                <input 
                  type="file" 
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleQbFileChange}
                  className="input-field" 
                  style={{ padding: '0.5rem' }}
                />
              </div>

              {qbFileDetails && (
                <div style={{ padding: '0.65rem', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid var(--border-glow)', borderRadius: '8px', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>Attached: {qbFileDetails.name} ({qbFileDetails.size})</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Highlight 2-Mark Question:
                </label>
                <input 
                  type="text" 
                  value={q2m} 
                  onChange={(e) => setQ2m(e.target.value)} 
                  placeholder="e.g. What is the time complexity of QuickSort?" 
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Highlight 5-Mark / 10-Mark Question:
                </label>
                <input 
                  type="text" 
                  value={q5m} 
                  onChange={(e) => setQ5m(e.target.value)} 
                  placeholder="e.g. Explain Dijkstra's shortest path algorithm with example." 
                  className="input-field" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Upload size={16} /> Publish Question Bank</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
