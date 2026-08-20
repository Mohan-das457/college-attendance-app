import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Presentation, 
  Download, 
  Eye, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Send, 
  Sparkles, 
  Upload, 
  File, 
  Image as ImageIcon,
  FileSpreadsheet
} from 'lucide-react';

export const MaterialVaultModal = () => {
  const { materials, courses, role, uploadMaterial, showToast } = useAttendance();

  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [activePreviewDeck, setActivePreviewDeck] = useState(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [courseInput, setCourseInput] = useState(courses[0]?.id || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);

  const filteredMaterials = selectedCourseId === 'ALL'
    ? materials
    : materials.filter(m => m.courseId === selectedCourseId);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    let fileType = 'DOCUMENT';
    if (['ppt', 'pptx'].includes(fileExt)) fileType = 'PPTX Presentation';
    else if (fileExt === 'pdf') fileType = 'PDF Document';
    else if (['doc', 'docx'].includes(fileExt)) fileType = 'Word Document';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExt)) fileType = 'Image File';

    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Store File Data URL for image/document preview
    const reader = new FileReader();
    reader.onload = () => {
      setFileDetails({
        name: file.name,
        size: fileSizeMb,
        type: fileType,
        ext: fileExt.toUpperCase(),
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleOpenPreview = (deck) => {
    setActivePreviewDeck(deck);
    setPreviewSlideIdx(0);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    const courseObj = courses.find(c => c.id === courseInput);
    if (!courseObj || !titleInput) return;

    const fileData = fileDetails || {
      name: `${titleInput.replace(/\s+/g, '_')}.pptx`,
      size: '3.4 MB',
      type: 'PPTX Presentation',
      ext: 'PPTX',
      dataUrl: null
    };

    uploadMaterial({
      courseId: courseInput,
      courseName: courseObj.name,
      title: titleInput,
      slidesCount: fileData.ext === 'PPTX' ? 24 : 12,
      type: fileData.type,
      fileName: fileData.name,
      fileSize: fileData.size,
      fileExt: fileData.ext,
      fileDataUrl: fileData.dataUrl,
      previewSlides: [
        `Slide 1: ${titleInput} - Cover & Agenda`,
        `Slide 2: File Name: ${fileData.name} (${fileData.size})`,
        `Slide 3: Architectural Schematics & Key Takeaways`,
        `Slide 4: Summary & Q&A Discussion`
      ]
    });

    setTitleInput('');
    setSelectedFile(null);
    setFileDetails(null);
    setShowUploadModal(false);
  };

  const handleDownload = (mat) => {
    if (mat.fileDataUrl) {
      const a = document.createElement('a');
      a.href = mat.fileDataUrl;
      a.download = mat.fileName || 'study_material';
      a.click();
      showToast(`Downloading uploaded file: ${mat.fileName}...`, 'success');
    } else {
      showToast(`Downloading study material: ${mat.title}...`, 'info');
    }
  };

  const getBadgeColor = (ext) => {
    if (['PPT', 'PPTX'].includes(ext)) return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' };
    if (ext === 'PDF') return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' };
    if (['DOC', 'DOCX'].includes(ext)) return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' };
    return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--safe)' };
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Presentation size={22} color="var(--accent-cyan)" /> Lecture Slides, PPT, PDF & Document Vault
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Store & view PPT presentations, Word docs, PDFs, and slide images</p>
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
              <Upload size={16} /> Upload PDF / PPT / DOC
            </button>
          )}
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredMaterials.map(mat => {
          const ext = mat.fileExt || (mat.type?.includes('PDF') ? 'PDF' : 'PPTX');
          const badgeStyle = getBadgeColor(ext);

          return (
            <div key={mat.id} className="glass-card" style={{ padding: '1.25rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
                      {ext}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{mat.fileSize || '3.2 MB'}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', marginTop: '0.4rem', color: 'var(--text-main)' }}>
                    {mat.title}
                  </h4>
                </div>
              </div>

              {/* Image Thumbnail Preview if Image File */}
              {mat.fileDataUrl && ext.match(/(PNG|JPG|JPEG|WEBP)/i) ? (
                <div style={{ marginBottom: '0.85rem', borderRadius: '10px', overflow: 'hidden', height: '140px' }}>
                  <img src={mat.fileDataUrl} alt={mat.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.85rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Subject: <strong style={{ color: 'var(--text-main)' }}>{mat.courseName}</strong></span>
                  <span>Faculty: <strong style={{ color: 'var(--primary)' }}>{mat.uploadedBy}</strong></span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => handleOpenPreview(mat)} 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                >
                  <Eye size={15} /> Slide Preview
                </button>
                
                <button 
                  onClick={() => handleDownload(mat)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  title="Download File"
                >
                  <Download size={15} color="var(--safe)" /> Download
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Slide Preview Modal */}
      {activePreviewDeck && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>{activePreviewDeck.title}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activePreviewDeck.courseName} • File: {activePreviewDeck.fileName || 'slide_deck.pptx'}
                </span>
              </div>
              <button onClick={() => setActivePreviewDeck(null)} className="btn btn-secondary" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            {/* Display Image Preview if Uploaded Image */}
            {activePreviewDeck.fileDataUrl && activePreviewDeck.fileExt?.match(/(PNG|JPG|JPEG|WEBP)/i) ? (
              <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', maxHeight: '350px' }}>
                <img src={activePreviewDeck.fileDataUrl} alt={activePreviewDeck.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                border: '2px solid var(--border-glow)',
                borderRadius: '16px',
                padding: '2.5rem 1.75rem',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'center',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                marginBottom: '1.25rem',
                position: 'relative'
              }}>
                <Sparkles size={24} color="var(--accent-cyan)" style={{ position: 'absolute', top: '16px', left: '16px' }} />
                
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {activePreviewDeck.previewSlides[previewSlideIdx]}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Uploaded File: {activePreviewDeck.fileName || 'slide_deck.pptx'} ({activePreviewDeck.fileSize || '3.4 MB'})
                </p>
              </div>
            )}

            {/* Carousel Controls */}
            {(!activePreviewDeck.fileDataUrl || !activePreviewDeck.fileExt?.match(/(PNG|JPG|JPEG|WEBP)/i)) && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={() => setPreviewSlideIdx(prev => Math.max(0, prev - 1))}
                  disabled={previewSlideIdx === 0}
                  className="btn btn-secondary"
                  style={{ opacity: previewSlideIdx === 0 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 700 }}>
                  {previewSlideIdx + 1} / {activePreviewDeck.previewSlides.length}
                </span>

                <button 
                  onClick={() => setPreviewSlideIdx(prev => Math.min(activePreviewDeck.previewSlides.length - 1, prev + 1))}
                  disabled={previewSlideIdx === activePreviewDeck.previewSlides.length - 1}
                  className="btn btn-primary"
                  style={{ opacity: previewSlideIdx === activePreviewDeck.previewSlides.length - 1 ? 0.5 : 1 }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Upload Study Document (PDF / PPT / Word / Image)</h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary" style={{ padding: '0.3rem', borderRadius: '50%' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Select Subject:
                </label>
                <select 
                  value={courseInput} 
                  onChange={(e) => setCourseInput(e.target.value)} 
                  className="input-field"
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Document / Presentation Title:
                </label>
                <input 
                  type="text" 
                  value={titleInput} 
                  onChange={(e) => setTitleInput(e.target.value)} 
                  placeholder="e.g. Unit 4: Neural Networks Complete Slide Deck" 
                  required 
                  className="input-field" 
                />
              </div>

              {/* Real File Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Choose File (PDF, PPT, PPTX, DOC, DOCX, PNG, JPG):
                </label>
                <input 
                  type="file" 
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileChange}
                  required
                  className="input-field" 
                  style={{ padding: '0.5rem' }}
                />
              </div>

              {/* Uploaded File Selected Feedback */}
              {fileDetails && (
                <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--border-glow)', borderRadius: '10px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                    <File size={16} /> {fileDetails.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    Type: {fileDetails.type} • Size: {fileDetails.size}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><Upload size={16} /> Save & Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
