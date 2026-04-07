import React from 'react';

// Præcise hex-farver matchet til lalatoto.dk's farvepalette
// Baseret på de faktiske produktfarver set på webshoppen
const COLOR_MAP = {
  // ── Enkeltfarver ──
  'fløjl':       { hex: '#B5A090', label: 'Fløjl' },        // varm beige/taupe – den lyseste
  'støvet blå':  { hex: '#7C8F96', label: 'Støvet blå' },   // blågrå støvet tone
  'kakao':       { hex: '#5A3A25', label: 'Kakao' },         // mørk chokoladebrun
  'sart rosa':   { hex: '#D9B8AC', label: 'Sart rosa' },     // dæmpet rosa/pudder
  'karry':       { hex: '#B8862A', label: 'Karry' },         // varm gylden karry

  // ── Kombinerede farver (split swatch) ──
  'støvet blå / kakao':  { split: ['#7C8F96', '#5A3A25'] },
  'sart rosa / karry':   { split: ['#D9B8AC', '#B8862A'] },
  'sart rosa - karry':   { split: ['#D9B8AC', '#B8862A'] },
  'støvet blå - kakao':  { split: ['#7C8F96', '#5A3A25'] },
  'sart rosa / kakao':   { split: ['#D9B8AC', '#5A3A25'] },
  'fløjl / kakao':       { split: ['#B5A090', '#5A3A25'] },

  // ── Engelske navne ──
  'velvet':      { hex: '#B5A090', label: 'Velvet' },
  'dusty blue':  { hex: '#7C8F96', label: 'Dusty blue' },
  'cocoa':       { hex: '#5A3A25', label: 'Cocoa' },
  'soft pink':   { hex: '#D9B8AC', label: 'Soft pink' },
  'curry':       { hex: '#B8862A', label: 'Curry' },
  'dusty blue / cocoa':  { split: ['#7C8F96', '#5A3A25'] },
  'soft pink / curry':   { split: ['#D9B8AC', '#B8862A'] },

  // ── Øvrige generiske farver ──
  'hvid':  { hex: '#F0EBE3' },
  'white': { hex: '#F0EBE3' },
  'grå':   { hex: '#9CA3AF' },
  'grey':  { hex: '#9CA3AF' },
  'sort':  { hex: '#1C1C1E' },
  'black': { hex: '#1C1C1E' },
  'natur': { hex: '#D4C4A8' },
  'sand':  { hex: '#D4C4A8' },
};

function SplitSwatch({ colors, size = 36 }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', borderRadius: '50%', overflow: 'hidden' }}>
      <defs>
        <clipPath id={`circle-${size}`}>
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      {/* Left half */}
      <rect x="0" y="0" width={r} height={size} fill={colors[0]} clipPath={`url(#circle-${size})`} />
      {/* Right half */}
      <rect x={r} y="0" width={r} height={size} fill={colors[1]} clipPath={`url(#circle-${size})`} />
      {/* Divider line */}
      <line x1={r} y1="0" x2={r} y2={size} stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    </svg>
  );
}

export default function VariantSelector({ variants, selectedVariant, onSelect, lang }) {
  return (
    <div>
      {/* Label */}
      <p
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: 'var(--color-text-muted)', letterSpacing: '0.12em' }}
      >
        {lang === 'en' ? 'Your choice' : 'Dit valg'}
        {selectedVariant && (
          <span style={{ color: 'var(--color-text-primary)', marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>
            : {selectedVariant.name}
          </span>
        )}
      </p>

      <div className="flex flex-wrap gap-4">
        {variants.map((variant, i) => {
          const key = variant.name?.toLowerCase().trim();
          const colorDef = COLOR_MAP[key];
          const isSelected = selectedVariant?.name === variant.name;
          const isDisabled = !variant.in_stock;

          if (colorDef) {
            // ── Color swatch ──
            const isCombo = !!colorDef.split;
            return (
              <button
                key={i}
                onClick={() => !isDisabled && onSelect(variant)}
                disabled={isDisabled}
                title={variant.name}
                className="flex flex-col items-center gap-2 transition-all focus:outline-none"
                style={{ opacity: isDisabled ? 0.35 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              >
                {/* Swatch circle */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    position: 'relative',
                    // Selected ring: outer ring via box-shadow
                    boxShadow: isSelected
                      ? '0 0 0 2px #fff, 0 0 0 4px var(--color-primary)'
                      : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                    transition: 'box-shadow 0.15s ease',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {isCombo ? (
                    <SplitSwatch colors={colorDef.split} size={36} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: colorDef.hex }} />
                  )}

                  {/* Diagonal cross for out-of-stock */}
                  {isDisabled && (
                    <svg
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      viewBox="0 0 36 36"
                    >
                      <line x1="6" y1="30" x2="30" y2="6" stroke="rgba(80,40,20,0.45)" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                {/* Variant name */}
                <span
                  style={{
                    fontSize: '10px',
                    lineHeight: 1.3,
                    textAlign: 'center',
                    maxWidth: 52,
                    color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    fontWeight: isSelected ? 500 : 400,
                  }}
                >
                  {variant.name}
                </span>
              </button>
            );
          }

          // ── Text pill fallback (størrelse, mål, etc.) ──
          return (
            <button
              key={i}
              onClick={() => !isDisabled && onSelect(variant)}
              disabled={isDisabled}
              className="px-4 py-2 text-sm border rounded transition-all"
              style={
                isSelected
                  ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)', borderColor: 'var(--color-primary)' }
                  : isDisabled
                    ? { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', opacity: 0.45, cursor: 'not-allowed' }
                    : { backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }
              }
            >
              {variant.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}