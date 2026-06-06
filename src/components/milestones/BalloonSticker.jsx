import React from 'react';

// Auto-fit text into the balloon by reducing font size if needed
function fitLines(text, maxWidth, maxFontSize = 11, minFontSize = 7) {
  if (!text) return { lines: [], fontSize: maxFontSize };

  // We simulate fitting using character-width estimation (SVG has no measureText)
  // Approx char width at fontSize 11 ≈ 6px, scales linearly
  for (let fs = maxFontSize; fs >= minFontSize; fs--) {
    const charW = fs * 0.55;
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
    // Allow max 3 lines; if fits, use this font size
    if (lines.length <= 3) return { lines, fontSize: fs };
  }
  // Fallback: force 3 lines at min size
  const words = text.split(' ');
  return { lines: [words.slice(0, 2).join(' '), words.slice(2, 4).join(' '), words.slice(4).join(' ')].filter(Boolean), fontSize: minFontSize };
}

export default function BalloonSticker({ headline, subline, date, size = 120 }) {
  const maxWidth = 58; // px inside balloon at viewBox scale (balloon rx=38)

  const { lines: headlineLines, fontSize: headlineFs } = fitLines(headline, maxWidth, 11, 7);
  const { lines: subLines, fontSize: subFs } = subline ? fitLines(subline, maxWidth, 9, 6) : { lines: [], fontSize: 9 };

  const lineH = headlineFs * 1.35;
  const subLineH = subFs * 1.3;

  const totalHeight =
    headlineLines.length * lineH +
    (subLines.length > 0 ? 4 + subLines.length * subLineH : 0) +
    (date ? 14 : 0); // heart + date row

  // Center text block in balloon (cy=50, ry=45 → usable center ~50)
  let curY = 50 - totalHeight / 2 + headlineFs;

  return (
    <svg
      viewBox="0 0 120 280"
      width={size}
      height={size * 2.33}
      className="drop-shadow-sm"
    >
      {/* String */}
      <line x1="60" y1="95" x2="60" y2="260" stroke="#D4C4B0" strokeWidth="1.5" />

      {/* Balloon */}
      <ellipse cx="60" cy="50" rx="38" ry="45" fill="#F5E8D8" stroke="#E8D7C3" strokeWidth="0.5" />

      {/* Shine */}
      <ellipse cx="48" cy="25" rx="8" ry="12" fill="#FFFFFF" opacity="0.6" />

      {/* Headline lines */}
      {headlineLines.map((line, i) => {
        const y = curY + i * lineH;
        return (
          <text
            key={`h${i}`}
            x="60"
            y={y}
            textAnchor="middle"
            fontSize={headlineFs}
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fill="#8B7355"
            fontWeight="400"
          >
            {line}
          </text>
        );
      })}

      {/* Subline lines */}
      {subLines.map((line, i) => {
        const y = curY + headlineLines.length * lineH + 4 + i * subLineH + subFs;
        return (
          <text
            key={`s${i}`}
            x="60"
            y={y}
            textAnchor="middle"
            fontSize={subFs}
            fontFamily="'Cormorant Garamond', Georgia, serif"
            fill="#A08060"
            fontWeight="400"
            fontStyle="italic"
          >
            {line}
          </text>
        );
      })}

      {/* Heart */}
      {(() => {
        const heartY = curY + headlineLines.length * lineH + (subLines.length > 0 ? 4 + subLines.length * subLineH : 0) + 4;
        return (
          <g transform={`translate(60, ${heartY})`}>
            <path
              d="M0,-2 C-2,-4 -4.5,-4 -5,-2 C-5.5,0 -4,2 0,5 C4,2 5.5,0 5,-2 C4.5,-4 2,-4 0,-2Z"
              fill="#9B7F6E"
            />
          </g>
        );
      })()}

      {/* Date */}
      {date && (() => {
        const dateY = curY + headlineLines.length * lineH + (subLines.length > 0 ? 4 + subLines.length * subLineH : 0) + 16;
        return (
          <text
            x="60"
            y={dateY}
            textAnchor="middle"
            fontSize={8}
            fontFamily="'Inter', sans-serif"
            fill="#8B7355"
            letterSpacing="0.3"
          >
            {date}
          </text>
        );
      })()}
    </svg>
  );
}