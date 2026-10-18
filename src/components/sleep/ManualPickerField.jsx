import React from 'react';

const fieldStyle = {
  backgroundColor: 'var(--color-bg-card)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text-primary)',
  WebkitAppearance: 'none',
  appearance: 'none',
  minHeight: '46px',
};

// Label over feltet + pladsholder oven på tomme dato-/tidsfelter (iOS tegner dem blanke).
export default function ManualPickerField({ label, type, value, onChange, placeholder, max, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          max={max}
          onChange={onChange}
          className="w-full rounded-xl px-3 py-2.5 border text-base"
          style={fieldStyle}
        />
        {!value && (
          <span
            className="absolute inset-0 flex items-center px-3 text-base pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}