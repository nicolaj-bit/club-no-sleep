import React from 'react';

// Splits headline into max 2 lines that fit inside balloon (~16 chars per line)
function splitText(text, maxChars = 16) {
  if (!text) return ['', ''];
  if (text.length <= maxChars) return [text, ''];
  const words = text.split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of words) {
    if ((line1 + ' ' + word).trim().length <= maxChars) {
      line1 = (line1 + ' ' + word).trim();
    } else {
      line2 = (line2 + ' ' + word).trim();
    }
  }
  return [line1, line2];
}

export default function BalloonSticker({ headline, subline, date, size = 120 }) {
  const balloonSize = size;
  const [line1, line2] = splitText(headline);
  const subText = subline || '';

  // Adjust text y positions based on how many lines we have
  const hasSubline = subText.length > 0;
  const hasLine2 = line2.length > 0;

  // Center text block vertically in balloon (balloon cy=50, ry=45 → range ~5 to 95)
  const textStartY = hasLine2 ? (hasSubline ? 28 : 32) : (hasSubline ? 32 : 40);
  const lineHeight = 13;

  return (
    <svg
      viewBox="0 0 120 280"
      width={balloonSize}
      height={balloonSize * 2.33}
      className="drop-shadow-sm"
    >
      {/* String */}
      <line x1="60" y1="95" x2="60" y2="260" stroke="#D4C4B0" strokeWidth="1.5" />

      {/* Balloon */}
      <ellipse cx="60" cy="50" rx="38" ry="45" fill="#F5E8D8" stroke="#E8D7C3" strokeWidth="0.5" />

      {/* Shine effect */}
      <ellipse cx="48" cy="25" rx="8" ry="12" fill="#FFFFFF" opacity="0.6" />

      {/* Line 1 */}
      <text
        x="60"
        y={textStartY}
        textAnchor="middle"
        fontSize="10"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fill="#8B7355"
        fontWeight="400"
      >
        {line1}
      </text>

      {/* Line 2 (if exists) */}
      {hasLine2 && (
        <text
          x="60"
          y={textStartY + lineHeight}
          textAnchor="middle"
          fontSize="10"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill="#8B7355"
          fontWeight="400"
        >
          {line2}
        </text>
      )}

      {/* Subline */}
      {hasSubline && (
        <text
          x="60"
          y={textStartY + (hasLine2 ? lineHeight * 2 : lineHeight)}
          textAnchor="middle"
          fontSize="9"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill="#A08060"
          fontWeight="400"
          fontStyle="italic"
        >
          {subText}
        </text>
      )}

      {/* Heart */}
      <g transform="translate(60, 74)">
        <path
          d="M0,-2 C-2,-4 -4.5,-4 -5,-2 C-5.5,0 -4,2 0,5 C4,2 5.5,0 5,-2 C4.5,-4 2,-4 0,-2Z"
          fill="#9B7F6E"
        />
      </g>

      {/* Date */}
      <text
        x="60"
        y="88"
        textAnchor="middle"
        fontSize="9"
        fontFamily="'Inter', sans-serif"
        fill="#8B7355"
        fontWeight="400"
        letterSpacing="0.3"
      >
        {date}
      </text>
    </svg>
  );
}