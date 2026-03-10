import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronUp, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useWonderWeekEmojis } from './useWonderWeekEmojis';

const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export default function WonderWeekCard({ wonderWeek, ageInWeeks }) {
  const [expanded, setExpanded] = useState(false);

  if (!wonderWeek || wonderWeek.status === 'complete') return null;

  const isActive = wonderWeek.status === 'active';
  const isUpcoming = wonderWeek.status === 'upcoming';

  return (
    <div className="mx-5 mb-6">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: `1px solid ${isActive ? wonderWeek.color + '55' : 'var(--color-border)'}`,
          boxShadow: isActive ? `0 4px 24px ${wonderWeek.color}18` : '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Gradient header strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${wonderWeek.color}, ${wonderWeek.color}55)` }}
        />

        <div className="p-5">
          {/* Label row */}
          <div className="flex items-center gap-2 mb-3">
            {isActive ? (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: wonderWeek.color }}
              >
                <Sparkles className="w-3 h-3" />
                TIGERSPRING {wonderWeek.number} · AKTIV NU
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
                <Clock className="w-3 h-3" />
                Næste spring om {wonderWeek.weeksUntil} {wonderWeek.weeksUntil === 1 ? 'uge' : 'uger'}
              </span>
            )}
          </div>

          {/* Title + emoji */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                {wonderWeek.name}
              </h3>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {wonderWeek.shortDescription}
              </p>
            </div>
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${wonderWeek.color}18`, width: 52, height: 52, fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}
            >
              {wonderWeek.emoji}
            </div>
          </div>

          {/* Progress bar for active */}
          {isActive && wonderWeek.weeksLeft !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <span>Fremgang</span>
                <span>{wonderWeek.weeksLeft > 0 ? `ca. ${wonderWeek.weeksLeft} uge(r) tilbage` : 'Næsten forbi'}</span>
              </div>
              <div className="h-1 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: wonderWeek.color,
                    width: `${Math.max(8, 100 - (wonderWeek.weeksLeft / (wonderWeek.weekEnd - wonderWeek.weekStart + 2)) * 100)}%`,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Expand button */}
          {isActive && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 rounded-xl transition-all"
              style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
            >
              {expanded ? 'Skjul detaljer' : 'Se tegn & tips'}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {/* Expanded content */}
          {isActive && expanded && (
            <div className="mt-4 space-y-4">
              {/* Parent message */}
              <div
                className="rounded-xl p-4 border-l-3"
                style={{ backgroundColor: `${wonderWeek.color}10`, borderLeft: `3px solid ${wonderWeek.color}` }}
              >
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-primary)' }}>
                  "{wonderWeek.parentMessage}"
                </p>
              </div>

              {/* Signs */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Typiske tegn
                </p>
                <ul className="space-y-1.5">
                  {wonderWeek.signs.map((sign, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: wonderWeek.color, marginTop: 6 }} />
                      {sign}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Tips til dig
                </p>
                <ul className="space-y-1.5">
                  {wonderWeek.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="flex-shrink-0 text-xs mt-0.5" style={{ color: wonderWeek.color }}>✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link
                to={createPageUrl('Knowledge')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: wonderWeek.color, color: '#fff' }}
              >
                Læs mere om tigerspring
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Upcoming teaser */}
          {isUpcoming && (
            <p className="mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Bliv klar – dit barn er snart klar til sit næste store spring 🌱
            </p>
          )}
        </div>
      </div>
    </div>
  );
}