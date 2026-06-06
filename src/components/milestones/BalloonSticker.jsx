import React from 'react';

export default function BalloonSticker({ headline, subline, date, size = 120 }) {
  const balloonSize = size;
  const scale = balloonSize / 120;
  
  return (
    <svg
      viewBox="0 0 120 280"
      width={balloonSize}
      height={balloonSize * 2.33}
      className="drop-shadow-sm"
    >
      {/* String */}
      <line
        x1="60"
        y1="95"
        x2="60"
        y2="260"
        stroke="#D4C4B0"
        strokeWidth="1.5"
      />
      
      {/* Balloon */}
      <ellipse
        cx="60"
        cy="50"
        rx="38"
        ry="45"
        fill="#F5E8D8"
        stroke="#E8D7C3"
        strokeWidth="0.5"
      />
      
      {/* Shine effect */}
      <ellipse
        cx="48"
        cy="25"
        rx="8"
        ry="12"
        fill="#FFFFFF"
        opacity="0.6"
      />
      
      {/* Headline text */}
      <text
        x="60"
        y="35"
        textAnchor="middle"
        fontSize="11"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fill="#8B7355"
        fontWeight="400"
        fontStyle="normal"
      >
        I dag kravlede jeg
      </text>
      <text
        x="60"
        y="50"
        textAnchor="middle"
        fontSize="11"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fill="#8B7355"
        fontWeight="400"
        fontStyle="normal"
      >
        for første gang
      </text>
      
      {/* Heart */}
      <g transform="translate(60, 62)">
        <path
          d="M0,-2 C-2,-4 -4.5,-4 -5,-2 C-5.5,0 -4,2 0,5 C4,2 5.5,0 5,-2 C4.5,-4 2,-4 0,-2Z"
          fill="#9B7F6E"
        />
      </g>
      
      {/* Date */}
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontSize="10"
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