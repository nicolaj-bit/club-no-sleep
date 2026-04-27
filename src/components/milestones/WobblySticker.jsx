/**
 * WobblySticker — SVG sticker matching the reference image:
 * - Warm beige filled circle
 * - Hand-drawn wobbly double ring (inner filled + outer stroke)
 * - Handwriting font (Patrick Hand) for text
 * - Headline text + date below
 */

import React from 'react';

// Fixed wobbly offsets so the shape is always the same (not random on re-render)
// Generated offline: sin/cos jitter pattern
function buildWobblePath(cx, cy, r, seed, points = 40) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    // Deterministic jitter based on seed + angle
    const jitter =
      (Math.sin(angle * 3 + seed) * 0.055 +
        Math.cos(angle * 5 + seed * 1.7) * 0.035 +
        Math.sin(angle * 7 + seed * 0.9) * 0.02) *
      r;
    pts.push([cx + (r + jitter) * Math.cos(angle), cy + (r + jitter) * Math.sin(angle)]);
  }
  // Smooth closed path via midpoints
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
    if (i === 0) d += `M ${mid[0]} ${mid[1]}`;
    else d += ` Q ${curr[0]} ${curr[1]} ${mid[0]} ${mid[1]}`;
  }
  // Close back to first midpoint
  const first = pts[0];
  const last = pts[pts.length - 1];
  const firstMid = [(first[0] + last[0]) / 2, (first[1] + last[1]) / 2];
  d += ` Q ${first[0]} ${first[1]} ${firstMid[0]} ${firstMid[1]} Z`;
  return d;
}

// Word-wrap text into lines given a max char width estimate
function wrapText(text, maxCharsPerLine) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function WobblySticker({ headline, date, size = 140 }) {
  const S = size;
  const cx = S / 2;
  const cy = S / 2;

  // The outer ring is NOT filled — just a stroke
  // The inner circle IS filled with beige
  const outerR = S * 0.44;
  const innerR = S * 0.365;

  const strokeColor = '#8B6650';
  const fillColor = '#D4B49A';
  const textColor = '#6B4430';

  const cleanHeadline = headline
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .trim();

  // Font sizes
  const headlineFontSize = S * 0.118;
  const dateFontSize = S * 0.093;
  const lineHeight = headlineFontSize * 1.28;

  // Estimate chars per line based on circle inner width
  const approxCharsPerLine = Math.floor((innerR * 1.6) / (headlineFontSize * 0.52));
  const lines = wrapText(cleanHeadline, approxCharsPerLine);

  // Vertical centering: total block height = lines * lineH + gap + dateFontSize
  const gap = S * 0.04;
  const blockHeight = lines.length * lineHeight + gap + dateFontSize;
  const blockStartY = cy - blockHeight / 2 + headlineFontSize * 0.72;

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');`}</style>
      </defs>

      {/* Filled inner wobbly circle */}
      <path d={buildWobblePath(cx, cy, innerR, 2.1)} fill={fillColor} />

      {/* Inner ring stroke */}
      <path
        d={buildWobblePath(cx, cy, innerR, 2.1)}
        fill="none"
        stroke={strokeColor}
        strokeWidth={S * 0.013}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Outer ring stroke only */}
      <path
        d={buildWobblePath(cx, cy, outerR, 0.7)}
        fill="none"
        stroke={strokeColor}
        strokeWidth={S * 0.011}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Headline lines */}
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={blockStartY + i * lineHeight}
          textAnchor="middle"
          fontFamily="'Patrick Hand', cursive"
          fontSize={headlineFontSize}
          fill={textColor}
          style={{ fontFamily: "'Patrick Hand', cursive" }}
        >
          {line}
        </text>
      ))}

      {/* Date */}
      <text
        x={cx}
        y={blockStartY + lines.length * lineHeight + gap + dateFontSize * 0.1}
        textAnchor="middle"
        fontFamily="'Patrick Hand', cursive"
        fontSize={dateFontSize}
        fill={textColor}
        style={{ fontFamily: "'Patrick Hand', cursive" }}
      >
        {date}.
      </text>
    </svg>
  );
}