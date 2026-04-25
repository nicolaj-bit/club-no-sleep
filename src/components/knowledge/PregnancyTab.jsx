import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Baby, Heart, Sparkles, ArrowRight, BookHeart, BookOpen } from 'lucide-react';
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

function WeekCard({ week, data, isCurrent, hasDiaryEntry }) {
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
          {hasDiaryEntry && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(200,168,130,0.18)', color: 'var(--color-cappuccino)' }}>
              📖 Dagbog
            </span>
          )}
          {data?.title && (
            <span className="text-xs hidden sm:inline" style={{ color: 'var(--color-text-muted)' }}>
              {data.title}
            </span>
          )}
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

          {/* Action row */}
          <div className="flex gap-2 pt-1">
            <Link
              to={`/PregnancyWeekDetail?week=${week}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-opacity active:opacity-70"
              style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Læs mere</span>
            </Link>
            <Link
              to={`/PregnancyDiary?week=${week}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-opacity active:opacity-70"
              style={{
                backgroundColor: hasDiaryEntry ? 'rgba(200,168,130,0.15)' : 'var(--color-bg-subtle)',
                borderColor: 'var(--color-cappuccino)',
                color: 'var(--color-cappuccino)',
              }}
            >
              <BookHeart className="w-4 h-4" />
              <span>{hasDiaryEntry ? 'Se dagbog' : 'Skriv note'}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PregnancyTab() {
  const [profile, setProfile] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const [profiles, entries] = await Promise.all([
          base44.entities.UserProfile.filter({ user_email: user.email }),
          base44.entities.PregnancyDiary.filter({ user_email: user.email }),
        ]);
        setProfile(profiles[0] || null);
        setDiaryEntries(entries);
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

  // Map diary entries by week
  const diaryByWeek = diaryEntries.reduce((acc, e) => { acc[e.week] = e; return acc; }, {});

  // Count total diary entries
  const entryCount = diaryEntries.length;

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

      {/* Hero / Diary CTA */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookHeart className="w-5 h-5 text-white/70" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Graviditetsdagbog</span>
            </div>
            <h2 className="text-2xl font-light text-white leading-snug mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {isPregnant ? `Du er i uge ${currentWeek}` : 'Din graviditetsdagbog'}
            </h2>
            <p className="text-white/60 text-sm">
              {entryCount > 0
                ? `${entryCount} ${entryCount === 1 ? 'note' : 'noter'} gemt`
                : 'Ingen noter endnu'}
            </p>
          </div>

          {/* Progress ring */}
          {isPregnant && (
            <div className="flex-shrink-0 relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="22" fill="none"
                  stroke="rgba(255,255,255,0.85)" strokeWidth="4"
                  strokeDasharray={`${Math.min(100, ((currentWeek - 4) / 38) * 100) * 1.382} 138.2`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-medium" style={{ fontSize: '11px' }}>
                {Math.round(Math.min(100, ((currentWeek - 4) / 38) * 100))}%
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Link
            to={`/PregnancyDiary${isPregnant ? `?week=${currentWeek}` : ''}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity active:opacity-70"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', color: '#5C3317' }}
          >
            <BookHeart className="w-4 h-4" />
            {isPregnant ? `Skriv i dagbog – uge ${currentWeek}` : 'Åbn dagbog'}
          </Link>
        </div>
      </div>

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
        <div className="space-y-2">
          {weeksToShow.map(week => (
            <WeekCard
              key={week}
              week={week}
              data={PREGNANCY_WEEKS[week]}
              isCurrent={isPregnant && week === currentWeek}
              hasDiaryEntry={!!diaryByWeek[week]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}