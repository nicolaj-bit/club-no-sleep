import React, { useState, useEffect } from 'react';
import { CATEGORIES } from './milestonesData';
import { Camera } from 'lucide-react';

// Load handwriting font
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500&display=swap';
document.head.appendChild(fontLink);

const TODAY = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

// SVG wobbly circle sticker — matches the reference image
function StickerPreview({ frame, size = 130 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const innerR = size * 0.38;

  // Generate a wobbly path from control points
  const wobblePath = (r, seed, points = 32) => {
    const pts = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
      const jitter = (Math.sin(angle * 3 + seed) * 0.06 + Math.cos(angle * 5 + seed * 2) * 0.04) * r;
      pts.push([
        cx + (r + jitter) * Math.cos(angle),
        cy + (r + jitter) * Math.sin(angle),
      ]);
    }
    // Build smooth SVG path using quadratic bezier
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const mid = [(pts[i][0] + pts[i - 1][0]) / 2, (pts[i][1] + pts[i - 1][1]) / 2];
      d += ` Q ${pts[i - 1][0]} ${pts[i - 1][1]} ${mid[0]} ${mid[1]}`;
    }
    d += ' Z';
    return d;
  };

  const cleanText = frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim();
  const fontSize = size * 0.115;
  const dateFontSize = size * 0.09;
  const color = '#6B4C3B';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Filled inner circle */}
      <path d={wobblePath(innerR, 1.2)} fill="#D4B49A" />
      {/* Inner wobbly border */}
      <path d={wobblePath(innerR, 1.2)} fill="none" stroke={color} strokeWidth="1.2" />
      {/* Outer wobbly ring */}
      <path d={wobblePath(outerR, 0.5)} fill="none" stroke={color} strokeWidth="1.2" />

      {/* Headline text — split into lines */}
      <foreignObject x={cx - innerR * 0.85} y={cy - innerR * 0.55} width={innerR * 1.7} height={innerR * 1.1}>
        <div xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: "'Caveat', cursive",
            fontSize: `${fontSize}px`,
            color,
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          {cleanText}
        </div>
      </foreignObject>

      {/* Date text */}
      <text
        x={cx}
        y={cy + innerR * 0.62}
        textAnchor="middle"
        fontFamily="'Caveat', cursive"
        fontSize={dateFontSize}
        fill={color}
      >
        {TODAY}.
      </text>
    </svg>
  );
}

export default function MilestoneFramePicker({ frames, selectedFrame, onSelect, onOpen }) {
  const [activeCategory, setActiveCategory] = useState('Alle');

  const filtered = activeCategory === 'Alle'
    ? frames
    : frames.filter(f => f.category === activeCategory);

  const cornerSize = 14;
  const cornerThickness = 2;

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={activeCategory === cat
              ? { background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }
              : { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {filtered.map(frame => {
          const isSelected = selectedFrame.id === frame.id;
          return (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              className="rounded-2xl overflow-hidden flex flex-col transition-all active:scale-95"
              style={{
                border: isSelected ? `2px solid ${frame.accentColor}` : '2px solid transparent',
                boxShadow: isSelected ? `0 0 0 2px ${frame.accentColor}44` : 'none',
                backgroundColor: 'var(--color-bg-subtle)',
              }}
            >
              {/* Viewfinder area */}
              <div
                className="w-full relative flex items-center justify-center"
                style={{ backgroundColor: '#F5EFE8', aspectRatio: '1 / 1' }}
              >
                {/* Corner marks */}
                <div className="absolute top-3 left-3" style={{ width: cornerSize, height: cornerSize, borderLeft: `${cornerThickness}px solid ${frame.accentColor}`, borderTop: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '2px 0 0 0' }} />
                <div className="absolute top-3 right-3" style={{ width: cornerSize, height: cornerSize, borderRight: `${cornerThickness}px solid ${frame.accentColor}`, borderTop: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '0 2px 0 0' }} />
                <div className="absolute bottom-3 left-3" style={{ width: cornerSize, height: cornerSize, borderLeft: `${cornerThickness}px solid ${frame.accentColor}`, borderBottom: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '0 0 0 2px' }} />
                <div className="absolute bottom-3 right-3" style={{ width: cornerSize, height: cornerSize, borderRight: `${cornerThickness}px solid ${frame.accentColor}`, borderBottom: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '0 0 2px 0' }} />

                {/* Sticker */}
                <StickerPreview frame={frame} size={120} />
              </div>

              {/* Label below */}
              <div
                className="w-full px-3 py-2 text-center"
                style={{ backgroundColor: '#F5EFE8' }}
              >
                <p
                  style={{
                    color: frame.accentColor,
                    fontSize: 12,
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                    fontWeight: 600,
                  }}
                >
                  {frame.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA button */}
      <div className="mt-6">
        <button
          onClick={onOpen}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
        >
          <Camera className="w-5 h-5" />
          Tag milepælsbillede med "{selectedFrame.label}"
        </button>
      </div>
    </div>
  );
}