import React, { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, AttributionControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MessageCircle, Eye } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

// Landenes afgrænsning: south, west, north, east
const COUNTRY_BOUNDS = {
  DK: { south: 54.5, west: 8.0, north: 57.8, east: 15.2 },
  DE: { south: 47.2, west: 5.8, north: 55.1, east: 15.1 },
  SE: { south: 55.3, west: 11.0, north: 69.1, east: 24.2 },
  NO: { south: 57.9, west: 4.5, north: 71.2, east: 31.2 },
  FI: { south: 59.7, west: 20.5, north: 70.1, east: 31.6 },
  NL: { south: 50.7, west: 3.3, north: 53.6, east: 7.2 },
  BE: { south: 49.5, west: 2.5, north: 51.5, east: 6.4 },
  FR: { south: 41.3, west: -5.2, north: 51.1, east: 9.6 },
  ES: { south: 36.0, west: -9.3, north: 43.8, east: 3.3 },
  IT: { south: 36.6, west: 6.6, north: 47.1, east: 18.5 },
  PL: { south: 49.0, west: 14.1, north: 54.9, east: 24.2 },
  AT: { south: 46.4, west: 9.5, north: 49.0, east: 17.2 },
  CH: { south: 45.8, west: 5.9, north: 47.8, east: 10.5 },
  IE: { south: 51.4, west: -10.5, north: 55.4, east: -5.9 },
  GB: { south: 49.9, west: -8.2, north: 58.7, east: 1.8 },
  PT: { south: 36.9, west: -9.5, north: 42.2, east: -6.2 },
  CZ: { south: 48.5, west: 12.1, north: 51.1, east: 18.9 },
};

const TIMEZONE_TO_COUNTRY = {
  'Europe/Copenhagen': 'DK',
  'Europe/Berlin': 'DE',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Helsinki': 'FI',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Warsaw': 'PL',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',
  'Europe/Dublin': 'IE',
  'Europe/London': 'GB',
  'Europe/Lisbon': 'PT',
  'Europe/Prague': 'CZ',
};

const COUNTRY_NAMES = {
  da: { DK: 'Danmark', DE: 'Tyskland', SE: 'Sverige', NO: 'Norge', FI: 'Finland', NL: 'Holland', BE: 'Belgien', FR: 'Frankrig', ES: 'Spanien', IT: 'Italien', PL: 'Polen', AT: 'Østrig', CH: 'Schweiz', IE: 'Irland', GB: 'Storbritannien', PT: 'Portugal', CZ: 'Tjekkiet' },
  en: { DK: 'Denmark', DE: 'Germany', SE: 'Sweden', NO: 'Norway', FI: 'Finland', NL: 'Netherlands', BE: 'Belgium', FR: 'France', ES: 'Spain', IT: 'Italy', PL: 'Poland', AT: 'Austria', CH: 'Switzerland', IE: 'Ireland', GB: 'United Kingdom', PT: 'Portugal', CZ: 'Czechia' },
};

function isInBounds(lat, lng, b) {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

function detectCountry(lat, lng) {
  if (lat != null && lng != null) {
    const matches = Object.entries(COUNTRY_BOUNDS)
      .filter(([, b]) => isInBounds(lat, lng, b))
      .map(([code, b]) => ({ code, area: (b.north - b.south) * (b.east - b.west) }))
      .sort((a, b) => a.area - b.area);
    if (matches.length > 0) return matches[0].code;
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
  } catch {}
  return 'DK';
}

// Esri Canvas tile-sæt — ét sted at rette hvis URL'er ændres
const TILE_LAYERS = {
  light: {
    base: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  },
  dark: {
    base: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  },
};

// Create a gold pin SVG icon — size scales with zoom
function makePinIcon(size = 22, isMe = false, nightMode = false) {
  const s = size;
  const pinH = s * 1.5;
  const glow = isMe
    ? (nightMode ? '#818cf8' : '#6366f1')
    : (nightMode ? '#FFD700' : 'var(--color-brown-light)');
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

function FitCountryBounds({ countryCode }) {
  const map = useMap();
  useEffect(() => {
    const b = COUNTRY_BOUNDS[countryCode];
    if (b) {
      map.fitBounds([[b.south, b.west], [b.north, b.east]], { padding: [30, 30], maxZoom: 8 });
    }
  }, [countryCode]);
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

export default function DenmarkMap({ currentUserLocation = null, onStartChat, isVisible = true, onToggleVisibility }) {
  const [zoom, setZoom] = useState(6);
  const [visibilityOpen, setVisibilityOpen] = useState(false);

  const { isDark } = useTheme();
  const { t, lang } = useLanguage();

  // Markører beholder tidsbaseret nattilstand — rør ikke ved pins
  const isNightMode = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 5;
  }, []);

  const tiles = isDark ? TILE_LAYERS.dark : TILE_LAYERS.light;

  // Pin size scales with zoom: small at zoom 6, bigger zoomed in
  const pinSize = Math.max(8, Math.min(20, (zoom - 5) * 3 + 8));
  const meSize = Math.max(16, Math.min(26, (zoom - 5) * 3 + 16));

  const userIcon = useMemo(() => makePinIcon(pinSize, false, isNightMode), [pinSize, isNightMode]);
  // "Mig"-ikonet er altid mindst 20px så det aldrig forsvinder
  const myPinSize = Math.max(20, meSize);
  const meIcon = useMemo(() => makePinIcon(myPinSize, true, isNightMode), [myPinSize, isNightMode]);

  // Find brugerens land: koordinater først (mindste land ved overlap), ellers tidszone, ellers Danmark
  const countryCode = useMemo(
    () => detectCountry(currentUserLocation?.lat, currentUserLocation?.lng),
    [currentUserLocation?.lat, currentUserLocation?.lng]
  );

  const countryName = COUNTRY_NAMES[lang]?.[countryCode] || COUNTRY_NAMES.da[countryCode] || 'Danmark';

  // Hent lys i brugerens land fra getLightsInCountry — kortets eneste datakilde
  const { data: lightsData } = useQuery({
    queryKey: ['lights', countryCode],
    queryFn: async () => {
      const res = await base44.functions.invoke('getLightsInCountry', { country_code: countryCode });
      return res.data;
    },
  });

  const lights = lightsData?.lights || [];
  const count = lightsData?.count ?? 0;
  const europeCount = lightsData?.europe_count ?? 0;

  const showEuropeLine = count < 5;
  const europeRest = Math.max(0, europeCount - count);

  return (
    <div style={{ height: '100%', position: 'relative', zIndex: 0, backgroundColor: 'var(--color-bg)' }}>
      <style>{`
        .leaflet-container { background: var(--color-bg) !important; }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content { margin: 0; }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-control-zoom { display: flex !important; flex-direction: row !important; border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,0.13) !important; border-radius: 10px !important; overflow: hidden; }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out { width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 18px !important; color: var(--color-text-primary) !important; background: var(--color-bg-card) !important; border: none !important; }
        .leaflet-control-zoom-in { border-right: 1px solid var(--color-border) !important; border-radius: 10px 0 0 10px !important; }
        .leaflet-control-zoom-out { border-radius: 0 10px 10px 0 !important; }
        .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover { background: var(--color-bg-subtle) !important; }
        .leaflet-bottom.leaflet-right { bottom: 16px; right: 16px; }
        .leaflet-control-attribution { background: transparent !important; font-size: 8px !important; padding: 0 4px !important; color: var(--color-text-muted) !important; opacity: 0.55; text-shadow: 0 0 3px rgba(255,253,249,0.8); }
        .leaflet-control-attribution a { color: var(--color-text-muted) !important; }
      `}</style>

      {/* Overlay: antal vågne — øverste venstre hjørne */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1000,
        backgroundColor: 'var(--color-bg-card)',
        color: 'var(--color-text-primary)',
        padding: '8px 12px',
        borderRadius: 12,
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.3,
        pointerEvents: 'none',
      }}>
        {count === 0 ? (
          <p>{t.noOneAwake.replace('{country}', countryName)}</p>
        ) : (
          <p>{t.awakeInCountry.replace('{count}', count).replace('{country}', countryName)}</p>
        )}
        {showEuropeLine && europeRest > 0 && (
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {t.andRestInEurope.replace('{count}', europeRest)}
          </p>
        )}
      </div>

      {/* Overlay: synligheds-ikon — øverste højre hjørne */}
      <button
        onClick={() => setVisibilityOpen(true)}
        aria-label={t.visibility}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Eye className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
      </button>

      <MapContainer
        center={currentUserLocation ? [currentUserLocation.lat, currentUserLocation.lng] : [56.0, 10.5]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer key={`base-${isDark ? 'dark' : 'light'}`} url={tiles.base} attribution="© Esri, HERE, Garmin" />
        <TileLayer key={`labels-${isDark ? 'dark' : 'light'}`} url={tiles.labels} />
        <AttributionControl prefix={false} position="bottomright" />
        <FitCountryBounds countryCode={countryCode} />
        <ZoomTracker onZoom={setZoom} />

        {lights.map((u, i) => (
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
                  {u.display_name || u.username || t.anonymous}
                </p>
                {u.city && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.city}</p>}
                {onStartChat && (
                  <button
                    onClick={() => onStartChat(u)}
                    className="mt-1 flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t.startChat}
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
                {t.thatsYou}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Synligheds-dialog — åbnes fra ikonet på kortet */}
      <Dialog open={visibilityOpen} onOpenChange={setVisibilityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--color-text-primary)' }}>{t.visibility}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.showMeVisible}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.visibilityCardDesc}</p>
            </div>
            <Switch
              checked={isVisible}
              onCheckedChange={(checked) => onToggleVisibility?.(checked)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}