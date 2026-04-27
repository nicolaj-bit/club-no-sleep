import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Download, Share2, RotateCcw, X, SwitchCamera } from 'lucide-react';
import { toast } from 'sonner';

const TODAY_STR = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

// Inject Caveat font
if (!document.getElementById('caveat-font')) {
  const link = document.createElement('link');
  link.id = 'caveat-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&display=swap';
  document.head.appendChild(link);
}

function wobblePath(cx, cy, r, seed, points = 32) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const jitter = (Math.sin(angle * 3 + seed) * 0.06 + Math.cos(angle * 5 + seed * 2) * 0.04) * r;
    pts.push([cx + (r + jitter) * Math.cos(angle), cy + (r + jitter) * Math.sin(angle)]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const mid = [(pts[i][0] + pts[i-1][0])/2, (pts[i][1] + pts[i-1][1])/2];
    d += ` Q ${pts[i-1][0]} ${pts[i-1][1]} ${mid[0]} ${mid[1]}`;
  }
  return d + ' Z';
}

function LiveSticker({ frame }) {
  const size = 140;
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.38;
  const color = '#6B4C3B';
  const cleanText = frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }}>
      <path d={wobblePath(cx, cy, innerR, 1.2)} fill="#D4B49A" />
      <path d={wobblePath(cx, cy, innerR, 1.2)} fill="none" stroke={color} strokeWidth="1.5" />
      <path d={wobblePath(cx, cy, outerR, 0.5)} fill="none" stroke={color} strokeWidth="1.5" />
      <foreignObject x={cx - innerR * 0.85} y={cy - innerR * 0.6} width={innerR * 1.7} height={innerR * 1.2}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          fontFamily: "'Caveat', cursive",
          fontSize: `${size * 0.12}px`,
          color, lineHeight: 1.4, wordBreak: 'break-word',
        }}>
          {cleanText}
        </div>
      </foreignObject>
      <text x={cx} y={cy + innerR * 0.65} textAnchor="middle" fontFamily="'Caveat', cursive" fontSize={size * 0.09} fill={color}>
        {TODAY_STR}.
      </text>
    </svg>
  );
}

export default function MilestoneCamera({ frame, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState('camera'); // 'camera' | 'preview'
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraReady, setCameraReady] = useState(false);

  // Start camera
  const startCamera = useCallback(async (facing = facingMode) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
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
    if (mode === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode]);

  const flipCamera = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  };

  // Helper: draw wobbly path on canvas
  const drawWobblePath = (ctx, cx, cy, r, seed, points = 32) => {
    const pts = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
      const jitter = (Math.sin(angle * 3 + seed) * 0.06 + Math.cos(angle * 5 + seed * 2) * 0.04) * r;
      pts.push([cx + (r + jitter) * Math.cos(angle), cy + (r + jitter) * Math.sin(angle)]);
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const mid = [(pts[i][0] + pts[i-1][0])/2, (pts[i][1] + pts[i-1][1])/2];
      ctx.quadraticCurveTo(pts[i-1][0], pts[i-1][1], mid[0], mid[1]);
    }
    ctx.closePath();
  };

  // Draw round sticker overlay on canvas
  const drawFrame = (ctx, w, h) => {
    const stickerR = w * 0.22;
    const cx = stickerR + w * 0.06;
    const cy = h - stickerR - h * 0.06;
    const innerR = stickerR * 0.82;
    const color = '#6B4C3B';

    ctx.save();

    // Filled inner circle
    drawWobblePath(ctx, cx, cy, innerR, 1.2);
    ctx.fillStyle = '#D4B49A';
    ctx.fill();

    // Inner border
    drawWobblePath(ctx, cx, cy, innerR, 1.2);
    ctx.strokeStyle = color;
    ctx.lineWidth = w * 0.004;
    ctx.stroke();

    // Outer ring
    drawWobblePath(ctx, cx, cy, stickerR, 0.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = w * 0.004;
    ctx.stroke();

    // Text
    const cleanHeadline = frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim();
    const fontSize1 = innerR * 0.34;
    const fontSize2 = innerR * 0.27;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';

    // Word wrap
    ctx.font = `${fontSize1}px 'Caveat', cursive`;
    const words = cleanHeadline.split(' ');
    const maxWidth = innerR * 1.4;
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word; }
      else current = test;
    }
    if (current) lines.push(current);

    const lineH = fontSize1 * 1.35;
    const dateStr = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
    const totalH = lines.length * lineH + fontSize2 * 1.5;
    let startY = cy - totalH / 2 + fontSize1 * 0.85;

    lines.forEach((line, i) => {
      ctx.font = `${fontSize1}px 'Caveat', cursive`;
      ctx.fillText(line, cx, startY + i * lineH);
    });

    ctx.font = `${fontSize2}px 'Caveat', cursive`;
    ctx.fillText(dateStr, cx, startY + lines.length * lineH + fontSize2 * 0.4);

    ctx.restore();
  };

  const renderToCanvas = async (drawFn) => {
    await document.fonts.load("400 20px 'Caveat'");
    drawFn();
  };

  // Capture from camera
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    renderToCanvas(() => {
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
      drawFrame(ctx, size, size);
      setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
      setMode('preview');
    });
  };

  // Upload from gallery
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        renderToCanvas(() => {
          const canvas = canvasRef.current;
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
          drawFrame(ctx, size, size);
          setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
          setMode('preview');
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Download
  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `lalatoto-${frame.id}.jpg`;
    a.click();
    toast.success('Billede gemt! 🎉');
  };

  // Share
  const shareImage = async () => {
    if (!navigator.share) {
      downloadImage();
      return;
    }
    const res = await fetch(capturedImage);
    const blob = await res.blob();
    const file = new File([blob], `lalatoto-${frame.id}.jpg`, { type: 'image/jpeg' });
    await navigator.share({ files: [file], title: frame.headline, text: frame.subline });
  };

  const retake = () => {
    setCapturedImage(null);
    setMode('camera');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} className="hidden" />

      {/* ── CAMERA MODE ── */}
      {mode === 'camera' && (
        <div className="relative h-full flex flex-col">
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Sticker preview overlay — bottom left */}
          <div className="absolute bottom-28 left-5 pointer-events-none drop-shadow-lg">
            <LiveSticker frame={frame} />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={onClose}>
              <X className="w-6 h-6 text-white drop-shadow" />
            </button>
            <p className="text-white font-semibold text-sm drop-shadow">{frame.label}</p>
            <button onClick={flipCamera}>
              <SwitchCamera className="w-6 h-6 text-white drop-shadow" />
            </button>
          </div>

          {/* Shutter + gallery */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-10 pb-16">
            {/* Gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center active:opacity-70"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Upload className="w-5 h-5 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            {/* Shutter */}
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>

            {/* Spacer to balance layout */}
            <div className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* ── PREVIEW MODE ── */}
      {mode === 'preview' && capturedImage && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={retake}>
              <X className="w-6 h-6 text-white" />
            </button>
            <p className="text-white font-semibold text-sm">{frame.label}</p>
            <div className="w-6" />
          </div>

          <div className="flex-1 flex items-center justify-center px-4">
            <img
              src={capturedImage}
              alt="Milepæl"
              className="w-full rounded-3xl object-cover"
              style={{ maxHeight: '65vh', maxWidth: 480 }}
            />
          </div>

          <div className="px-6 pb-12 pt-6 flex gap-3">
            <button
              onClick={retake}
              className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold border"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <RotateCcw className="w-4 h-4" />
              Prøv igen
            </button>
            <button
              onClick={downloadImage}
              className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ backgroundColor: '#FFFFFF', color: '#2B1F16' }}
            >
              <Download className="w-4 h-4" />
              Gem
            </button>
            <button
              onClick={shareImage}
              className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
            >
              <Share2 className="w-4 h-4" />
              Del
            </button>
          </div>
        </div>
      )}
    </div>
  );
}