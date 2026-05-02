import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/ui/PageHeader';
import MilestoneCamera from '@/components/milestones/MilestoneCamera';
import WobblySticker from '@/components/milestones/WobblySticker';
import { MILESTONE_FRAMES } from '@/components/milestones/milestonesData';
import { Camera } from 'lucide-react';

const TODAY = new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });

const CATEGORY_ORDER = ['Graviditet', 'Baby', 'Øjeblikke'];
const CATEGORY_LABELS = {
  Graviditet: '🌱 Graviditet',
  Baby: '🍼 Baby',
  Øjeblikke: '✨ Særlige øjeblikke',
};

const cleanHeadline = (headline) =>
  headline.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();

// Convert DB frame fields to the same shape as hardcoded frames
function normalizeDbFrame(f) {
  return {
    id: f.id,
    milestone_id: f.milestone_id,
    category: f.category,
    label: f.label,
    emoji: f.emoji || '🤍',
    headline: f.headline,
    subline: f.subline || '',
    bgColor: f.bg_color || '#F5EFE6',
    accentColor: f.accent_color || '#C8A882',
    textColor: f.text_color || '#2B1F16',
    sticker_image: f.sticker_image || null,
    order: f.order ?? 0,
  };
}

export default function Milestones() {
  const [cameraFrame, setCameraFrame] = useState(null);

  const { data: dbFrames = [] } = useQuery({
    queryKey: ['milestoneFrames'],
    queryFn: () => base44.entities.MilestoneFrame.filter({ is_active: true }, 'order', 100),
  });

  if (cameraFrame) {
    return <MilestoneCamera frame={cameraFrame} onClose={() => setCameraFrame(null)} />;
  }

  // Use DB frames if available, otherwise fall back to hardcoded
  const frames = dbFrames.length > 0
    ? dbFrames.map(normalizeDbFrame)
    : MILESTONE_FRAMES;

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = frames.filter(f => f.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Milepæle" />

      <div className="px-4 pt-2 space-y-8">
        {CATEGORY_ORDER.map(cat => (
          <div key={cat}>
            <h2
              className="text-base font-semibold mb-4 tracking-wide uppercase"
              style={{ color: 'var(--color-text-muted)', fontSize: 11, letterSpacing: '0.1em' }}
            >
              {CATEGORY_LABELS[cat]}
            </h2>

            <div className="space-y-3">
              {grouped[cat].map(frame => (
                <MilestoneRow
                  key={frame.id}
                  frame={frame}
                  onCapture={() => setCameraFrame(frame)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MilestoneRow({ frame, onCapture }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-4 py-3"
      style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Mini sticker preview */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: frame.bgColor }}
      >
        {frame.sticker_image
          ? <img src={frame.sticker_image} alt={frame.label} className="w-12 h-12 object-contain" />
          : <WobblySticker headline={cleanHeadline(frame.headline)} date={TODAY} size={52} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {frame.label}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {frame.subline}
        </p>
      </div>

      {/* Camera button */}
      <button
        onClick={onCapture}
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${frame.accentColor}CC, ${frame.accentColor})` }}
      >
        <Camera className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}