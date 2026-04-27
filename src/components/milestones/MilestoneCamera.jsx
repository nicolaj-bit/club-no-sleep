import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Download, Share2, RotateCcw, X, SwitchCamera } from 'lucide-react';
import { toast } from 'sonner';

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

  // Draw round sticker overlay on canvas
  const drawFrame = (ctx, w, h) => {
    const stickerR = w * 0.22;
    const cx = stickerR + w * 0.05;
    const cy = h - stickerR - h * 0.05;

    ctx.save();

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, stickerR, 0, Math.PI * 2);
    ctx.strokeStyle = '#A0785A';
    ctx.lineWidth = w * 0.005;
    ctx.stroke();

    // Inner filled circle
    const innerR = stickerR * 0.82;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 193, 176, 0.95)';
    ctx.fill();

    // Inner ring border
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = '#A0785A';
    ctx.lineWidth = w * 0.004;
    ctx.stroke();

    // Headline text — italic Georgia
    const cleanHeadline = frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim();
    const fontSize1 = innerR * 0.32;
    ctx.font = `italic ${fontSize1}px Georgia, serif`;
    ctx.fillStyle = '#5C3D2E';
    ctx.textAlign = 'center';

    // Word wrap
    const words = cleanHeadline.split(' ');
    const maxWidth = innerR * 1.3;
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

    const lineH = fontSize1 * 1.4;
    const fontSize2 = innerR * 0.26;
    const totalH = lines.length * lineH + fontSize2 * 1.6;
    let startY = cy - totalH / 2 + fontSize1;

    lines.forEach((line, i) => {
      ctx.font = `italic ${fontSize1}px Georgia, serif`;
      ctx.fillStyle = '#5C3D2E';
      ctx.fillText(line, cx, startY + i * lineH);
    });

    // Date
    const dateStr = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
    ctx.font = `italic ${fontSize2}px Georgia, serif`;
    ctx.fillStyle = '#7A5C4A';
    ctx.fillText(dateStr, cx, startY + lines.length * lineH + fontSize2 * 0.5);

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
          <div className="absolute bottom-28 left-5 pointer-events-none">
            <div className="relative flex items-center justify-center" style={{ width: 110, height: 110 }}>
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full" style={{ border: '1.5px solid #A0785A', borderRadius: '50%' }} />
              {/* Inner filled circle */}
              <div
                className="absolute rounded-full flex flex-col items-center justify-center text-center"
                style={{ inset: 8, backgroundColor: '#DCC1B0', border: '1.5px solid #A0785A' }}
              >
                <p style={{ color: '#5C3D2E', fontSize: 10, lineHeight: 1.4, fontFamily: 'Georgia, serif', fontStyle: 'italic', padding: '0 8px' }}>
                  {frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim()}
                </p>
                <p style={{ color: '#7A5C4A', fontSize: 9, marginTop: 3, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </p>
              </div>
            </div>
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