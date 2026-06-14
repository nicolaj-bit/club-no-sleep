/**
 * TypeSticker — Typewriter/stempel-stil sticker
 * Sort rektangel med hvid monospace tekst: headline + dato
 */
import React from 'react';

const FONT = "'Courier New', Courier, monospace";
const CHAR_W = 0.6; // approx char width ratio

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function TypeSticker({ headline, date, size = 140 }) {
  // viewBox width
  const VW = 200;
  const PAD_X = 10;
  const PAD_Y = 8;
  const FS_HEADLINE = 13;
  const FS_DATE = 11;
  const LINE_H = FS_HEADLINE * 1.4;
  const GAP = 6;

  const maxChars = Math.floor((VW - PAD_X * 2) / (FS_HEADLINE * CHAR_W));
  const lines = wrapText(headline, maxChars);

  const textBlockH = lines.length * LINE_H + GAP + FS_DATE;
  const rectH = textBlockH + PAD_Y * 2;

  // Render at bottom-left like the reference image
  const rectY = 0;

  return (
    <svg
      viewBox={`0 0 ${VW} ${rectH}`}
      width={size}
      height={size * (rectH / VW)}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Headline block */}
      <rect x={0} y={rectY} width={VW} height={lines.length * LINE_H + PAD_Y * 2} fill="#000" />
      {lines.map((line, i) => (
        <text
          key={i}
          x={PAD_X}
          y={rectY + PAD_Y + FS_HEADLINE + i * LINE_H}
          fontFamily={FONT}
          fontSize={FS_HEADLINE}
          fill="#fff"
          fontWeight="400"
          letterSpacing="0.5"
        >
          {line}
        </text>
      ))}

      {/* Date block */}
      <rect
        x={0}
        y={rectY + lines.length * LINE_H + PAD_Y * 2}
        width={date ? PAD_X * 2 + date.length * FS_DATE * CHAR_W + 4 : 0}
        height={FS_DATE + PAD_Y * 2}
        fill="#000"
      />
      {date && (
        <text
          x={PAD_X}
          y={rectY + lines.length * LINE_H + PAD_Y * 2 + PAD_Y + FS_DATE}
          fontFamily={FONT}
          fontSize={FS_DATE}
          fill="#fff"
          fontWeight="400"
          letterSpacing="0.5"
        >
          {date}
        </text>
      )}
    </svg>
  );
}