import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CalendarDays } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';

export default function UpcomingEventCard({ userEmail }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    import('@/api/base44Client').then(({ base44 }) => {
      const now = new Date().toISOString();
      base44.entities.CalendarEvent.filter({ user_email: userEmail }, 'start_datetime', 5).then(events => {
        const upcoming = events
          .filter(e => e.start_datetime >= now)
          .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
        setEvent(upcoming[0] || null);
        setLoading(false);
      });
    });
  }, [userEmail]);

  function getDateLabel(dt) {
    const d = parseISO(dt);
    if (isToday(d)) return 'I dag';
    if (isTomorrow(d)) return 'I morgen';
    return format(d, 'EEE d. MMM', { locale: da });
  }

  return (
    <Link to={createPageUrl('Calendar')} className="block flex-1 cursor-pointer">
      <div
        className="rounded-3xl p-4 h-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 100%)' }}
      >

        <div className="mb-3">
          <CalendarDays className="w-5 h-5 text-white/80" />
        </div>
        <p className="text-white/60 text-xs font-medium mb-1">Næste aftale</p>
        {loading ? (
          <div className="h-7 w-20 rounded-lg animate-pulse bg-white/20" />
        ) : event ? (
          <>
            <p className="text-sm font-bold text-white leading-snug line-clamp-2">{event.title}</p>
            <p className="text-white/50 text-xs mt-1">
              {getDateLabel(event.start_datetime)} · {format(parseISO(event.start_datetime), 'HH:mm')}
            </p>
          </>
        ) : (
          <p className="text-white/60 text-sm mt-1">Tilføj aftale →</p>
        )}
      </div>
    </Link>
  );
}