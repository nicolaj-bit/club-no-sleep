import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';

export default function WonderWeekCard({ wonderWeek, ageInWeeks }) {
  const [expanded, setExpanded] = useState(false);

  if (!wonderWeek) return null;

  const isActive = wonderWeek.status === 'active';
  const isUpcoming = wonderWeek.status === 'upcoming';
  const isComplete = wonderWeek.status === 'complete';

  if (isComplete) return null;

  return (
    <div
      className="mx-5 mb-6 rounded-2xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        border: isActive ? `2px solid ${wonderWeek.color}` : '1px solid var(--color-border)',
      }}
    >
      {/* Top strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${wonderWeek.color}, ${wonderWeek.color}99)` }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${wonderWeek.color}22` }}
            >
              {wonderWeek.emoji}
            </div>
            <div>
              {isActive ? (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: wonderWeek.color }}
                  >
                    TIGERSPRING {wonderWeek.number}
                  </span>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: wonderWeek.color }} />
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Næste spring om {wonderWeek.weeksUntil} {wonderWeek.weeksUntil === 1 ? 'uge' : 'uger'}
                  </span>
                </div>
              )}
              <p className="font-semibold text-base leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                {wonderWeek.name}
              </p>
            </div>
          </div>

          {isActive && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg flex-shrink-0"
              style={{ backgroundColor: 'var(--color-bg-subtle)' }}
            >
              {expanded
                ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              }
            </button>
          )}
        </div>

        {/* Short description */}
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          {wonderWeek.shortDescription}
        </p>

        {/* Weeks left indicator */}
        {isActive && wonderWeek.weeksLeft !== undefined && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: wonderWeek.color,
                  width: `${Math.max(5, 100 - (wonderWeek.weeksLeft / (wonderWeek.weekEnd - wonderWeek.weekStart + 2)) * 100)}%`
                }}
              />
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              {wonderWeek.weeksLeft > 0 ? `ca. ${wonderWeek.weeksLeft} uge(r) tilbage` : 'Næsten forbi'}
            </span>
          </div>
        )}

        {/* Expanded content */}
        {isActive && expanded && (
          <div className="mt-4 space-y-4 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            {/* Parent message */}
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: `${wonderWeek.color}15` }}
            >
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-primary)' }}>
                "{wonderWeek.parentMessage}"
              </p>
            </div>

            {/* Signs */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Typiske tegn
              </p>
              <ul className="space-y-1">
                {wonderWeek.signs.map((sign, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: wonderWeek.color }}>•</span>
                    {sign}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Tips til dig
              </p>
              <ul className="space-y-1">
                {wonderWeek.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: wonderWeek.color }}>✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Link to article */}
            <Link
              to={createPageUrl('Knowledge')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
              style={{ backgroundColor: wonderWeek.color, color: '#FFFFFF' }}
            >
              Læs mere om dette tigerspring →
            </Link>
          </div>
        )}

        {/* Upcoming – teaser only */}
        {isUpcoming && (
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Bliv klar – dit barn er snart klar til sit næste store spring 🌱
          </p>
        )}
      </div>
    </div>
  );
}