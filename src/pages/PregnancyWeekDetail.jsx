import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Baby, Heart, Sparkles, Lightbulb } from 'lucide-react';
import { PREGNANCY_WEEKS } from '@/components/knowledge/pregnancyWeekData';

export default function PregnancyWeekDetail() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const week = parseInt(params.get('week'), 10);
  const data = PREGNANCY_WEEKS[week];

  if (!week || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Uge ikke fundet.</p>
      </div>
    );
  }

  const detail = data.detail;

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-subtle)' }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Graviditet</p>
          <h1
            className="text-xl font-light leading-tight"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.04em' }}
          >
            Uge {week}
          </h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">

        {/* Source tag */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full border"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}
          >
            Inspireret af Politikens Graviditetsbog · Lene Skou Jensen
          </span>
        </div>

        {/* Intro */}
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem' }}
        >
          {detail.intro}
        </p>

        {/* Baby section */}
        <Section
          icon={<Baby className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />}
          title={detail.babySection.title}
          color="var(--color-accent)"
        >
          <div className="space-y-3">
            {detail.babySection.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{p}</p>
            ))}
          </div>
        </Section>

        {/* Mom section */}
        <Section
          icon={<Heart className="w-5 h-5" style={{ color: '#C0786A' }} />}
          title={detail.momSection.title}
          color="#C0786A"
        >
          <div className="space-y-3">
            {detail.momSection.paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{p}</p>
            ))}
          </div>
        </Section>

        {/* Tips */}
        <Section
          icon={<Sparkles className="w-5 h-5" style={{ color: 'var(--color-cappuccino)' }} />}
          title="Gode råd til dig"
          color="var(--color-cappuccino)"
        >
          <ul className="space-y-2">
            {detail.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                <span style={{ color: 'var(--color-cappuccino)' }} className="mt-0.5 flex-shrink-0">✦</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Did you know */}
        <div
          className="rounded-2xl p-5 border"
          style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5" style={{ color: 'var(--color-cappuccino)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-cappuccino)' }}>Vidste du...?</span>
          </div>
          <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
            {detail.didYouKnow}
          </p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {week > 4 && (
            <button
              onClick={() => navigate(`/PregnancyWeekDetail?week=${week - 1}`)}
              className="p-4 rounded-2xl text-sm border text-left"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              ← Uge {week - 1}
            </button>
          )}
          {week < 42 && (
            <button
              onClick={() => navigate(`/PregnancyWeekDetail?week=${week + 1}`)}
              className="p-4 rounded-2xl text-sm border text-right col-start-2"
              style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Uge {week + 1} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, color, children }) {
  return (
    <div className="rounded-2xl p-5 border space-y-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold" style={{ color }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}