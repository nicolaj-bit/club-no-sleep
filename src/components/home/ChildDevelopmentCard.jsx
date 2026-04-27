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
    const totalDays = differenceInDays(today, birthdate);
    const weeks = differenceInWeeks(today, birthdate);
    const days = totalDays % 7;
    if (weeks < 16) {
      return {
        big: `${weeks}`,
        unit: `${weeks !== 1 ? t.weekPlural : t.weekSingular}`,
        daysExtra: days,
        subtitle: t.old,
        isPregnant: false,
        currentWeek: null,
        daysRem: 0,
      };
    }
    const months = Math.floor(weeks / 4.33);
    const remainingDays = totalDays - Math.floor(months * 4.33 * 7);
    return { big: `${months}`, unit: t.monthsShort, daysExtra: Math.max(0, remainingDays), subtitle: t.old, isPregnant: false, currentWeek: null, daysRem: 0 };
  }

  if (dueDate) {
    const daysLeft = differenceInDays(dueDate, today);
    if (daysLeft > 0) {
      const totalPregnancyDays = 40 * 7;
      const daysFromStart = totalPregnancyDays - daysLeft;
      const currentWeek = Math.floor(daysFromStart / 7) + 1;
      const currentDayInWeek = daysFromStart % 7;
      const weeksLeft = Math.floor(daysLeft / 7);
      const daysRem = daysLeft % 7;
      return {
        big: weeksLeft > 0 ? `${weeksLeft}` : `${daysLeft}`,
        unit: weeksLeft > 0
          ? (weeksLeft !== 1 ? t.weekPlural : t.weekSingular)
          : (daysLeft !== 1 ? t.dayPlural : t.daySingular),
        daysExtra: 0,
        subtitle: t.untilDue,
        isPregnant: true,
        currentWeek: Math.max(1, Math.min(42, currentWeek)),
        currentDayInWeek,
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

  // Pregnancy card — elegant full-bleed design
  if (age.isPregnant) {
    return (
      <Link to={`/PregnancyWeekDetail?week=${age.currentWeek}`} className="block mx-5 mb-4 active:opacity-90">
        <div className="rounded-3xl overflow-hidden relative" style={{ height: 220 }}>
          {/* Full background photo */}
          <img
            src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/112ea1336_1.jpg"
            alt="gravid"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          {/* Dark gradient overlay — left to right + bottom */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(105deg, rgba(30,18,10,0.72) 0%, rgba(30,18,10,0.38) 55%, transparent 100%)' }}
          />

          {/* Content */}
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            {/* Top label */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {lang === 'da' ? 'TERMIN OM' : 'DUE IN'}
            </p>

            {/* Bottom: big number + week pill */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="font-light leading-none"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#fff', fontSize: 76, lineHeight: 1 }}
                >
                  {age.big}
                </span>
                <span
                  className="text-2xl font-light"
                  style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {age.unit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {lang === 'da' ? 'til termin' : 'until due date'}
                </p>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
                >
                  <Baby className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.8)' }} />
                  <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {lang === 'da'
                      ? `Du er i uge ${age.currentWeek} (${age.currentWeek - 1}+${age.currentDayInWeek})`
                      : `Week ${age.currentWeek} (${age.currentWeek - 1}+${age.currentDayInWeek})`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Postnatal — simpelt kort med præcis alder
  const ageLabel = age.daysExtra > 0
    ? `${age.big} ${age.unit} (${parseInt(age.big) - (age.unit === t.monthsShort ? 0 : 1)}+${age.daysExtra})`
    : `${age.big} ${age.unit}`;

  return (
    <Link to={createPageUrl('Knowledge')} className="block mx-5 mb-4 active:opacity-80">
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <Baby className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {lang === 'da'
            ? `Dit barn er i uge ${ageLabel} gammel`
            : `Your child is ${ageLabel} old`}
        </p>
      </div>
    </Link>
  );
}