import React, { useState } from 'react';
import { CATEGORIES } from './milestonesData';
import { Camera } from 'lucide-react';

const TODAY = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

function StickerPreview({ frame, size = 120 }) {
  const innerSize = size * 0.78;
  const gap = (size - innerSize) / 2;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: `1.5px solid ${frame.accentColor}`, borderRadius: '50%' }}
      />
      {/* Inner filled circle */}
      <div
        className="absolute rounded-full flex flex-col items-center justify-center text-center"
        style={{
          width: innerSize,
          height: innerSize,
          backgroundColor: '#DCC1B0',
          border: `1.5px solid ${frame.accentColor}`,
          padding: '10px',
        }}
      >
        <p
          style={{
            color: '#5C3D2E',
            fontSize: size * 0.095,
            lineHeight: 1.35,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            wordBreak: 'break-word',
          }}
        >
          {frame.headline.replace(/[🎉🎂🎈😄🦷👣💬🍼🌙😊🥄🐣🌱🫶💛🤱🧸]/gu, '').trim()}
        </p>
        <p
          style={{
            color: '#7A5C4A',
            fontSize: size * 0.075,
            marginTop: size * 0.03,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          {TODAY}.
        </p>
      </div>
    </div>
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