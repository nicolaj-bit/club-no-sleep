import React, { useState } from 'react';
import { CATEGORIES } from './milestonesData';
import { Camera } from 'lucide-react';

export default function MilestoneFramePicker({ frames, selectedFrame, onSelect, onOpen }) {
  const [activeCategory, setActiveCategory] = useState('Alle');

  const filtered = activeCategory === 'Alle'
    ? frames
    : frames.filter(f => f.category === activeCategory);

  return (
    <div className="px-5 pt-4">
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
          const cornerSize = 14;
          const cornerThickness = 2;
          return (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              className="rounded-2xl overflow-hidden flex flex-col transition-all active:scale-95"
              style={{
                border: isSelected ? `2px solid ${frame.accentColor}` : '2px solid transparent',
                boxShadow: isSelected ? `0 0 0 2px ${frame.accentColor}50` : 'none',
              }}
            >
              {/* Card area */}
              <div
                className="w-full relative flex items-center justify-center"
                style={{ backgroundColor: '#F5EFE8', aspectRatio: '1 / 1' }}
              >
                {/* Camera corner marks */}
                <div className="absolute top-3 left-3" style={{ width: cornerSize, height: cornerSize, borderLeft: `${cornerThickness}px solid ${frame.accentColor}`, borderTop: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '2px 0 0 0' }} />
                <div className="absolute top-3 right-3" style={{ width: cornerSize, height: cornerSize, borderRight: `${cornerThickness}px solid ${frame.accentColor}`, borderTop: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '0 2px 0 0' }} />
                <div className="absolute bottom-3 left-3" style={{ width: cornerSize, height: cornerSize, borderLeft: `${cornerThickness}px solid ${frame.accentColor}`, borderBottom: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '0 0 0 2px' }} />
                <div className="absolute bottom-3 right-3" style={{ width: cornerSize, height: cornerSize, borderRight: `${cornerThickness}px solid ${frame.accentColor}`, borderBottom: `${cornerThickness}px solid ${frame.accentColor}`, borderRadius: '0 0 2px 0' }} />

                {/* Sticker */}
                <div
                  className="flex flex-col items-center justify-center text-center"
                  style={{
                    width: 110, height: 110,
                    borderRadius: '50%',
                    backgroundColor: '#DCC1B0',
                    border: '2px solid #A0785A',
                    boxShadow: '0 0 0 4px #F5EFE8, 0 0 0 6px #A0785A66',
                    padding: '12px',
                  }}
                >
                  <p style={{
                    color: '#5C3D2E',
                    fontSize: 10,
                    lineHeight: 1.4,
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                  }}>
                    {frame.headline}
                  </p>
                  <p style={{
                    color: '#7A5C4A',
                    fontSize: 9,
                    marginTop: 4,
                    fontFamily: 'Georgia, serif',
                    fontStyle: 'italic',
                  }}>
                    {new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Open camera CTA */}
      <div className="mt-6 mb-4">
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