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

  // Draw frame overlay on canvas
  const drawFrame = (ctx, w, h) => {
    const pad = w * 0.04;
    const cornerLen = w * 0.08;
    const lw = w * 0.012;

    ctx.strokeStyle = frame.accentColor;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';

    // Corners
    const corners = [
      [[pad, pad + cornerLen], [pad, pad], [pad + cornerLen, pad]],
      [[w - pad - cornerLen, pad], [w - pad, pad], [w - pad, pad + cornerLen]],
      [[pad, h - pad - cornerLen], [pad, h - pad], [pad + cornerLen, h - pad]],
      [[w - pad - cornerLen, h - pad], [w - pad, h - pad], [w - pad, h - pad - cornerLen]],
    ];
    corners.forEach(([a, b, c]) => {
      ctx.beginPath();
      ctx.moveTo(...a);
      ctx.lineTo(...b);
      ctx.lineTo(...c);
      ctx.stroke();
    });

    // Bottom text banner
    const bannerH = h * 0.22;
    const grad = ctx.createLinearGradient(0, h - bannerH, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - bannerH, w, bannerH);

    // Emoji
    ctx.font = `${w * 0.1}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(frame.emoji, w / 2, h - bannerH + w * 0.12);

    // Headline
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${w * 0.065}px 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText(frame.headline, w / 2, h - h * 0.09);

    // Subline
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `${w * 0.038}px 'Inter', sans-serif`;
    ctx.fillText(frame.subline, w / 2, h - h * 0.045);
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

          {/* Frame preview */}
          <div className="flex-1 flex items-center justify-center px-8">
            <div
              className="w-full rounded-3xl flex flex-col items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: frame.bgColor, aspectRatio: '1 / 1', maxWidth: 360 }}
            >
              <div className="text-8xl mb-2">{frame.emoji}</div>
              {/* Corner decorations */}
              {['top-3 left-3 border-l-2 border-t-2', 'top-3 right-3 border-r-2 border-t-2',
                'bottom-3 left-3 border-l-2 border-b-2', 'bottom-3 right-3 border-r-2 border-b-2'].map((cls, i) => (
                <div key={i} className={`absolute w-6 h-6 rounded ${cls}`} style={{ borderColor: frame.accentColor }} />
              ))}
              <p className="text-xl font-bold mt-2" style={{ color: frame.textColor, fontFamily: 'Cormorant Garamond, serif' }}>
                {frame.headline}
              </p>
              <p className="text-sm" style={{ color: frame.textColor + '99' }}>{frame.subline}</p>
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

          {/* Frame overlay — corner decorations */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative" style={{ width: '90vw', height: '90vw', maxWidth: 420, maxHeight: 420 }}>
              {['top-0 left-0 border-l-4 border-t-4', 'top-0 right-0 border-r-4 border-t-4',
                'bottom-0 left-0 border-l-4 border-b-4', 'bottom-0 right-0 border-r-4 border-b-4'].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 rounded ${cls}`} style={{ borderColor: frame.accentColor }} />
              ))}
              {/* Bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-3 pt-6"
                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
                <div className="text-3xl">{frame.emoji}</div>
                <p className="text-white font-bold text-base" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{frame.headline}</p>
                <p className="text-white/70 text-xs">{frame.subline}</p>
              </div>
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