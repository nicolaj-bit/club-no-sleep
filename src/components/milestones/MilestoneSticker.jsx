/**
 * MilestoneSticker — ÉN fælles kilde til milepæls-stickeren:
 * sorte kasser (#000, ingen runde hjørner) med hvid skrivemaskineskrift,
 * headline i første kasse, dato i en mindre kasse under. Alt regnes som
 * procent af billedets bredde (tekst/kasser) og højde (bundmargin), så
 * stickeren ser ens ud og ligger samme sted i live-kameraet, i
 * forhåndsvisningen og i det gemte/delte billede.
 *
 * `computeStickerLayout` er den delte geometri-udregning.
 * `drawMilestoneStickerOnCanvas` bruger den til at tegne på canvas (capture/gem/del).
 * `MilestoneSticker` (default export) bruger den til at vise samme sticker som DOM-lag i live-kameraet.
 */
import React from 'react';

export const STICKER_FONT = "'Courier New', Courier, monospace";
const CHAR_W = 0.6; // ca. tegnbredde-ratio for monospace-skrift

const MARGIN_X_RATIO = 0.05; // venstre margin, % af bredde
// Bundmargin er % af HØJDE — holder stickeren over udløser/handlingsknapperne,
// som altid ligger i samme relative afstand fra skærmens bund.
export const MARGIN_BOTTOM_RATIO = 0.22;

const RATIOS = {
  headlineFontSize: 0.042,
  dateFontSize: 0.032,
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
    gap,
    headline: { lines, fontSize: headlineFs, lineHeight, padX, padY, boxWidth: headlineBoxWidth, boxHeight: headlineBoxHeight },
    date: dateBox,
  };
}

// ── Canvas — bruges ved capture/gem/del ─────────────────────────────────────
export function drawMilestoneStickerOnCanvas(ctx, canvasW, canvasH, headline, dateStr) {
  const layout = computeStickerLayout(canvasW, headline, dateStr);
  const { gap, headline: h, date: d } = layout;

  const marginX = canvasW * MARGIN_X_RATIO;
  const marginBottom = canvasH * MARGIN_BOTTOM_RATIO;
  const totalHeight = h.boxHeight + (d ? gap + d.boxHeight : 0);
  const x = marginX;
  let y = canvasH - marginBottom - totalHeight;

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
  const { gap, headline: h, date: d } = layout;
  const marginX = width * MARGIN_X_RATIO;

  return (
    <div
      className="absolute"
      style={{
        left: marginX,
        bottom: `calc(${MARGIN_BOTTOM_RATIO * 100}% + env(safe-area-inset-bottom, 0px))`,
        display: 'flex',
        flexDirection: 'column',
        gap,
      }}
    >
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