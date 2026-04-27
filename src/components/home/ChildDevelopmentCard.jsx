import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { differenceInWeeks, differenceInDays, isAfter } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Baby } from 'lucide-react';

function getAgeDisplay(profile, t) {
  if (!profile) return null;

  const today = new Date();
  const birthdate = profile.child_birthdate ? new Date(profile.child_birthdate) : null;
  const dueDate = profile.child_due_date ? new Date(profile.child_due_date) : null;

  if (birthdate && isAfter(today, birthdate)) {
    const weeks = differenceInWeeks(today, birthdate);
    const days = differenceInDays(today, birthdate) % 7;
    if (weeks < 16) {
      return {
        big: `${weeks}`,
        unit: `${weeks !== 1 ? t.weekPlural : t.weekSingular}`,
        daysExtra: days > 0 ? days : 0,
        subtitle: t.old,
        isPregnant: false,
        currentWeek: null,
        daysRem: 0,
      };
    }
    const months = Math.floor(weeks / 4.33);
    return { big: `${months}`, unit: t.monthsShort, daysExtra: 0, subtitle: t.old, isPregnant: false, currentWeek: null, daysRem: 0 };
  }

  if (dueDate) {
    const daysLeft = differenceInDays(dueDate, today);
    if (daysLeft > 0) {
      const weeksLeft = Math.floor(daysLeft / 7);
      const daysRem = daysLeft % 7;
      const currentWeek = 40 - weeksLeft;
      return {
        big: weeksLeft > 0 ? `${weeksLeft}` : `${daysLeft}`,
        unit: weeksLeft > 0
          ? (weeksLeft !== 1 ? t.weekPlural : t.weekSingular)
          : (daysLeft !== 1 ? t.dayPlural : t.daySingular),
        daysExtra: 0,
        subtitle: t.untilDue,
        isPregnant: true,
        currentWeek: Math.max(1, Math.min(42, currentWeek)),
        daysRem,
      };
    }
  }

  return null;
}

export default function ChildDevelopmentCard({ profile }) {
  const { t, lang } = useLanguage();
  const age = getAgeDisplay(profile, t);
  if (!age) return null;

  // Pregnancy card — præcis som billedet: beige baggrund, foto til højre, tekst til venstre
  if (age.isPregnant) {
    return (
      <Link to={`/PregnancyWeekDetail?week=${age.currentWeek}`} className="block mx-5 mb-4 active:opacity-80">
        <div
          className="rounded-3xl overflow-hidden relative flex"
          style={{ backgroundColor: '#F3E9E1', height: 190 }}
        >
          {/* Left: text */}
          <div className="flex-1 p-5 flex flex-col justify-between z-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: '#808072' }}>
                {lang === 'da' ? 'TERMIN OM' : 'DUE IN'}
              </p>
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span
                  className="font-light leading-none"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16', fontSize: 72, lineHeight: 1 }}
                >
                  {age.big}
                </span>
                <span
                  className="text-2xl font-light"
                  style={{ color: '#2B1F16', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {age.unit}
                </span>
              </div>
              <p className="text-sm" style={{ color: '#7A665A' }}>
                {lang === 'da' ? 'til termin' : 'until due date'}
              </p>
            </div>

            {/* Week pill — bottom left */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mt-4 self-start"
              style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
            >
              <Baby className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#808072' }} />
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#2B1F16' }}>
                {lang === 'da'
                  ? `Du er i uge ${age.currentWeek} (${age.currentWeek - 1}+${age.daysRem || 0})`
                  : `Week ${age.currentWeek}`}
              </span>
            </div>
          </div>

          {/* Right: photo */}
          <div className="relative flex-shrink-0 overflow-hidden rounded-r-3xl" style={{ width: '48%' }}>
            <img
              src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/112ea1336_1.jpg"
              alt="gravid"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center top' }}
            />
            {/* Fade left */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, #F3E9E1 0%, transparent 45%)' }}
            />
          </div>
        </div>
      </Link>
    );
  }

  // Postnatal — simpelt kort
  return (
    <Link to={createPageUrl('Knowledge')} className="block mx-5 mb-4 active:opacity-80">
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-3xl">👶</div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {t.yourChildIs}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)' }}>{age.big}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{age.unit} {t.old}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}