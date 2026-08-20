import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  FileCheck, 
  Upload, 
  Printer, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Search, 
  X, 
  Check 
} from 'lucide-react';

export const CertificateModal = ({ role = 'student' }) => {
  const { 
    certificates, 
    uploadCertificate, 
    updateCertificateStatus, 
    students, 
    courses, 
    showToast 
  } = useAttendance();

  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'upload'
  const [selectedCert, setSelectedCert] = useState(null); // certificate being viewed/printed
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Form State
  const [type, setType] = useState('Medical Exemption');
  const [title, setTitle] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [subjectName, setSubjectName] = useState(courses[0]?.name || 'Artificial Intelligence & ML');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');

  // Verification Remarks Modal State for Faculty/Admin
  const [reviewModalCert, setReviewModalCert] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const currentStudent = students[0];

  // Filter certificates based on role
  const displayedCerts = certificates.filter(cert => {
    if (role === 'student') {
      // Only show current student's certificates
      if (cert.studentId !== currentStudent.id && cert.rollNo !== currentStudent.rollNo) {
        return false;
      }
    }
    if (filterType !== 'all' && cert.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        cert.studentName.toLowerCase().includes(q) ||
        cert.rollNo.toLowerCase().includes(q) ||
        cert.title.toLowerCase().includes(q) ||
        cert.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title || !issuedBy || !issueDate) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    uploadCertificate({
      type,
      title,
      issuedBy,
      issueDate,
      subjectName,
      fileUrl: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      remarks: notes || 'Uploaded for verification'
    });

    // Reset Form
    setTitle('');
    setIssuedBy('');
    setIssueDate('');
    setFileName('');
    setNotes('');
    setActiveSubTab('list');
  };

  const handlePrint = (cert) => {
    setSelectedCert(cert);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleOpenReview = (cert, defaultStatus) => {
    setReviewModalCert(cert);
    setReviewStatus(defaultStatus);
    setReviewRemarks(cert.remarks || '');
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!reviewModalCert) return;
    const reviewerName = role === 'admin' ? "Dean's Office (Admin)" : "Faculty Office";
    updateCertificateStatus(reviewModalCert.id, reviewStatus, reviewRemarks, reviewerName);
    setReviewModalCert(null);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Header & Role Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="var(--primary)" /> Student Document & Certificate Portal
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {role === 'student' 
              ? 'Upload medical certificates, duty leave (OD) forms, and course certifications for verification.'
              : 'Review, verify, approve, and print student submitted certificates for official record.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {role === 'student' && (
            <button
              onClick={() => setActiveSubTab(activeSubTab === 'upload' ? 'list' : 'upload')}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
            >
              {activeSubTab === 'upload' ? <FileText size={16} /> : <Upload size={16} />}
              {activeSubTab === 'upload' ? 'View Certificates' : 'Upload New Certificate'}
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB: Upload Form (Student) */}
      {activeSubTab === 'upload' && role === 'student' && (
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Upload size={18} /> Upload Certificate Document for Verification
          </h4>

          <form onSubmit={handleFormSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Certificate Type:
              </label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="Medical Exemption">Medical Exemption Certificate</option>
                <option value="Duty Leave (OD)">Duty Leave (OD) / Hackathon</option>
                <option value="Course Completion">Course Completion / Certification</option>
                <option value="Sports & Extra-Curricular">Sports & Extra-Curricular</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Certificate Title / Document Name:
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Hospital Medical Certificate / IIT Hackathon Winner" 
                required 
                className="input-field" 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Issuing Hospital / Organization:
              </label>
              <input 
                type="text" 
                value={issuedBy} 
                onChange={e => setIssuedBy(e.target.value)}
                placeholder="e.g. City General Hospital / AWS" 
                required 
                className="input-field" 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Certificate Issue Date:
              </label>
              <input 
                type="date" 
                value={issueDate} 
                onChange={e => setIssueDate(e.target.value)}
                required 
                className="input-field" 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Associated Course / Subject:
              </label>
              <select 
                value={subjectName} 
                onChange={e => setSubjectName(e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
              >
                {courses.map(c => <option key={c.id} value={c.name}>{c.code} - {c.name}</option>)}
                <option value="General College Attendance">General College Attendance</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Attach Document File (PDF / JPG):
              </label>
              <input 
                type="file" 
                onChange={e => setFileName(e.target.files[0]?.name || '')}
                className="input-field"
                style={{ padding: '0.45rem' }}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                Additional Notes / Purpose for Faculty Review:
              </label>
              <textarea 
                rows="2" 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Requesting 3 days OD exemption for participating in national level hackathon..."
                className="input-field" 
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setActiveSubTab('list')} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Upload size={16} /> Submit Certificate for Verification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'Medical Exemption', 'Duty Leave (OD)', 'Course Completion'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className="btn"
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.78rem',
                borderRadius: '8px',
                background: filterType === t ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                color: filterType === t ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${filterType === t ? 'var(--primary-glow)' : 'var(--border-light)'}`
              }}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Search input for Faculty/Admin */}
        {role !== 'student' && (
          <div style={{ position: 'relative', width: '220px' }}>
            <input 
              type="text" 
              placeholder="Search student or cert..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', padding: '0.4rem 0.8rem 0.4rem 2.2rem', fontSize: '0.8rem' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          </div>
        )}
      </div>

      {/* Certificates Cards Grid */}
      {displayedCerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
          <FileText size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
          <p style={{ fontSize: '0.9rem' }}>No uploaded certificates found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {displayedCerts.map(cert => {
            const isApproved = cert.status === 'Approved';
            const isRejected = cert.status === 'Rejected';
            const statusColor = isApproved ? 'var(--safe)' : (isRejected ? 'var(--danger)' : 'var(--warning)');

            return (
              <div 
                key={cert.id} 
                className="glass-card" 
                style={{ 
                  padding: '1.25rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${statusColor}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', fontSize: '0.72rem' }}>
                      {cert.type}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      {isApproved && <CheckCircle size={14} />}
                      {isRejected && <XCircle size={14} />}
                      {!isApproved && !isRejected && <Clock size={14} />}
                      {cert.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>{cert.title}</h4>
                  
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    <strong>Student:</strong> {cert.studentName} ({cert.rollNo}) • {cert.section}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '0.8rem' }}>
                    <div><strong>Issued By:</strong> {cert.issuedBy}</div>
                    <div><strong>Issue Date:</strong> {cert.issueDate} • <strong>Subject:</strong> {cert.subjectName}</div>
                    {cert.remarks && (
                      <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.74rem' }}>
                        <em>"{cert.remarks}"</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bar */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <FileCheck size={14} /> View Certificate
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {/* Direct Print Button */}
                    <button
                      onClick={() => handlePrint(cert)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      title="Direct Print Certificate Document"
                    >
                      <Printer size={14} color="var(--primary)" /> Print
                    </button>

                    {/* Faculty/Admin Verification Action Buttons */}
                    {role !== 'student' && (
                      <>
                        <button
                          onClick={() => handleOpenReview(cert, 'Approved')}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', color: 'var(--safe)', borderColor: 'var(--safe)' }}
                          title="Approve Certificate"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleOpenReview(cert, 'Rejected')}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.72rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          title="Reject Certificate"
                        >
                          <X size={14} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL 1: VIEW & PRINTABLE OFFICIAL CERTIFICATE DOCUMENT ─── */}
      {selectedCert && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '680px', padding: '2rem', position: 'relative' }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedCert(null)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Print Header Controls (Hidden during actual window.print()) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span className="badge badge-safe" style={{ fontSize: '0.8rem' }}>
                Official Verification Document
              </span>
              <button 
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Printer size={16} /> Direct Print Certificate
              </button>
            </div>

            {/* 📜 PRINTABLE OFFICIAL CERTIFICATE CONTAINER 📜 */}
            <div 
              id="printable-certificate"
              style={{ 
                background: '#ffffff', 
                color: '#0f172a', 
                padding: '2.5rem', 
                borderRadius: '12px', 
                border: '8px double #1e293b',
                fontFamily: 'serif',
                position: 'relative'
              }}
            >
              {/* College Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#1e3a8a' }}>
                  Madanapalle Institute of Technology & Science
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '2px 0 0 0', fontWeight: 600 }}>
                  WWW.MITS.AC.IN • UGC Autonomous • Affiliated to JNTUA • Angallu, Madanapalle
                </p>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '10px', textTransform: 'uppercase', color: '#0f172a', textDecoration: 'underline' }}>
                  STUDENT CERTIFICATE & DUTY EXEMPTION VERIFICATION
                </h4>
              </div>

              {/* Document Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}>
                <div>
                  <strong>Document ID:</strong> {selectedCert.id}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Upload Date:</strong> {selectedCert.uploadDate}
                </div>
                <div>
                  <strong>Student Name:</strong> <span style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedCert.studentName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Roll Number:</strong> {selectedCert.rollNo}
                </div>
                <div>
                  <strong>Department:</strong> {selectedCert.department}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Section / Sem:</strong> {selectedCert.section} ({selectedCert.semester})
                </div>
              </div>

              {/* Certificate Details Box */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Certificate Type: <span style={{ color: '#2563eb' }}>{selectedCert.type}</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {selectedCert.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  <strong>Issuing Authority:</strong> {selectedCert.issuedBy} (Date: {selectedCert.issueDate})
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.3rem' }}>
                  <strong>Applied Course / Subject:</strong> {selectedCert.subjectName}
                </div>
              </div>

              {/* Status & Remarks */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selectedCert.status === 'Approved' ? '#f0fdf4' : '#fef2f2', padding: '1rem', borderRadius: '8px', border: `1px solid ${selectedCert.status === 'Approved' ? '#86efac' : '#fca5a5'}`, marginBottom: '2rem', fontFamily: 'sans-serif' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>Verification Status:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedCert.status === 'Approved' ? '#16a34a' : '#dc2626' }}>
                    {selectedCert.status.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#334155' }}>
                  <div><strong>Verified By:</strong> {selectedCert.approvedBy}</div>
                  <div><em>"{selectedCert.remarks}"</em></div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px dashed #94a3b8', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px' }}></div>
                  <strong>Student Signature</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px', fontWeight: 'bold', color: '#1e3a8a' }}>Dr. Rajesh Iyer</div>
                  <strong>Faculty / HOD Signature</strong>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '30px', fontWeight: 'bold', color: '#1e3a8a' }}>Dean Academic Affairs</div>
                  <strong>Official Stamp & Seal</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── MODAL 2: FACULTY / ADMIN VERIFICATION & APPROVAL ─── */}
      {reviewModalCert && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--primary)" /> Certificate Verification Review
            </h3>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Reviewing <strong>{reviewModalCert.title}</strong> submitted by <strong>{reviewModalCert.studentName} ({reviewModalCert.rollNo})</strong>.
            </div>

            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Verification Status:
                </label>
                <select 
                  value={reviewStatus} 
                  onChange={e => setReviewStatus(e.target.value)}
                  className="input-field"
                  style={{ width: '100%' }}
                >
                  <option value="Approved">Approved (Exemption Granted)</option>
                  <option value="Rejected">Rejected (Invalid Certificate)</option>
                  <option value="Pending">Pending Further Verification</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Official Remarks / Exemption Notes:
                </label>
                <textarea 
                  rows="3" 
                  value={reviewRemarks} 
                  onChange={e => setReviewRemarks(e.target.value)}
                  placeholder="e.g. Verified by HOD office. 3 days duty exemption granted."
                  className="input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setReviewModalCert(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Verification Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print CSS styling for printing A4 official certificate */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 4px double #000 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
