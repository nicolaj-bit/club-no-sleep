import React from 'react';

const FONT_SIZE = 11;      // headline px (i viewBox-koordinater)
const SUB_SIZE = 9.5;      // subline px
const DATE_SIZE = 8;       // date px
const LINE_H = FONT_SIZE * 1.4;
const SUB_LINE_H = SUB_SIZE * 1.35;
const CHAR_W_FACTOR = 0.58; // approx char width = fontSize * factor

// Word-wrap at a given px width
function wrapText(text, maxWidth, fontSize) {
  if (!text) return [];
  const charW = fontSize * CHAR_W_FACTOR;
  const charsPerLine = Math.floor(maxWidth / charW);
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= charsPerLine) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function BalloonSticker({ headline, subline, date, size = 120 }) {
  // Fixed balloon horizontal radius
  const balloonRx = 38;
  // Text usable width inside balloon (a bit less than full diameter)
  const textMaxW = balloonRx * 1.7;

  const headlineLines = wrapText(headline, textMaxW, FONT_SIZE);
  const subLines = wrapText(subline, textMaxW, SUB_SIZE);

  // Calculate total text block height
  const headlineH = headlineLines.length * LINE_H;
  const subH = subLines.length > 0 ? SUB_LINE_H * subLines.length + 3 : 0;
  const heartH = 10;
  const dateH = date ? DATE_SIZE + 4 : 0;
  const gap = 4;
  const textBlockH = headlineH + subH + heartH + dateH + gap;

  // Balloon ry must be large enough to contain text + padding
  const minBalloonRy = textBlockH / 2 + 10;
  const balloonRy = Math.max(45, minBalloonRy);

  // ViewBox: balloon center at (60, balloonRy + 5), string below
  const balloonCy = balloonRy + 5;
  const stringEnd = balloonCy + balloonRy + 80;
  const viewH = stringEnd + 5;

  // Text block starts centered in balloon
  let curY = balloonCy - textBlockH / 2 + FONT_SIZE;

  // Aspect ratio for the rendered SVG
  const aspectRatio = viewH / 120;

  return (
    <svg
      viewBox={`0 0 120 ${viewH}`}
      width={size}
      height={size * aspectRatio}
      className="drop-shadow-sm"
    >
      {/* String */}
      <line
        x1="60" y1={balloonCy + balloonRy}
        x2="60" y2={stringEnd}
        stroke="#D4C4B0" strokeWidth="1.5"
      />

      {/* Balloon */}
      <ellipse
        cx="60" cy={balloonCy}
        rx={balloonRx} ry={balloonRy}
        fill="#F5E8D8" stroke="#E8D7C3" strokeWidth="0.5"
      />

      {/* Shine */}
      <ellipse
        cx="48" cy={balloonCy - balloonRy * 0.45}
        rx="8" ry="12"
        fill="#FFFFFF" opacity="0.6"
      />

      {/* Headline */}
      {headlineLines.map((line, i) => (
        <text
          key={`h${i}`}
          x="60"
          y={curY + i * LINE_H}
          textAnchor="middle"
          fontSize={FONT_SIZE}
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill="#8B7355"
          fontWeight="400"
        >
          {line}
        </text>
      ))}

      {/* Subline */}
      {subLines.map((line, i) => (
        <text
          key={`s${i}`}
          x="60"
          y={curY + headlineH + 3 + SUB_SIZE + i * SUB_LINE_H}
          textAnchor="middle"
          fontSize={SUB_SIZE}
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill="#A08060"
          fontWeight="400"
          fontStyle="italic"
        >
          {line}
        </text>
      ))}

      {/* Heart */}
      <g transform={`translate(60, ${curY + headlineH + subH + gap})`}>
        <path
          d="M0,-2 C-2,-4 -4.5,-4 -5,-2 C-5.5,0 -4,2 0,5 C4,2 5.5,0 5,-2 C4.5,-4 2,-4 0,-2Z"
          fill="#9B7F6E"
        />
      </g>

      {/* Date */}
      {date && (
        <text
          x="60"
          y={curY + headlineH + subH + heartH + gap + DATE_SIZE}
          textAnchor="middle"
          fontSize={DATE_SIZE}
          fontFamily="'Inter', sans-serif"
          fill="#8B7355"
          letterSpacing="0.3"
        >
          {date}
        </text>
      )}
    </svg>
  );
}