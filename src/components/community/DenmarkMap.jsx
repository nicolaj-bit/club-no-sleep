import React, { useEffect, useRef } from 'react';

// Simple SVG-based Denmark map with dots for active users
// Denmark approximate bounding box: lat 54.5-57.8, lng 8.0-15.2

const DENMARK_BOUNDS = {
  minLat: 54.5,
  maxLat: 57.9,
  minLng: 8.0,
  maxLng: 15.3,
};

function latLngToPercent(lat, lng) {
  const x = ((lng - DENMARK_BOUNDS.minLng) / (DENMARK_BOUNDS.maxLng - DENMARK_BOUNDS.minLng)) * 100;
  const y = ((DENMARK_BOUNDS.maxLat - lat) / (DENMARK_BOUNDS.maxLat - DENMARK_BOUNDS.minLat)) * 100;
  return { x, y };
}

// Simplified Denmark SVG path (outline of Denmark mainland + Jutland)
const DENMARK_PATH = "M 42,8 L 44,5 L 48,4 L 52,6 L 55,10 L 58,8 L 62,9 L 65,14 L 63,20 L 66,24 L 70,26 L 72,32 L 68,38 L 65,42 L 60,48 L 56,52 L 52,58 L 48,64 L 44,68 L 40,72 L 36,74 L 32,72 L 28,68 L 26,62 L 28,56 L 30,50 L 28,44 L 24,40 L 22,34 L 24,28 L 28,22 L 32,16 L 36,12 Z";

export default function DenmarkMap({ users = [], currentUserLocation = null }) {
  const containerRef = useRef(null);

  // Filter users with valid coordinates within Denmark
  const mappedUsers = users.filter(u =>
    u.latitude >= DENMARK_BOUNDS.minLat &&
    u.latitude <= DENMARK_BOUNDS.maxLat &&
    u.longitude >= DENMARK_BOUNDS.minLng &&
    u.longitude <= DENMARK_BOUNDS.maxLng
  );

  const currentUserInBounds = currentUserLocation &&
    currentUserLocation.lat >= DENMARK_BOUNDS.minLat &&
    currentUserLocation.lat <= DENMARK_BOUNDS.maxLat &&
    currentUserLocation.lng >= DENMARK_BOUNDS.minLng &&
    currentUserLocation.lng <= DENMARK_BOUNDS.maxLng;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-100" style={{ background: 'linear-gradient(135deg, #e8f4f8 0%, #d4eaf5 100%)' }}>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">Aktive mødre i Danmark</p>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          {mappedUsers.length + (currentUserInBounds ? 1 : 0)} aktive
        </span>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ height: 220 }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          {/* Ocean background */}
          <rect width="100" height="100" fill="#c8e6f5" />

          {/* Denmark land shape - simplified regions */}
          {/* Jutland (main peninsula) */}
          <path
            d="M 28,20 L 32,15 L 38,12 L 44,14 L 48,18 L 50,24 L 48,30 L 46,36 L 48,42 L 46,50 L 42,58 L 38,64 L 34,68 L 30,66 L 26,60 L 24,52 L 26,44 L 24,36 L 22,28 Z"
            fill="#d4c5a9"
            stroke="#b8a882"
            strokeWidth="0.8"
          />
          {/* Zealand (main island) */}
          <path
            d="M 56,30 L 62,28 L 68,32 L 70,38 L 68,44 L 64,48 L 58,50 L 54,46 L 52,40 L 54,34 Z"
            fill="#d4c5a9"
            stroke="#b8a882"
            strokeWidth="0.8"
          />
          {/* Funen island */}
          <path
            d="M 46,46 L 50,44 L 54,46 L 54,52 L 50,54 L 46,52 Z"
            fill="#d4c5a9"
            stroke="#b8a882"
            strokeWidth="0.8"
          />
          {/* Bornholm */}
          <path
            d="M 82,60 L 85,59 L 87,62 L 85,65 L 82,64 Z"
            fill="#d4c5a9"
            stroke="#b8a882"
            strokeWidth="0.8"
          />

          {/* City dots for reference */}
          {[
            { name: 'København', lat: 55.68, lng: 12.57 },
            { name: 'Aarhus', lat: 56.15, lng: 10.21 },
            { name: 'Odense', lat: 55.40, lng: 10.39 },
            { name: 'Aalborg', lat: 57.05, lng: 9.92 },
          ].map(city => {
            const pos = latLngToPercent(city.lat, city.lng);
            return (
              <circle
                key={city.name}
                cx={pos.x}
                cy={pos.y}
                r="1"
                fill="#9ca3af"
                opacity="0.5"
              />
            );
          })}

          {/* Active user dots */}
          {mappedUsers.map((u, i) => {
            const pos = latLngToPercent(u.latitude, u.longitude);
            return (
              <g key={u.id || i}>
                {/* Glow ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="3.5"
                  fill="#22c55e"
                  opacity="0.2"
                />
                {/* Main dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="2"
                  fill="#22c55e"
                  opacity="0.9"
                />
              </g>
            );
          })}

          {/* Current user dot (blue/purple) */}
          {currentUserInBounds && (() => {
            const pos = latLngToPercent(currentUserLocation.lat, currentUserLocation.lng);
            return (
              <g>
                <circle cx={pos.x} cy={pos.y} r="4" fill="#6366f1" opacity="0.2" />
                <circle cx={pos.x} cy={pos.y} r="2.5" fill="#6366f1" opacity="0.95" />
                <circle cx={pos.x} cy={pos.y} r="1" fill="white" />
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Dig</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span>Andre aktive</span>
        </div>
      </div>
    </div>
  );
}