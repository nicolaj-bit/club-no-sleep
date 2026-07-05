import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { PREGNANCY_WEEKS } from '@/components/knowledge/pregnancyWeekData';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/components/ui/LanguageContext';

function getPregnancyWeek(dueDateStr) {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const daysUntilDue = differenceInDays(dueDate, today);
  return 40 - Math.round(daysUntilDue / 7);
}

function WeekCard({ week, data, isCurrent }) {
  const { t } = useLanguage();
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
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-cappuccino)', color: 'var(--color-primary-foreground)' }}>
              {t.pregnancyWeeksNow} ✦
            </span>
          )}
          <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {data.title || `${t.pregnancyWeeksWeekLabel} ${week}`}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {data.mainText[0]}
          </p>

          <Link
            to={`/PregnancyWeekDetail?week=${week}`}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium text-sm transition-opacity active:opacity-70"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.pregnancyWeeksReadMore} {week}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PregnancyWeeks() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      setProfile(profiles[0] || null);
    } catch {}
    setLoading(false);
  };

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

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title={t.pregnancyWeeksTitle} />

      <div className="px-4 pt-5 pb-6 space-y-5">
        {/* Week list */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {t.pregnancyWeeksAllWeeks}
          </p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-bg-card)' }} />
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}