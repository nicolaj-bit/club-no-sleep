import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CalendarDays, Plus } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';

export default function UpcomingEventCard({ userEmail }) {
  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userEmail) return;
    import('@/api/base44Client').then(({ base44 }) => {
      const now = new Date().toISOString();
      base44.entities.CalendarEvent.filter({ user_email: userEmail }, 'start_datetime', 5).then(events => {
        const upcoming = events.filter(e => e.start_datetime >= now).sort((a, b) =>
          a.start_datetime.localeCompare(b.start_datetime)
        );
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

  function getTimeLabel(dt) {
    return format(parseISO(dt), 'HH:mm');
  }

  return (
    <Link to={createPageUrl('Calendar')} className="block flex-1">
      <div
        className="rounded-2xl p-4 h-full"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <CalendarDays className="w-5 h-5" style={{ color: '#E07A5F' }} />
          {!event && !loading && (
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <Plus className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            </div>
          )}
        </div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Næste aftale</p>
        {loading ? (
          <div className="h-6 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
        ) : event ? (
          <>
            <p className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {event.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {getDateLabel(event.start_datetime)} kl. {getTimeLabel(event.start_datetime)}
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen aftaler</p>
        )}
      </div>
    </Link>
  );
}