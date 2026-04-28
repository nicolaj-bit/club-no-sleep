import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Moon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';

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
  const { t, lang } = useLanguage();
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
        style={{ backgroundImage: 'url(https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/8ed0e276b_2.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >

        <div className="mb-3">
          <Moon className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.8)' }} />
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {lang === 'da' ? 'Søvn i nat' : 'Sleep last night'}
        </p>
        {loading ? (
          <div className="h-7 w-14 rounded-lg animate-pulse bg-white/20" />
        ) : dur ? (
          <>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-white">{dur.hours}</span>
              <span className="text-sm text-white/70">{t.hoursShort}</span>
              {dur.rem > 0 && (
                <>
                  <span className="text-2xl font-bold text-white ml-1">{dur.rem}</span>
                  <span className="text-sm text-white/70">{t.minutesShort}</span>
                </>
              )}
            </div>
            {wakings !== null && (
              <p className="text-xs mt-1 text-white/50">
                {wakings} {wakings === 1 ? t.wakingSingular : t.wakingPlural}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm mt-1 text-white/60">
            {lang === 'da' ? 'Log søvn →' : 'Log sleep →'}
          </p>
        )}
      </div>
    </Link>
  );
}