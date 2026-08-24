import React from 'react';
import { Moon } from 'lucide-react';
import { format } from 'date-fns';
import { useSleepSession } from './useSleepSession';
import {
  computeSessionTotals,
  formatHoursMinutes,
  formatClockHm,
} from '../../../base44/shared/sleepSession';

function Chip({ label, color }) {
  const colorMap = {
    blue: { backgroundColor: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
    green: { backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E' },
    yellow: { backgroundColor: 'rgba(234,179,8,0.12)', color: '#A16207' },
    orange: { backgroundColor: 'rgba(249,115,22,0.12)', color: '#F97316' },
    brown: { backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-accent)' },
  };
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={colorMap[color] || colorMap.brown}>
      {label}
    </span>
  );
}

export default function SleepHistory({ user, activeChild, lang, dateLocale }) {
  const { history, loading } = useSleepSession(user);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-text-secondary)' }} />
      </div>
    );
  }

  const filtered = activeChild?.id
    ? history.filter(l => !l.child_id || l.child_id === activeChild.id)
    : history;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--color-text-muted)' }}>
        <Moon className="w-10 h-10 opacity-30" />
        <p className="text-sm">Ingen søvnlogs endnu</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-3 max-w-lg mx-auto">
      {filtered.map(log => {
        // Nyt format: period-baseret
        if (log.periods && log.periods.length > 0) {
          const totals = computeSessionTotals(log);
          return (
            <div key={log.id} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  {format(new Date(log.date || log.session_start), lang === 'en' ? 'MMMM d' : 'd. MMMM', { locale: dateLocale })}
                </span>
                {log.session_start && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatClockHm(log.session_start)} – {formatClockHm(log.session_end)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip label={`${formatHoursMinutes(totals.totalSleepMs)} søvn`} color="blue" />
                {totals.wakeCount > 0 && (
                  <Chip label={`${totals.wakeCount} ${totals.wakeCount === 1 ? 'opvågning' : 'opvågninger'}`} color="yellow" />
                )}
                {totals.totalAwakeMs > 0 && (
                  <Chip label={`${formatHoursMinutes(totals.totalAwakeMs)} vågen`} color="orange" />
                )}
              </div>
              {log.parent_note && (
                <p className="text-xs mt-2 italic" style={{ color: 'var(--color-text-muted)' }}>"{log.parent_note}"</p>
              )}
            </div>
          );
        }

        // Legacy format
        let nightMins = null;
        if (log.bedtime && log.wake_time) {
          const [bh, bm] = log.bedtime.split(':').map(Number);
          const [wh, wm] = log.wake_time.split(':').map(Number);
          let diff = (wh * 60 + wm) - (bh * 60 + bm);
          if (diff < 0) diff += 24 * 60;
          nightMins = diff;
        }
        const wakeCount = log.night_wakings?.length || 0;
        return (
          <div key={log.id} className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {format(new Date(log.date), lang === 'en' ? 'MMMM d' : 'd. MMMM', { locale: dateLocale })}
              </span>
              {log.bedtime && (
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sengetid {log.bedtime}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nightMins !== null && <Chip label={`${Math.floor(nightMins / 60)}t ${nightMins % 60}m`} color="blue" />}
              {wakeCount > 0 && <Chip label={`${wakeCount} opvågninger`} color="yellow" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}