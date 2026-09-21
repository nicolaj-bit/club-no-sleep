/**
 * MilestoneSticker — ÉN fælles kilde til milepæls-stickeren:
 * sorte kasser med hvid skrivemaskineskrift, headline i første kasse,
 * dato i næste. Alt regnes som procent af billedets/videoens bredde,
 * så den ser ens ud i live-kameraet, i forhåndsvisningen (bagt ind i
 * billedet) og i det gemte/delte billede.
 *
 * `computeStickerLayout` er den delte geometri-udregning.
 * `drawMilestoneStickerOnCanvas` bruger den til at tegne på canvas (capture/gem/del).
 * `MilestoneSticker` (default export) bruger den til at vise samme sticker som DOM-lag i live-kameraet.
 */
import React from 'react';

export const STICKER_FONT = "'Courier New', Courier, monospace";
const CHAR_W = 0.6; // ca. tegnbredde-ratio for monospace-skrift

const RATIOS = {
  margin: 0.05,
  headlineFontSize: 0.042,
  dateFontSize: 0.034,
  padX: 0.022,
  padY: 0.016,
  gap: 0.012,
  maxTextWidth: 0.7,
};

function wrapText(text, maxChars) {
  const words = (text || '').split(' ');
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

export function computeStickerLayout(width, headline, date) {
  const margin = width * RATIOS.margin;
  const headlineFs = width * RATIOS.headlineFontSize;
  const dateFs = width * RATIOS.dateFontSize;
  const padX = width * RATIOS.padX;
  const padY = width * RATIOS.padY;
  const gap = width * RATIOS.gap;
  const maxTextWidth = width * RATIOS.maxTextWidth;

  const maxChars = Math.max(1, Math.floor(maxTextWidth / (headlineFs * CHAR_W)));
  const lines = wrapText(headline, maxChars);
  const lineHeight = headlineFs * 1.4;
  const longestLine = lines.reduce((max, l) => Math.max(max, l.length), 0);
  const headlineBoxWidth = Math.min(maxTextWidth, longestLine * headlineFs * CHAR_W) + padX * 2;
  const headlineBoxHeight = lines.length * lineHeight + padY * 2;

  const dateBox = date
    ? {
        text: date,
        fontSize: dateFs,
        padX,
        padY,
        boxWidth: date.length * dateFs * CHAR_W + padX * 2,
        boxHeight: dateFs + padY * 2,
      }
    : null;

  return {
    margin,
    gap,
    headline: { lines, fontSize: headlineFs, lineHeight, padX, padY, boxWidth: headlineBoxWidth, boxHeight: headlineBoxHeight },
    date: dateBox,
  };
}

// ── Canvas — bruges ved capture/gem/del ─────────────────────────────────────
export function drawMilestoneStickerOnCanvas(ctx, canvasW, canvasH, headline, dateStr) {
  const layout = computeStickerLayout(canvasW, headline, dateStr);
  const { margin, gap, headline: h, date: d } = layout;

  const totalHeight = h.boxHeight + (d ? gap + d.boxHeight : 0);
  const x = margin;
  let y = canvasH - margin - totalHeight;

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.fillStyle = '#000';
  ctx.fillRect(x, y, h.boxWidth, h.boxHeight);
  ctx.fillStyle = '#fff';
  ctx.font = `400 ${h.fontSize}px ${STICKER_FONT}`;
  h.lines.forEach((line, i) => {
    ctx.fillText(line, x + h.padX, y + h.padY + h.fontSize + i * h.lineHeight);
  });
  y += h.boxHeight;

  if (d) {
    y += gap;
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, d.boxWidth, d.boxHeight);
    ctx.fillStyle = '#fff';
    ctx.font = `400 ${d.fontSize}px ${STICKER_FONT}`;
    ctx.fillText(d.text, x + d.padX, y + d.padY + d.fontSize);
  }

  ctx.restore();
}

// ── DOM — bruges som live-overlay i kameraet ────────────────────────────────
export default function MilestoneSticker({ headline, date, width }) {
  if (!width || !headline) return null;
  const layout = computeStickerLayout(width, headline, date);
  const { margin, gap, headline: h, date: d } = layout;

  return (
    <div className="absolute" style={{ left: margin, bottom: margin, display: 'flex', flexDirection: 'column', gap }}>
      <div style={{ backgroundColor: '#000', width: h.boxWidth, paddingLeft: h.padX, paddingTop: h.padY, paddingBottom: h.padY, boxSizing: 'border-box' }}>
        {h.lines.map((line, i) => (
          <p
            key={i}
            style={{ margin: 0, color: '#fff', fontFamily: STICKER_FONT, fontSize: h.fontSize, lineHeight: `${h.lineHeight}px`, letterSpacing: 0.5, whiteSpace: 'pre' }}
          >
            {line}
          </p>
        ))}
      </div>
      {d && (
        <div style={{ backgroundColor: '#000', width: d.boxWidth, paddingLeft: d.padX, paddingTop: d.padY, paddingBottom: d.padY, boxSizing: 'border-box' }}>
          <p style={{ margin: 0, color: '#fff', fontFamily: STICKER_FONT, fontSize: d.fontSize, letterSpacing: 0.5, whiteSpace: 'pre' }}>{d.text}</p>
        </div>
      )}
    </div>
  );
}