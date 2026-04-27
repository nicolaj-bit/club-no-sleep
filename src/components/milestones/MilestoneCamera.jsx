import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Download, Share2, RotateCcw, X, SwitchCamera } from 'lucide-react';
import { toast } from 'sonner';

export default function MilestoneCamera({ frame, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState('choose'); // 'choose' | 'camera' | 'preview'
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

  // Draw round sticker overlay on canvas
  const drawFrame = (ctx, w, h) => {
    // Sticker position: bottom-left corner
    const stickerR = w * 0.22;
    const cx = stickerR + w * 0.05;
    const cy = h - stickerR - h * 0.05;

    // Filled circle background — warm sand
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, stickerR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 193, 176, 0.92)'; // cappuccino/sand
    ctx.fill();

    // Rough hand-drawn circle border — draw as multiple slightly offset arcs
    ctx.strokeStyle = '#A0785A';
    ctx.lineWidth = w * 0.008;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Simulate hand-drawn look with a slightly wobbly path
    const wobble = (angle, rad) => {
      const jitter = (Math.sin(angle * 7) * 0.018 + Math.cos(angle * 13) * 0.012) * stickerR;
      return [
        cx + (rad + jitter) * Math.cos(angle),
        cy + (rad + jitter) * Math.sin(angle),
      ];
    };
    const steps = 120;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
      const [px, py] = wobble(angle, stickerR * 0.88);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Second slightly larger wobbly ring for texture
    ctx.lineWidth = w * 0.004;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2 + 0.3;
      const [px, py] = wobble(angle, stickerR * 0.95);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Text inside sticker
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5C3D2E';

    // Line 1: headline (e.g. "Første skridt" or "1 år")
    const fontSize1 = stickerR * 0.32;
    ctx.font = `${fontSize1}px Georgia, serif`;

    // Wrap headline into max 2 lines
    const words = frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim().split(' ');
    const maxWidth = stickerR * 1.3;
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

    const lineH = fontSize1 * 1.25;
    const totalTextH = lines.length * lineH + fontSize1 * 1.4; // + date line
    let startY = cy - totalTextH / 2 + fontSize1;

    lines.forEach((line, i) => {
      ctx.font = `${fontSize1}px Georgia, serif`;
      ctx.fillText(line, cx, startY + i * lineH);
    });

    // Date line
    const today = new Date();
    const dateStr = today.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
    const fontSize2 = stickerR * 0.26;
    ctx.font = `${fontSize2}px Georgia, serif`;
    ctx.fillStyle = '#7A5C4A';
    ctx.fillText(dateStr, cx, startY + lines.length * lineH + fontSize1 * 0.3);

    ctx.restore();
  };

  // Capture from camera
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Crop to square
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    drawFrame(ctx, size, size);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
    setMode('preview');
  };

  // Upload from gallery
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
        drawFrame(ctx, size, size);
        setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
        setMode('preview');
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
    setMode('choose');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} className="hidden" />

      {/* ── CHOOSE MODE ── */}
      {mode === 'choose' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={onClose}>
              <X className="w-6 h-6 text-white" />
            </button>
            <p className="text-white font-semibold text-sm">{frame.label}</p>
            <div className="w-6" />
          </div>

          {/* Sticker preview */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="flex flex-col items-center justify-center rounded-full relative"
              style={{
                width: 220, height: 220,
                backgroundColor: 'rgba(220,193,176,0.95)',
                border: '3px solid #A0785A',
                boxShadow: '0 4px 24px rgba(0,0,0,0.22), inset 0 0 0 6px rgba(160,120,90,0.12)',
                outline: '2px solid rgba(160,120,90,0.3)',
                outlineOffset: '6px',
              }}
            >
              <p className="text-center font-serif text-lg leading-snug px-6" style={{ color: '#5C3D2E' }}>
                {frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim()}
              </p>
              <p className="text-center text-sm mt-2 px-6" style={{ color: '#7A5C4A', fontFamily: 'Georgia, serif' }}>
                {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 pb-12 pt-6 flex flex-col gap-3">
            <button
              onClick={() => setMode('camera')}
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
            >
              <Camera className="w-5 h-5" />
              Åbn kamera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm border"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <Upload className="w-5 h-5" />
              Vælg fra galleri
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
        </div>
      )}

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
          <div className="absolute bottom-28 left-5 pointer-events-none">
            <div
              className="flex flex-col items-center justify-center rounded-full relative"
              style={{
                width: 100, height: 100,
                backgroundColor: 'rgba(220,193,176,0.92)',
                border: '2px solid #A0785A',
                boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
              }}
            >
              <p className="text-center font-serif text-[11px] leading-tight px-2" style={{ color: '#5C3D2E' }}>
                {frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim()}
              </p>
              <p className="text-center text-[9px] mt-0.5 px-2" style={{ color: '#7A5C4A' }}>
                {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
            </div>
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={() => setMode('choose')}>
              <X className="w-6 h-6 text-white drop-shadow" />
            </button>
            <button onClick={flipCamera}>
              <SwitchCamera className="w-6 h-6 text-white drop-shadow" />
            </button>
          </div>

          {/* Shutter */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-16">
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
              style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
            >
              <div className="w-14 h-14 rounded-full bg-white" />
            </button>
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