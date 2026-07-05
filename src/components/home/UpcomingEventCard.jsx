import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CalendarDays } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { da, enUS } from 'date-fns/locale';

import { useLanguage } from '@/components/ui/LanguageContext';

export default function UpcomingEventCard({ userEmail }) {
  const { t, lang } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    import('@/api/base44Client').then(({ base44 }) => {
      const now = new Date().toISOString();
      base44.entities.CalendarEvent.filter({ user_email: userEmail }, 'start_datetime', 5).then(events => {
        if (!Array.isArray(events)) {
          setEvent(null);
          setLoading(false);
          return;
        }
        const upcoming = events
          .filter(e => e.start_datetime >= now)
          .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
        setEvent(upcoming[0] || null);
        setLoading(false);
      }).catch(() => {
        setEvent(null);
        setLoading(false);
      });
    });
  }, [userEmail]);

  function getDateLabel(dt) {
    const d = parseISO(dt);
    if (isToday(d)) return t.today;
    if (isTomorrow(d)) return t.tomorrow;
    return format(d, lang === 'en' ? 'EEE MMM d' : 'EEE d. MMM', { locale: lang === 'en' ? enUS : da });
  }

  return (
    <Link to={createPageUrl('Calendar')} className="block flex-1 cursor-pointer">
      <div
        className="rounded-3xl p-4 h-full relative overflow-hidden"
        style={{ backgroundImage: 'url(https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/8454f2620_3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >

        <div className="flex items-center justify-between mb-3">
          <CalendarDays className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
            {format(new Date(), lang === 'en' ? 'EEE d. MMM' : 'EEE d. MMM', { locale: lang === 'en' ? enUS : da })}
          </span>
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da' ? 'Næste aftale' : 'Next appointment'}
        </p>
        {loading ? (
          <div className="h-7 w-20 rounded-lg animate-pulse bg-black/10" />
        ) : event ? (
          <>
            <p className="text-sm font-bold leading-snug line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>{event.title}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {getDateLabel(event.start_datetime)} · {format(parseISO(event.start_datetime), 'HH:mm')}
            </p>
          </>
        ) : (
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {lang === 'da' ? 'Tilføj aftale →' : 'Add appointment →'}
          </p>
        )}
      </div>
    </Link>
  );
}