import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Center of Denmark
const DENMARK_CENTER = [56.0, 10.5];

function SetView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom]);
  return null;
}

export default function DenmarkMap({ users = [], currentUserLocation = null }) {
  const mappedUsers = users.filter(u => u.latitude && u.longitude);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 260 }}>
      <MapContainer
        center={DENMARK_CENTER}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Other active users */}
        {mappedUsers.map((u, i) => (
          <CircleMarker
            key={u.id || i}
            center={[u.latitude, u.longitude]}
            radius={7}
            pathOptions={{
              fillColor: '#22c55e',
              fillOpacity: 0.85,
              color: '#fff',
              weight: 1.5,
            }}
          />
        ))}

        {/* Current user */}
        {currentUserLocation && (
          <CircleMarker
            center={[currentUserLocation.lat, currentUserLocation.lng]}
            radius={9}
            pathOptions={{
              fillColor: '#6366f1',
              fillOpacity: 0.95,
              color: '#fff',
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}