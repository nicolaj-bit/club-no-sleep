import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Moon, Plus } from 'lucide-react';
import { format, subDays } from 'date-fns';

function formatDuration(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}t ${rem > 0 ? `${rem}m` : ''}`.trim();
}

export default function SleepSummaryCard({ userEmail }) {
  const [log, setLog] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userEmail) return;
    import('@/api/base44Client').then(({ base44 }) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      base44.entities.SleepLog.filter({ user_email: userEmail }, '-date', 1).then(logs => {
        const recent = logs.find(l => l.date === today || l.date === yesterday);
        setLog(recent || null);
        setLoading(false);
      });
    });
  }, [userEmail]);

  const duration = log ? formatDuration(log.sleep_time || log.bedtime, log.wake_time) : null;
  const wakings = log?.night_wakings?.length ?? null;

  return (
    <Link to={createPageUrl('SleepLog')} className="block flex-1">
      <div
        className="rounded-2xl p-4 h-full"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <Moon className="w-5 h-5" style={{ color: '#7C6CF0' }} />
          {!log && !loading && (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <Plus className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Søvn i nat</p>
        {loading ? (
          <div className="h-6 w-16 rounded animate-pulse" style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
        ) : log ? (
          <>
            <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{duration || '–'}</p>
            {wakings !== null && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {wakings} {wakings === 1 ? 'opvågning' : 'opvågninger'}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Log søvn</p>
        )}
      </div>
    </Link>
  );
}