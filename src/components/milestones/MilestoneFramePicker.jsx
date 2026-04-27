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
          return (
            <button
              key={frame.id}
              onClick={() => onSelect(frame)}
              className="rounded-2xl overflow-hidden flex flex-col transition-all active:scale-95"
              style={{
                border: isSelected ? `2.5px solid ${frame.accentColor}` : '2px solid transparent',
                boxShadow: isSelected ? `0 0 0 1px ${frame.accentColor}40` : 'none',
              }}
            >
              {/* Frame preview */}
              <div
                className="w-full relative flex items-center justify-center"
                style={{ backgroundColor: frame.bgColor, aspectRatio: '1 / 1' }}
              >
                <div className="text-5xl mb-1">{frame.emoji}</div>
                {/* Decorative corner accents */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 rounded-tl" style={{ borderColor: frame.accentColor }} />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 rounded-tr" style={{ borderColor: frame.accentColor }} />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 rounded-bl" style={{ borderColor: frame.accentColor }} />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 rounded-br" style={{ borderColor: frame.accentColor }} />
                {/* Headline overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 text-center">
                  <p className="text-xs font-bold leading-tight" style={{ color: frame.textColor, fontFamily: 'Cormorant Garamond, serif' }}>
                    {frame.headline}
                  </p>
                  <p className="text-[10px] leading-tight" style={{ color: frame.textColor + 'AA' }}>
                    {frame.subline}
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