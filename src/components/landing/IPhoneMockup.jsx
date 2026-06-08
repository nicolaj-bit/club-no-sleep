import React from 'react';

/**
 * Realistic iPhone frame with an iframe screen inside.
 * The iframe is rendered at 390px wide (standard iPhone viewport)
 * and scaled down to fit the phone frame.
 */
export default function IPhoneMockup({ url, imageUrl, width = 220, height = 450, style = {}, frameColor = '#C8A882' }) {
  // Inner screen dimensions (exclude frame border)
  const BORDER = 10;          // frame thickness
  const TOP_BAR = 32;         // space for dynamic island
  const BOTTOM_BAR = 22;      // home indicator area
  const screenW = width - BORDER * 2;
  const screenH = height - BORDER * 2;
  const contentH = screenH - TOP_BAR - BOTTOM_BAR;

  // We render the iframe at 390px wide and scale it to fit screenW
  const NATIVE_W = 390;
  const scale = screenW / NATIVE_W;
  const nativeH = contentH / scale;

  return (
    <div style={{
      width,
      height,
      borderRadius: 40,
      background: `linear-gradient(160deg, ${lighten(frameColor, 20)} 0%, ${frameColor} 60%, ${darken(frameColor, 15)} 100%)`,
      boxShadow: `
        0 0 0 ${BORDER}px ${darken(frameColor, 10)},
        inset 0 2px 4px rgba(255,255,255,0.35),
        0 30px 80px rgba(0,0,0,0.28),
        0 8px 20px rgba(0,0,0,0.15)
      `,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Side buttons — volume */}
      <div style={{ position: 'absolute', left: -3, top: 90, width: 3, height: 28, backgroundColor: darken(frameColor, 20), borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 126, width: 3, height: 28, backgroundColor: darken(frameColor, 20), borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', left: -3, top: 70, width: 3, height: 18, backgroundColor: darken(frameColor, 20), borderRadius: '2px 0 0 2px' }} />
      {/* Side button — power */}
      <div style={{ position: 'absolute', right: -3, top: 110, width: 3, height: 50, backgroundColor: darken(frameColor, 20), borderRadius: '0 2px 2px 0' }} />

      {/* Screen background */}
      <div style={{
        position: 'absolute',
        top: BORDER, left: BORDER, right: BORDER, bottom: BORDER,
        borderRadius: 32,
        backgroundColor: '#FBF6EF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Top bar — Dynamic Island */}
        <div style={{
          height: TOP_BAR,
          backgroundColor: '#FBF6EF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Status bar time left */}
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '0.52rem', fontWeight: 700, color: '#1E140A', fontFamily: 'Inter, sans-serif' }}>9:41</span>
          {/* Dynamic island pill */}
          <div style={{ width: 80, height: 18, backgroundColor: '#0A0A0A', borderRadius: 20, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)' }} />
          {/* Status icons right */}
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4, alignItems: 'center' }}>
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* Screen content — iframe or image */}
         <div style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: '#FBF6EF' }}>
           {imageUrl ? (
             // Static screenshot
             <img
               src={imageUrl}
               alt="Screenshot"
               style={{
                 width: '100%',
                 height: '100%',
                 objectFit: 'cover',
                 display: 'block',
               }}
             />
           ) : (
             // Live iframe
             <iframe
               src={url}
               title={url}
               scrolling="no"
               style={{
                 width: NATIVE_W,
                 height: nativeH,
                 border: 'none',
                 transform: `scale(${scale})`,
                 transformOrigin: 'top left',
                 display: 'block',
                 pointerEvents: 'none',
                 backgroundColor: '#FBF6EF',
               }}
             />
           )}
         </div>

        {/* Home indicator */}
        <div style={{
          height: BOTTOM_BAR,
          backgroundColor: '#FBF6EF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{ width: 100, height: 5, backgroundColor: '#2B1F16', borderRadius: 4, opacity: 0.2 }} />
        </div>
      </div>

      {/* Glass shine overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
        borderRadius: '40px 40px 0 0',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* Tiny SVG status bar icons */
function SignalIcon() {
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
      <rect x="0" y="5" width="2" height="4" rx="0.5" fill="#1E140A"/>
      <rect x="3" y="3" width="2" height="6" rx="0.5" fill="#1E140A"/>
      <rect x="6" y="1.5" width="2" height="7.5" rx="0.5" fill="#1E140A"/>
      <rect x="9" y="0" width="2" height="9" rx="0.5" fill="#1E140A" opacity="0.3"/>
    </svg>
  );
}
function WifiIcon() {
  return (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
      <path d="M6.5 8.5C7 8.5 7.4 8.1 7.4 7.6C7.4 7.1 7 6.7 6.5 6.7C6 6.7 5.6 7.1 5.6 7.6C5.6 8.1 6 8.5 6.5 8.5Z" fill="#1E140A"/>
      <path d="M3.5 5.5C4.5 4.5 5.5 4 6.5 4C7.5 4 8.5 4.5 9.5 5.5" stroke="#1E140A" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M1 3C2.8 1.2 4.5 0.5 6.5 0.5C8.5 0.5 10.2 1.2 12 3" stroke="#1E140A" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function BatteryIcon() {
  return (
    <svg width="16" height="9" viewBox="0 0 16 9" fill="none">
      <rect x="0.5" y="0.5" width="12" height="8" rx="2" stroke="#1E140A" strokeWidth="1"/>
      <rect x="1.5" y="1.5" width="9" height="6" rx="1.2" fill="#1E140A"/>
      <path d="M13.5 3V6C14.3 5.7 14.8 5 14.8 4.5C14.8 4 14.3 3.3 13.5 3Z" fill="#1E140A" opacity="0.5"/>
    </svg>
  );
}

/* Simple color helpers */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 200, g: 168, b: 130 };
}
function lighten(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255,r+amount)},${Math.min(255,g+amount)},${Math.min(255,b+amount)})`;
}
function darken(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0,r-amount)},${Math.max(0,g-amount)},${Math.max(0,b-amount)})`;
}