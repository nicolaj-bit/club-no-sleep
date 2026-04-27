import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Download, Share2, RotateCcw, X, SwitchCamera, Facebook, Github } from 'lucide-react';
import { toast } from 'sonner';
import WobblySticker from './WobblySticker';

const TODAY_STR = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Canvas helpers ────────────────────────────────────────────────────────────

function buildWobblePoints(cx, cy, r, seed, points = 40) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const jitter =
      (Math.sin(angle * 3 + seed) * 0.055 +
        Math.cos(angle * 5 + seed * 1.7) * 0.035 +
        Math.sin(angle * 7 + seed * 0.9) * 0.02) * r;
    pts.push([cx + (r + jitter) * Math.cos(angle), cy + (r + jitter) * Math.sin(angle)]);
  }
  return pts;
}

function canvasWobblePath(ctx, cx, cy, r, seed) {
  const pts = buildWobblePoints(cx, cy, r, seed);
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
    if (i === 0) ctx.moveTo(mid[0], mid[1]);
    else ctx.quadraticCurveTo(curr[0], curr[1], mid[0], mid[1]);
  }
  const first = pts[0];
  const last = pts[pts.length - 1];
  ctx.quadraticCurveTo(first[0], first[1], (first[0] + last[0]) / 2, (first[1] + last[1]) / 2);
  ctx.closePath();
}

function wrapTextCanvas(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawStickerOnCanvas(ctx, canvasW, canvasH, headline, dateStr) {
  // Position: bottom-left corner, 6% margin
  const S = canvasW * 0.44; // sticker diameter
  const cx = S / 2 + canvasW * 0.05;
  const cy = canvasH - S / 2 - canvasH * 0.05;

  const outerR = S * 0.44;
  const innerR = S * 0.365;

  const strokeColor = '#8B6650';
  const fillColor = '#D4B49A';
  const textColor = '#6B4430';
  const strokeW = S * 0.013;

  ctx.save();

  // Filled inner circle
  canvasWobblePath(ctx, cx, cy, innerR, 2.1);
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Inner ring
  canvasWobblePath(ctx, cx, cy, innerR, 2.1);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeW;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Outer ring
  canvasWobblePath(ctx, cx, cy, outerR, 0.7);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeW * 0.85;
  ctx.stroke();

  // Text
  const headlineFontSize = S * 0.118;
  const dateFontSize = S * 0.093;
  const lineHeight = headlineFontSize * 1.28;
  const gap = S * 0.04;
  const maxTextW = innerR * 1.6;

  ctx.font = `400 ${headlineFontSize}px 'Caveat', cursive`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const lines = wrapTextCanvas(ctx, headline, maxTextW);
  const blockHeight = lines.length * lineHeight + gap + dateFontSize;
  const startY = cy - blockHeight / 2 + headlineFontSize * 0.72;

  lines.forEach((line, i) => {
    ctx.font = `400 ${headlineFontSize}px 'Caveat', cursive`;
    ctx.fillText(line, cx, startY + i * lineHeight);
  });

  ctx.font = `400 ${dateFontSize}px 'Caveat', cursive`;
  ctx.fillText(dateStr + '.', cx, startY + lines.length * lineHeight + gap + dateFontSize * 0.1);

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MilestoneCamera({ frame, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState('camera');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const cleanHeadline = frame.headline.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
  const dateStr = TODAY_STR;

  // Load Caveat font into canvas context before drawing
  const loadFont = async () => {
    const font = new FontFace('Caveat', 'url(https://fonts.gstatic.com/s/caveat/v22/Qw3fZQtZyJ6M2scV61ZJ.woff2)');
    try {
      const loaded = await font.load();
      document.fonts.add(loaded);
    } catch (e) {
      // fallback: use system cursive
    }
  };

  const startCamera = useCallback(async (facing = facingMode) => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraReady(false);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1920 } },
      audio: false,
    });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => setCameraReady(true);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    loadFont();
    if (mode === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  const flipCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  };

  const renderPhoto = async (drawSource) => {
    await loadFont();
    const canvas = canvasRef.current;
    drawSource(canvas);
    drawStickerOnCanvas(canvas.getContext('2d'), canvas.width, canvas.height, cleanHeadline, dateStr);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
    setMode('preview');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !canvasRef.current) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvasRef.current.width = size;
    canvasRef.current.height = size;
    const ctx = canvasRef.current.getContext('2d');
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    renderPhoto(() => {}); // canvas already drawn
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
        renderPhoto(() => {});
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `lalatoto-${frame.id}.jpg`;
    a.click();
    toast.success('Billede gemt! 🎉');
  };

  const shareImage = async () => {
    if (!navigator.share) { downloadImage(); return; }
    const res = await fetch(capturedImage);
    const blob = await res.blob();
    const file = new File([blob], `lalatoto-${frame.id}.jpg`, { type: 'image/jpeg' });
    await navigator.share({ files: [file], title: frame.headline, text: frame.subline });
  };

  // Social media share intents
  const shareOnFacebook = () => {
    const text = encodeURIComponent(`Se min milepæl på LALATOTO: ${frame.headline} 🤍`);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}&app_id=123456`, '_blank');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Se min milepæl på LALATOTO: ${frame.headline} 🤍 #lalatoto`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Se min milepæl på LALATOTO: ${frame.headline} 🤍`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnEmail = () => {
    const subject = encodeURIComponent(`Min milepæl: ${frame.headline}`);
    const body = encodeURIComponent(`Se hvad jeg har delt på LALATOTO! 🤍\n\n${frame.subline}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const retake = () => { setCapturedImage(null); setMode('camera'); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} className="hidden" />

      {/* ── CAMERA MODE ── */}
      {mode === 'camera' && (
        <div className="relative h-full flex flex-col">
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Live sticker overlay */}
          <div className="absolute bottom-28 left-5 pointer-events-none" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))' }}>
            <WobblySticker headline={cleanHeadline} date={dateStr} size={150} />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={onClose}><X className="w-6 h-6 text-white drop-shadow" /></button>
            <p className="text-white font-semibold text-sm drop-shadow">{frame.label}</p>
            <button onClick={flipCamera}><SwitchCamera className="w-6 h-6 text-white drop-shadow" /></button>
          </div>

          {/* Shutter row */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-10 pb-16">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center active:opacity-70"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Upload className="w-5 h-5 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
            <div className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* ── PREVIEW MODE ── */}
      {mode === 'preview' && capturedImage && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={retake}><X className="w-6 h-6 text-white" /></button>
            <p className="text-white font-semibold text-sm">{frame.label}</p>
            <div className="w-6" />
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <img src={capturedImage} alt="Milepæl" className="w-full rounded-3xl object-cover" style={{ maxHeight: '65vh', maxWidth: 480 }} />
          </div>

          <div className="px-6 pb-12 pt-6 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={retake}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <RotateCcw className="w-4 h-4" /> Prøv igen
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                style={{ backgroundColor: '#FFFFFF', color: '#2B1F16' }}
              >
                <Download className="w-4 h-4" /> Gem
              </button>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
              >
                <Share2 className="w-4 h-4" /> Del
              </button>
            </div>

            {/* Social media share buttons */}
            {showShareMenu && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={shareOnFacebook}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                  style={{ backgroundColor: '#1877F2', color: '#fff', borderColor: '#1877F2' }}
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                  style={{ backgroundColor: '#000000', color: '#fff', borderColor: '#000000' }}
                >
                  𝕏 Twitter
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                  style={{ backgroundColor: '#25D366', color: '#fff', borderColor: '#25D366' }}
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={shareOnEmail}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                  style={{ backgroundColor: '#EA4335', color: '#fff', borderColor: '#EA4335' }}
                >
                  ✉️ Email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}