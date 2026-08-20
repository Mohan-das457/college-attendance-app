import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, X, ShieldCheck, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QRScannerModal({ onClose, onScanSuccess, activeSession }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    let html5QrCode = null;

    const startScanner = async () => {
      setErrorMsg('');
      try {
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        isScanningRef.current = true;
        await html5QrCode.start(
          { facingMode },
          config,
          (decodedText) => {
            if (!isScanningRef.current) return;
            isScanningRef.current = false;
            handleSuccessfulScan(decodedText);
          },
          () => {
            // Ignore frame parse errors
          }
        );
        setCameraActive(true);
      } catch (err) {
        console.error('Camera start error:', err);
        setCameraActive(false);
        setErrorMsg('Camera access denied or camera not available. Please allow camera permissions in your browser.');
      }
    };

    startScanner();

    return () => {
      isScanningRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current?.clear();
        });
      }
    };
  }, [facingMode]);

  const handleSuccessfulScan = (decodedText) => {
    try {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    } catch {}

    // Trigger Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const result = onScanSuccess(decodedText);
    setSuccessData(result || { success: true });
  };

  const toggleCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {}).then(() => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 22, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: 16,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #0f172a, #0b0f19)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: 24,
        padding: '24px 20px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.25)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: 'var(--text-muted)',
            width: 34,
            height: 34,
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)' }}>
            <Camera size={18} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Classroom QR Scanner</h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
          Point camera at the teacher's projector or screen
        </p>

        {/* Active Session Info Banner */}
        {activeSession && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 12,
            padding: '8px 12px',
            marginBottom: 16,
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-dim)' }}>Live Class:</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {activeSession.courseCode || activeSession.courseName}
            </span>
          </div>
        )}

        {/* Success View */}
        {successData ? (
          <div style={{ padding: '24px 12px', animation: 'scaleUp 0.3s ease-out' }}>
            <div style={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--safe)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={38} color="var(--safe)" />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--safe)', margin: '0 0 6px 0' }}>
              Attendance Recorded!
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              {successData?.course?.name || activeSession?.courseName || 'Subject Attendance'}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16,185,129,0.1)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.75rem',
              color: 'var(--safe)',
              fontWeight: 700,
              marginBottom: 20
            }}>
              <ShieldCheck size={14} /> Verified & Synced
            </div>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: 12, fontWeight: 700 }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Scanner Viewport */
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              height: 280,
              background: '#000',
              borderRadius: 18,
              overflow: 'hidden',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div id="qr-reader" style={{ width: '100%', height: '100%' }} />

              {/* Scanning overlay laser */}
              {cameraActive && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: 200,
                    height: 200,
                    border: '2px solid #6366f1',
                    borderRadius: 16,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    position: 'relative'
                  }}>
                    {/* Corner Reticles */}
                    <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid #06b6d4', borderLeft: '4px solid #06b6d4', borderTopLeftRadius: 8 }} />
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid #06b6d4', borderRight: '4px solid #06b6d4', borderTopRightRadius: 8 }} />
                    <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid #06b6d4', borderLeft: '4px solid #06b6d4', borderBottomLeftRadius: 8 }} />
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid #06b6d4', borderRight: '4px solid #06b6d4', borderBottomRightRadius: 8 }} />
                    
                    {/* Animated Scanning Laser Line */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'linear-gradient(90deg, transparent, #06b6d4, #6366f1, transparent)',
                      boxShadow: '0 0 8px #06b6d4',
                      animation: 'scanLaser 2s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 10,
                color: 'var(--danger)',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textAlign: 'left'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
              <button
                onClick={toggleCamera}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} /> Switch Camera
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Auto-detects course & PIN
              </span>
            </div>
          </div>
        )}

        <style>{`
          @keyframes scanLaser {
            0%, 100% { top: 10%; opacity: 0.3; }
            50% { top: 90%; opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
