import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MessageCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const DENMARK_CENTER = [56.0, 10.5];

// Create a gold pin SVG icon — size scales with zoom
function makePinIcon(size = 22, isMe = false, nightMode = false) {
  const s = size;
  const pinH = s * 1.5;
  const glow = isMe
    ? (nightMode ? '#818cf8' : '#6366f1')
    : (nightMode ? '#FFD700' : '#C9AA8F');
  const inner = isMe
    ? (nightMode ? '#c7d2fe' : '#e0e7ff')
    : (nightMode ? '#FFFDE7' : '#FFF8EE');
  const shadow = isMe ? 'rgba(99,102,241,0.5)' : 'rgba(180,140,80,0.55)';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${pinH}" viewBox="0 0 ${s} ${pinH}">
      <defs>
        <radialGradient id="glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="${inner}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${glow}" stop-opacity="1"/>
        </radialGradient>
        <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="${shadow}" flood-opacity="0.9"/>
        </filter>
        <filter id="glowfilter" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="${s * 0.18}" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Soft glow halo -->
      <ellipse cx="${s/2}" cy="${s/2 * 0.9}" rx="${s * 0.52}" ry="${s * 0.52}" fill="${glow}" opacity="0.22" filter="url(#glowfilter)"/>
      <!-- Pin circle -->
      <circle cx="${s/2}" cy="${s/2 * 0.9}" r="${s * 0.38}" fill="url(#glow)" filter="url(#dropshadow)" stroke="${glow}" stroke-width="${s * 0.07}"/>
      <!-- Inner shine dot -->
      <circle cx="${s/2 - s*0.1}" cy="${s/2 * 0.9 - s*0.1}" r="${s * 0.1}" fill="white" opacity="0.65"/>
      <!-- Pin tail -->
      <path d="M${s/2} ${s * 0.88} L${s/2 - s*0.09} ${pinH * 0.78} L${s/2} ${pinH * 0.97} L${s/2 + s*0.09} ${pinH * 0.78} Z" fill="${glow}" opacity="0.9"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [s, pinH],
    iconAnchor: [s / 2, pinH * 0.97],
    popupAnchor: [0, -pinH * 0.8],
  });
}

function AutoZoom({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 11, { duration: 1.2 });
    } else {
      map.flyTo(DENMARK_CENTER, 6, { duration: 1.2 });
    }
  }, [location?.lat, location?.lng]);
  return null;
}

function ZoomTracker({ onZoom }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });
  useEffect(() => {
    onZoom(map.getZoom());
  }, []);
  return null;
}

export default function DenmarkMap({ users = [], currentUserLocation = null, onStartChat }) {
  const mappedUsers = users.filter(u => u.latitude && u.longitude);
  const [zoom, setZoom] = useState(6);

  const isNightMode = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 5;
  }, []);

  const tileUrl = isNightMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // Pin size scales with zoom: small at zoom 6, bigger zoomed in
  const pinSize = Math.max(8, Math.min(20, (zoom - 5) * 3 + 8));
  const meSize = Math.max(16, Math.min(26, (zoom - 5) * 3 + 16));

  const userIcon = useMemo(() => makePinIcon(pinSize, false, isNightMode), [pinSize, isNightMode]);
  // "Mig"-ikonet er altid mindst 20px så det aldrig forsvinder
  const myPinSize = Math.max(20, meSize);
  const meIcon = useMemo(() => makePinIcon(myPinSize, true, isNightMode), [myPinSize, isNightMode]);

  return (
    <div style={{ height: 300, position: 'relative', zIndex: 0 }}>
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,0.13) !important; border-radius: 10px !important; overflow: hidden; }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out { width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 18px !important; color: var(--color-text-primary) !important; background: var(--color-bg-card) !important; border: none !important; }
        .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover { background: var(--color-bg-subtle) !important; }
        .leaflet-bottom.leaflet-right { bottom: 12px; right: 12px; }
      `}</style>
      <MapContainer
        center={DENMARK_CENTER}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <AutoZoom location={currentUserLocation} />
        <ZoomTracker onZoom={setZoom} />

        {mappedUsers.map((u, i) => (
          <Marker
            key={u.id || i}
            position={[u.latitude, u.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="p-3 flex flex-col items-center gap-2" style={{ minWidth: 140 }}>
                {u.profile_image ? (
                  <img src={u.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ background: 'var(--color-accent-warm)', color: 'var(--color-primary)' }}>
                    {(u.display_name || u.username || '?')[0].toUpperCase()}
                  </div>
                )}
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {u.display_name || u.username || 'Anonym'}
                </p>
                {u.city && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.city}</p>}
                {onStartChat && (
                  <button
                    onClick={() => onStartChat(u)}
                    className="mt-1 flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Start chat
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {currentUserLocation && (
          <Marker
            position={[currentUserLocation.lat, currentUserLocation.lng]}
            icon={meIcon}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="p-3 text-center text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Det er dig 👋
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}