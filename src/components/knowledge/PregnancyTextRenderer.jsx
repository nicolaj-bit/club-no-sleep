import React from 'react';

// Regex der finder lalatoto.dk links, inkl. omkringstående citationstegn
const LINK_REGEX = /[""]?\s*(https?:\/\/(?:www\.)?lalatoto\.dk(?:\s*›\s*|\/)[^""\s]*?)\s*[""]?/gi;

function cleanUrl(url) {
  // Erstat " › " med "/" (Google-søgningstilfælde)
  return url.replace(/\s*›\s*/g, '/').replace(/[.,;:!?]+$/, '');
}

// Renderer et tekststykke med {{motherName}} erstattet og lalatoto.dk links konverteret til "Her"-links
export function renderPregnancyText(text, motherName) {
  if (!text) return null;
  let processed = text;
  if (motherName) {
    processed = processed.replace(/\{\{motherName\}\}/g, motherName);
  }

  const parts = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(LINK_REGEX.source, 'gi');
  let key = 0;

  while ((match = regex.exec(processed)) !== null) {
    // Tekst før linket
    if (match.index > lastIndex) {
      parts.push(processed.substring(lastIndex, match.index));
    }
    // Linket
    const url = cleanUrl(match[1]);
    parts.push(
      <a
        key={`link-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline"
        style={{ color: 'var(--color-accent)' }}
      >
        her
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  // Resten af teksten
  if (lastIndex < processed.length) {
    parts.push(processed.substring(lastIndex));
  }

  return parts.length === 0 ? processed : parts;
}

export default function PregnancyTextRenderer({ text, motherName, className, style }) {
  const rendered = renderPregnancyText(text, motherName);
  return (
    <span className={className} style={style}>
      {rendered}
    </span>
  );
}