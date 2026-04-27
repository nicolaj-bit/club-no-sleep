/**
 * WobblySticker — SVG sticker matching the reference image:
 * Organic, hand-drawn style with simple wobbly double ring
 */

import React from 'react';

function buildWobblePath(cx, cy, r, seed, points = 40) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const jitter =
      (Math.sin(angle * 3 + seed) * 0.055 +
        Math.cos(angle * 5 + seed * 1.7) * 0.035 +
        Math.sin(angle * 7 + seed * 0.9) * 0.02) *
      r;
    pts.push([cx + (r + jitter) * Math.cos(angle), cy + (r + jitter) * Math.sin(angle)]);
  }
  return pts;
}

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

  const outerR = S * 0.44;
  const innerR = S * 0.365;

  const strokeColor = '#9B8370';
  const fillColor = '#D4B49A';
  const textColor = '#6B5544';

  const cleanHeadline = headline
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .trim();

  const headlineFontSize = S * 0.12;
  const dateFontSize = S * 0.095;
  const lineHeight = headlineFontSize * 1.35;

  const approxCharsPerLine = Math.floor((innerR * 1.6) / (headlineFontSize * 0.52));
  const lines = wrapText(cleanHeadline, approxCharsPerLine);

  const gap = S * 0.03;
  const blockHeight = lines.length * lineHeight + gap + dateFontSize;
  const blockStartY = cy - blockHeight / 2 + headlineFontSize * 0.75;

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');`}</style>
      </defs>

      {/* Filled inner wobbly circle */}
      <path
        d={(() => {
          const pts = buildWobblePoints(cx, cy, innerR, 2.1);
          let d = '';
          for (let i = 0; i < pts.length; i++) {
            const curr = pts[i];
            const next = pts[(i + 1) % pts.length];
            const mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
            if (i === 0) d += `M ${mid[0]} ${mid[1]}`;
            else d += ` Q ${curr[0]} ${curr[1]} ${mid[0]} ${mid[1]}`;
          }
          const first = pts[0];
          const last = pts[pts.length - 1];
          d += ` Q ${first[0]} ${first[1]} ${(first[0] + last[0]) / 2} ${(first[1] + last[1]) / 2} Z`;
          return d;
        })()}
        fill={fillColor}
      />

      {/* Inner ring stroke */}
      <path
        d={(() => {
          const pts = buildWobblePoints(cx, cy, innerR, 2.1);
          let d = '';
          for (let i = 0; i < pts.length; i++) {
            const curr = pts[i];
            const next = pts[(i + 1) % pts.length];
            const mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
            if (i === 0) d += `M ${mid[0]} ${mid[1]}`;
            else d += ` Q ${curr[0]} ${curr[1]} ${mid[0]} ${mid[1]}`;
          }
          const first = pts[0];
          const last = pts[pts.length - 1];
          d += ` Q ${first[0]} ${first[1]} ${(first[0] + last[0]) / 2} ${(first[1] + last[1]) / 2} Z`;
          return d;
        })()}
        fill="none"
        stroke={strokeColor}
        strokeWidth={S * 0.014}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Outer ring stroke only */}
      <path
        d={(() => {
          const pts = buildWobblePoints(cx, cy, outerR, 0.7);
          let d = '';
          for (let i = 0; i < pts.length; i++) {
            const curr = pts[i];
            const next = pts[(i + 1) % pts.length];
            const mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
            if (i === 0) d += `M ${mid[0]} ${mid[1]}`;
            else d += ` Q ${curr[0]} ${curr[1]} ${mid[0]} ${mid[1]}`;
          }
          const first = pts[0];
          const last = pts[pts.length - 1];
          d += ` Q ${first[0]} ${first[1]} ${(first[0] + last[0]) / 2} ${(first[1] + last[1]) / 2} Z`;
          return d;
        })()}
        fill="none"
        stroke={strokeColor}
        strokeWidth={S * 0.012}
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
          fontFamily="'Caveat', cursive"
          fontSize={headlineFontSize}
          fontWeight="400"
          fill={textColor}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          {line}
        </text>
      ))}

      {/* Date */}
      <text
        x={cx}
        y={blockStartY + lines.length * lineHeight + gap + dateFontSize * 0.05}
        textAnchor="middle"
        fontFamily="'Caveat', cursive"
        fontSize={dateFontSize}
        fontWeight="400"
        fill={textColor}
        style={{ fontFamily: "'Caveat', cursive" }}
      >
        {date}.
      </text>
    </svg>
  );
}

function buildWobblePoints(cx, cy, r, seed, points = 40) {
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const jitter =
      (Math.sin(angle * 3 + seed) * 0.055 +
        Math.cos(angle * 5 + seed * 1.7) * 0.035 +
        Math.sin(angle * 7 + seed * 0.9) * 0.02) *
      r;
    pts.push([cx + (r + jitter) * Math.cos(angle), cy + (r + jitter) * Math.sin(angle)]);
  }
  return pts;
}