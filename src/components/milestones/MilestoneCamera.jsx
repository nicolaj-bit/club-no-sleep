import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ImageIcon, Download, Share2, RotateCcw, X, SwitchCamera, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import TypeSticker from './TypeSticker';
import { useLanguage } from '@/components/ui/LanguageContext';

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
  ctx.save();

  // Skalér mærkatet efter billedets KORTESTE led (ikke bredde/højde blandet), så det
  // fylder lige meget på et højkant- som på et tværformat-billede. Mindst 4% margin.
  const base = Math.min(canvasW, canvasH);
  const MARGIN = base * 0.04;

  // Blød mørk forløbning over nederste del af billedet — teksten ligger på billedet, ikke i en boks
  const gradHeight = Math.min(canvasH * 0.35, base * 0.55);
  const gradY = canvasH - gradHeight;
  const gradient = ctx.createLinearGradient(0, gradY, 0, canvasH);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradY, canvasW, gradHeight);

  const PAD_X = MARGIN;
  const maxWidth = canvasW - PAD_X * 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Auto-fit headline i Cormorant Garamond, max 2 linjer
  let headlineFs = base * 0.09;
  let lines;
  for (let fs = headlineFs; fs >= base * 0.045; fs -= base * 0.004) {
    ctx.font = `500 ${fs}px 'Cormorant Garamond', serif`;
    lines = wrapTextCanvas(ctx, headline, maxWidth);
    if (lines.length <= 2) { headlineFs = fs; break; }
  }

  let dateFs = base * 0.042;
  let lineH = headlineFs * 1.15;
  let dateGap = base * 0.02;

  // Sikrer at hele tekstblokken altid holder sig inden for billedet lodret —
  // skalerer ned hvis den ellers ville blive skubbet uden for kanten (beskæring).
  const totalBlockH = lines.length * lineH + dateGap + dateFs;
  const availableH = canvasH - MARGIN * 2;
  if (totalBlockH > availableH) {
    const shrink = availableH / totalBlockH;
    headlineFs *= shrink;
    dateFs *= shrink;
    lineH = headlineFs * 1.15;
    dateGap *= shrink;
  }

  let y = canvasH - MARGIN - dateFs - dateGap - (lines.length - 1) * lineH;

  ctx.fillStyle = '#FFFFFF';
  lines.forEach((line) => {
    ctx.font = `500 ${headlineFs}px 'Cormorant Garamond', serif`;
    ctx.fillText(line, PAD_X, y);
    y += lineH;
  });

  ctx.font = `400 ${dateFs}px 'Inter', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText(dateStr, PAD_X, y + dateGap + dateFs * 0.75);

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MilestoneCamera({ frame, onClose }) {
  const { t, lang } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState('camera');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const TODAY_STR = new Date().toLocaleDateString(lang === 'da' ? 'da-DK' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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

  const MAX_WIDTH = 1600;

  const renderPhoto = async (drawSource) => {
    await loadFont();
    const canvas = canvasRef.current;
    drawSource(canvas);
    drawStickerOnCanvas(canvas.getContext('2d'), canvas.width, canvas.height, cleanHeadline, dateStr);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    setMode('preview');
    sendMilestoneNotification();
  };

  // Beholder billedets eget format — ingen kvadratisk beskæring. Nedskalerer kun
  // via bredden (aldrig bredde+højde samtidig), så højden følger proportionalt med.
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !canvasRef.current) return;
    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    const w = Math.min(srcW, MAX_WIDTH);
    const h = Math.round(w * (srcH / srcW));
    canvasRef.current.width = w;
    canvasRef.current.height = h;
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(video, 0, 0, srcW, srcH, 0, 0, w, h);
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
        const w = Math.min(img.width, MAX_WIDTH);
        const h = Math.round(w * (img.height / img.width));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
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
    toast.success(t.milestoneImageSaved);
  };

  // Gem på enhed + gem i Favoritter (kategori 'Milepæle') via backend (RLS-workaround)
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const a = document.createElement('a');
      a.href = capturedImage;
      a.download = `lalatoto-${frame.id}.jpg`;
      a.click();
    } catch (e) { /* enhedsgem er best-effort */ }
    try {
      const { base44 } = await import('@/api/base44Client');
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], `milestone-${frame.id}.jpg`, { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.functions.invoke('createMilestoneFavorite', {
        title: cleanHeadline,
        date: dateStr,
        image_url: file_url,
        frame_id: frame.id,
      });
      toast.success(t.milestoneSavedToFavorites);
    } catch (e) {
      console.error('MilestoneCamera: kunne ikke gemme favorit:', e.message);
      toast.error(t.milestoneSaveFavoriteError);
    } finally {
      setSaving(false);
    }
  };

  // Native dele-menu med billede vedhæftet (Web Share API). Fallback til tekst-deling eller download.
  const handleShare = async () => {
    const shareText = t.milestoneShareText.replace('{headline}', frame.headline);
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], `lalatoto-${frame.id}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: frame.headline, text: shareText });
      } else if (navigator.share) {
        await navigator.share({ title: frame.headline, text: shareText });
      } else {
        downloadImage();
        toast.info(t.milestoneShareNotSupported);
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      console.error('MilestoneCamera: deling fejlede:', e.message);
      toast.error(t.milestoneShareError);
    }
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
              <p className="text-white font-semibold text-lg mb-2">{t.milestoneCameraUnavailable}</p>
              <p className="text-white/60 text-sm mb-8">{t.milestoneCameraPermissionHint}</p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                  onClick={() => startCamera()}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)' }}
                >
                  <Camera className="w-4 h-4" /> {t.milestoneTryAgain}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <ImageIcon className="w-4 h-4" /> {t.milestoneChooseFromGallery}
                </button>
                <button
                  onClick={onClose}
                  className="h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white/60"
                >
                  {t.close}
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
                <button onClick={onClose} aria-label={t.close} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <X className="w-5 h-5 text-white" />
                </button>
                <p className="text-white font-semibold text-sm px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>{frame.label}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => fileInputRef.current?.click()} aria-label={t.ariaGallery} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <ImageIcon className="w-5 h-5 text-white" />
                  </button>
                  <button onClick={flipCamera} aria-label={t.ariaFlipCamera} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
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

          {/* Billedvisning — fylder al plads mellem header og knapper, altid mørk baggrund */}
          <div className="flex-1 min-h-0" style={{ padding: 12, backgroundColor: '#050505' }}>
            <img
              src={capturedImage}
              alt={t.milestoneAltMilestone}
              className="w-full h-full object-contain"
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
                {t.milestoneTryAgain}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                <Download className="w-5 h-5" />
                {saving ? t.saving : t.save}
              </button>
              <button
                onClick={handleShare}
                className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                <Share2 className="w-5 h-5" />
                {t.milestoneShare}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}