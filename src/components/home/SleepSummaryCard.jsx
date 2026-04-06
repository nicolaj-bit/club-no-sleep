import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Moon } from 'lucide-react';
import { format, subDays } from 'date-fns';

function formatDuration(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return { hours, rem };
}

export default function SleepSummaryCard({ userEmail }) {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const dur = log ? formatDuration(log.sleep_time || log.bedtime, log.wake_time) : null;
  const wakings = log?.night_wakings?.length ?? null;

  return (
    <Link to={createPageUrl('SleepLog')} className="block flex-1 cursor-pointer">
      <div
        className="rounded-3xl p-4 h-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2D1B69 0%, #5B3FA6 100%)' }}
      >
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 bg-white" />
        <div className="mb-3">
          <Moon className="w-5 h-5 text-white/80" />
        </div>
        <p className="text-white/60 text-xs font-medium mb-1">Søvn i nat</p>
        {loading ? (
          <div className="h-7 w-14 rounded-lg animate-pulse bg-white/20" />
        ) : dur ? (
          <>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-white">{dur.hours}</span>
              <span className="text-white/70 text-sm">t</span>
              {dur.rem > 0 && (
                <>
                  <span className="text-2xl font-bold text-white ml-1">{dur.rem}</span>
                  <span className="text-white/70 text-sm">m</span>
                </>
              )}
            </div>
            {wakings !== null && (
              <p className="text-white/50 text-xs mt-1">
                {wakings} {wakings === 1 ? 'opvågning' : 'opvågninger'}
              </p>
            )}
          </>
        ) : (
          <p className="text-white/60 text-sm mt-1">Log søvn →</p>
        )}
      </div>
    </Link>
  );
}