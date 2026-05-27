import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MessageCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const DENMARK_CENTER = [56.0, 10.5];

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

export default function DenmarkMap({ users = [], currentUserLocation = null, onStartChat }) {
  const mappedUsers = users.filter(u => u.latitude && u.longitude);

  const isNightMode = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 20 || hour < 5;
  }, []);

  const tileUrl = isNightMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const goldColor = isNightMode ? '#FFD700' : '#C8A882';
  const goldBorder = isNightMode ? '#FFA500' : '#A0785A';
  const meColor = isNightMode ? '#818cf8' : '#6366f1';

  return (
    <div style={{ height: 300, position: 'relative', zIndex: 0 }}>
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip-container { display: none; }
      `}</style>
      <MapContainer
        center={DENMARK_CENTER}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <AutoZoom location={currentUserLocation} />

        {/* Other active users — gold dots */}
        {mappedUsers.map((u, i) => (
          <CircleMarker
            key={u.id || i}
            center={[u.latitude, u.longitude]}
            radius={7}
            pathOptions={{
              fillColor: goldColor,
              fillOpacity: 1,
              color: goldBorder,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="p-3 flex flex-col items-center gap-2" style={{ minWidth: 140 }}>
                {u.profile_image ? (
                  <img src={u.profile_image} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {(u.username || '?')[0].toUpperCase()}
                  </div>
                )}
                <p className="font-semibold text-slate-800 text-sm">{u.username || 'Anonym'}</p>
                {u.city && <p className="text-xs text-slate-500">{u.city}</p>}
                {onStartChat && (
                  <button
                    onClick={() => onStartChat(u)}
                    className="mt-1 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Start chat
                  </button>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Current user */}
        {currentUserLocation && (
          <CircleMarker
            center={[currentUserLocation.lat, currentUserLocation.lng]}
            radius={10}
            pathOptions={{
              fillColor: meColor,
              fillOpacity: 0.95,
              color: '#fff',
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-3 text-center text-sm font-medium text-slate-700">
                Det er dig 👋
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}