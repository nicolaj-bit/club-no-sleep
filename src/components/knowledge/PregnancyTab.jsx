import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Baby, Heart, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import ContentLock from '@/components/subscription/ContentLock';
import { useSubscription } from '@/components/subscription/useSubscription';
import { differenceInDays } from 'date-fns';
import { PREGNANCY_WEEKS } from './pregnancyWeekData';

function getPregnancyWeek(dueDateStr) {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const daysUntilDue = differenceInDays(dueDate, today);
  const currentWeek = 40 - Math.round(daysUntilDue / 7);
  return currentWeek;
}

function WeekCard({ week, data, isCurrent }) {
  const [open, setOpen] = useState(isCurrent);

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${isCurrent ? 'border-2' : ''}`}
      style={{
        borderColor: isCurrent ? 'var(--color-cappuccino)' : 'var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
      }}
    >
      <button
        className="w-full px-4 py-3.5 flex items-center justify-between gap-2"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          {isCurrent && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-cappuccino)', color: '#fff' }}>
              Nu ✦
            </span>
          )}
          <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Uge {week}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {/* Baby */}
          <div className="pt-3 space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Baby className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>Babyen</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.baby}</p>
          </div>

          {/* Mom */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>Din krop</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{data.mom}</p>
          </div>

          {/* Tip */}
          <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-cappuccino)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-cappuccino)' }}>Tip</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{data.tip}</p>
          </div>

          {/* Læs mere */}
          <Link
            to={`/PregnancyWeekDetail?week=${week}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border font-medium text-sm transition-opacity active:opacity-70"
            style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <BookOpen className="w-4 h-4" />
            <span>Læs mere om uge {week}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PregnancyTab() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        setProfile(profiles[0] || null);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, []);

  const dueDateStr = profile?.child_due_date;
  const currentWeek = dueDateStr ? getPregnancyWeek(dueDateStr) : null;
  const isPregnant = currentWeek !== null && currentWeek >= 4 && currentWeek <= 42;
  const isPostTerm = currentWeek !== null && currentWeek > 42;

  const weeksToShow = Object.keys(PREGNANCY_WEEKS).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="space-y-3 mt-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-4">


      {/* Info card */}
      <div className="rounded-2xl p-4 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <p className="text-xs uppercase tracking-widest font-medium mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Inspireret af</p>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Politikens Graviditetsbog</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>af Lene Skou Jensen</p>

        {!dueDateStr && (
          <p className="text-xs mt-3 p-2 rounded-xl" style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-muted)' }}>
            💡 Tilføj din terminsdato i din profil for at se hvilken uge du er i nu.
          </p>
        )}

        {isPregnant && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, ((currentWeek - 4) / 38) * 100)}%`, backgroundColor: 'var(--color-cappuccino)' }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--color-cappuccino)' }}>Uge {currentWeek}</span>
          </div>
        )}

        {isPostTerm && (
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
            🎉 Du er forbi terminen – din baby er snart her!
          </p>
        )}
      </div>

      {/* Week list */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Alle uger
        </p>
        <ContentLock locked={!hasSubscription} loading={subscriptionLoading} blurHeight="260px">
          <div className="space-y-2">
            {weeksToShow.map(week => (
              <WeekCard
                key={week}
                week={week}
                data={PREGNANCY_WEEKS[week]}
                isCurrent={isPregnant && week === currentWeek}
              />
            ))}
          </div>
        </ContentLock>
      </div>
    </div>
  );
}