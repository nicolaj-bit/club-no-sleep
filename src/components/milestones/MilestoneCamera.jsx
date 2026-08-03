import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ImageIcon, Download, Share2, RotateCcw, X, SwitchCamera, Facebook, Twitter, MessageCircle, Mail, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import TypeSticker from './TypeSticker';

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

function drawBalloonStickerOnCanvas(ctx, canvasW, canvasH, headline, subline, dateStr) {
  const balloonX = canvasW * 0.22;
  const balloonY = canvasH * 0.72;
  const balloonRadiusX = canvasW * 0.14;
  const balloonRadiusY = canvasW * 0.17;
  const maxTextW = balloonRadiusX * 1.7;

  ctx.save();

  // String
  ctx.strokeStyle = '#D4C4B0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(balloonX, balloonY + balloonRadiusY);
  ctx.lineTo(balloonX, canvasH - canvasW * 0.03);
  ctx.stroke();

  // Balloon ellipse
  ctx.fillStyle = '#F5E8D8';
  ctx.strokeStyle = '#E8D7C3';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(balloonX, balloonY, balloonRadiusX, balloonRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(balloonX - balloonRadiusX * 0.3, balloonY - balloonRadiusY * 0.5, balloonRadiusX * 0.2, balloonRadiusY * 0.27, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Auto-fit headline: reduce font size until lines fit
  let headlineFs = canvasW * 0.032;
  let headlineLines;
  for (let fs = headlineFs; fs >= canvasW * 0.018; fs -= canvasW * 0.002) {
    ctx.font = `400 ${fs}px 'Cormorant Garamond', serif`;
    headlineLines = wrapTextCanvas(ctx, headline, maxTextW);
    if (headlineLines.length <= 3) { headlineFs = fs; break; }
  }

  const headlineLineH = headlineFs * 1.3;

  // Subline
  let subLines = [];
  let subFs = canvasW * 0.026;
  if (subline) {
    for (let fs = subFs; fs >= canvasW * 0.015; fs -= canvasW * 0.002) {
      ctx.font = `italic 400 ${fs}px 'Cormorant Garamond', serif`;
      subLines = wrapTextCanvas(ctx, subline, maxTextW);
      if (subLines.length <= 2) { subFs = fs; break; }
    }
  }
  const subLineH = subFs * 1.2;

  const heartH = canvasW * 0.025;
  const dateH = canvasW * 0.022;
  const totalH =
    headlineLines.length * headlineLineH +
    (subLines.length > 0 ? canvasW * 0.01 + subLines.length * subLineH : 0) +
    heartH + canvasW * 0.01 + dateH;

  let curY = balloonY - totalH / 2;

  // Draw headline
  ctx.fillStyle = '#8B7355';
  headlineLines.forEach((line) => {
    ctx.font = `400 ${headlineFs}px 'Cormorant Garamond', serif`;
    ctx.fillText(line, balloonX, curY + headlineFs);
    curY += headlineLineH;
  });

  // Draw subline
  if (subLines.length > 0) {
    curY += canvasW * 0.01;
    ctx.fillStyle = '#A08060';
    subLines.forEach((line) => {
      ctx.font = `italic 400 ${subFs}px 'Cormorant Garamond', serif`;
      ctx.fillText(line, balloonX, curY + subFs);
      curY += subLineH;
    });
  }

  // Heart
  curY += canvasW * 0.01;
  ctx.fillStyle = '#9B7F6E';
  const hx = balloonX;
  const hy = curY;
  const hs = heartH * 0.5;
  ctx.beginPath();
  ctx.moveTo(hx, hy - hs);
  ctx.bezierCurveTo(hx - hs * 2, hy - hs * 3, hx - hs * 3, hy - hs * 2, hx - hs * 1.5, hy + hs);
  ctx.bezierCurveTo(hx, hy + hs * 3, hx + hs * 1.5, hy + hs, hx + hs * 3, hy - hs * 2);
  ctx.bezierCurveTo(hx + hs * 2, hy - hs * 3, hx, hy - hs, hx, hy - hs);
  ctx.fill();
  curY += heartH + canvasW * 0.01;

  // Date
  ctx.font = `${dateH}px 'Inter', sans-serif`;
  ctx.fillStyle = '#8B7355';
  ctx.fillText(dateStr, balloonX, curY + dateH);

  ctx.restore();
}

function drawStickerOnCanvas(ctx, canvasW, canvasH, headline, dateStr) {
  const FS = canvasW * 0.042;
  const DATE_FS = canvasW * 0.034;
  const LINE_H = FS * 1.4;
  const PAD_X = canvasW * 0.04;
  const PAD_Y = canvasW * 0.022;
  const GAP = canvasW * 0.018;
  const maxWidth = canvasW * 0.72;

  ctx.save();
  ctx.font = `400 ${FS}px 'Courier New', Courier, monospace`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Wrap headline
  const lines = wrapTextCanvas(ctx, headline, maxWidth);

  const headlineBlockH = lines.length * LINE_H;
  const totalH = headlineBlockH + GAP + DATE_FS + PAD_Y * 2;

  const x = canvasW * 0.05;
  const y = canvasH - totalH - canvasH * 0.07;

  // Headline rect
  ctx.fillStyle = '#000';
  ctx.fillRect(x - PAD_X, y - PAD_Y, maxWidth + PAD_X * 2, headlineBlockH + PAD_Y * 2);

  // Headline text
  ctx.fillStyle = '#fff';
  lines.forEach((line, i) => {
    ctx.font = `400 ${FS}px 'Courier New', Courier, monospace`;
    ctx.fillText(line, x, y + FS + i * LINE_H);
  });

  // Date rect
  ctx.font = `400 ${DATE_FS}px 'Courier New', Courier, monospace`;
  const dateW = ctx.measureText(dateStr).width + PAD_X * 2;
  ctx.fillStyle = '#000';
  ctx.fillRect(x - PAD_X, y + headlineBlockH + PAD_Y * 2, dateW, DATE_FS + PAD_Y * 2);

  // Date text
  ctx.fillStyle = '#fff';
  ctx.fillText(dateStr, x, y + headlineBlockH + PAD_Y * 2 + PAD_Y + DATE_FS);

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
  const [cameraError, setCameraError] = useState(null);

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
    setCameraError(null);
    try {
      // Prøv både kamera og mikrofon; fald tilbage til kun kamera hvis mikrofon nægtes
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1920 } },
          audio: true,
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1920 } },
          audio: false,
        });
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch (e) {
      setCameraError(e);
      console.error('MilestoneCamera: kunne ikke starte kamera:', e.message);
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
    sendMilestoneNotification();
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

  const sendMilestoneNotification = async () => {
    try {
      const { base44 } = await import('@/api/base44Client');
      await base44.functions.invoke('sendMilestoneNotification', { milestone_id: frame.id });
    } catch (e) {
      // Silent – notification is a bonus, not critical
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} className="hidden" />

      {/* File input — altid tilgængelig så galleri virker selv ved kamerafejl */}
      <input ref={fileInputRef} type="file" accept="image/*" capture={false} className="hidden" onChange={handleFileUpload} />

      {/* ── CAMERA MODE ── */}
      {mode === 'camera' && (
        <div className="relative h-full flex flex-col">
          {cameraError ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <AlertCircle className="w-12 h-12 text-white/60 mb-4" />
              <p className="text-white font-semibold text-lg mb-2">Kameraet er ikke tilgængeligt</p>
              <p className="text-white/60 text-sm mb-8">Giv appen adgang til kameraet i dine indstillinger, eller vælg et billede fra dit galleri.</p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={() => startCamera()}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                >
                  <Camera className="w-4 h-4" /> Prøv igen
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <ImageIcon className="w-4 h-4" /> Vælg fra galleri
                </button>
                <button
                  onClick={onClose}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white/60"
                >
                  Luk
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />

              {/* Live sticker overlay */}
              <div className="absolute bottom-28 left-5 pointer-events-none">
                <TypeSticker headline={cleanHeadline} date={dateStr} size={200} />
              </div>

              {/* Top bar — luk + label + galleri & vend kamera */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-14 pb-4 safe-top">
                <button onClick={onClose} aria-label="Luk" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <X className="w-5 h-5 text-white" />
                </button>
                <p className="text-white font-semibold text-sm px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>{frame.label}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => fileInputRef.current?.click()} aria-label="Galleri" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <ImageIcon className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={flipCamera} aria-label="Vend kamera" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <SwitchCamera className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Shutter — kun centreret udløser, overlay-tekst holdes fri */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-16 safe-bottom">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
                  style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                >
                  <div className="w-14 h-14 rounded-full bg-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── PREVIEW MODE ── */}
      {mode === 'preview' && capturedImage && (
        <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-14 pb-3 safe-top">
            <button onClick={retake} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <X className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
            </button>
            <p className="font-display text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>{frame.label}</p>
            <div className="w-10" />
          </div>

          {/* Billede i blød ramme */}
          <div className="flex-1 flex items-center justify-center px-5 min-h-0">
            <img
              src={capturedImage}
              alt="Milepæl"
              className="rounded-3xl object-cover"
              style={{ maxHeight: '52vh', maxWidth: 440, border: '6px solid var(--color-bg-card)', boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
            />
          </div>

          {/* Dele-panel i appens palet */}
          <div
            className="px-5 pb-10 pt-5 safe-bottom"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              boxShadow: '0 -10px 30px rgba(0,0,0,0.08)',
            }}
          >
            {/* Primære handlinger — ensartet række */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={retake}
                className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-medium"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                <RotateCcw className="w-5 h-5" />
                Prøv igen
              </button>
              <button
                onClick={downloadImage}
                className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-medium"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                <Download className="w-5 h-5" />
                Gem
              </button>
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                <Share2 className="w-5 h-5" />
                Del
              </button>
            </div>

            {/* Sociale dele-knapper — uniforme neutrale kort */}
            {showShareMenu && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Del på
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  <button
                    onClick={shareOnFacebook}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  >
                    <Facebook className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Facebook</span>
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  >
                    <Twitter className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Twitter</span>
                  </button>
                  <button
                    onClick={shareOnWhatsApp}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  >
                    <MessageCircle className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>WhatsApp</span>
                  </button>
                  <button
                    onClick={shareOnEmail}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg-subtle)' }}
                  >
                    <Mail className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}