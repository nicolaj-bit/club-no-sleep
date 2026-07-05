import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { differenceInWeeks, differenceInDays, format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Moon, CalendarDays, Baby } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';
import SleepSummaryCard from '@/components/home/SleepSummaryCard';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import ActiveMomsCard from '@/components/home/ActiveMomsCard';
import ChildSwitcher from '@/components/children/ChildSwitcher';

function getPregnancyInfo(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  const daysLeft = differenceInDays(due, today);
  if (daysLeft < 0) return null;
  const weeksLeft = Math.floor(daysLeft / 7);
  const daysRem = daysLeft % 7;
  const currentWeek = 40 - weeksLeft;
  return {
    currentWeek: Math.max(1, Math.min(42, currentWeek)),
    weeksLeft,
    daysLeft,
    daysRem,
  };
}

function getGreeting(lang, name) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) greeting = lang === 'da' ? 'Godmorgen' : 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = lang === 'da' ? 'God eftermiddag' : 'Good afternoon';
  else if (hour >= 17 && hour < 21) greeting = lang === 'da' ? 'Godaften' : 'Good evening';
  else greeting = lang === 'da' ? 'Godnat' : 'Good night';
  return { greeting, name };
}

export default function PregnancyHomeView({ profile, user, posts = [], activeChild }) {
  const { t, lang } = useLanguage();
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  const displayName = profile?.display_name || user?.full_name || (lang === 'da' ? 'kommende mor' : 'mom-to-be');
  const { greeting, name } = getGreeting(lang, displayName);

  // Brug aktivt barn's terminsdato, ellers fald tilbage til profil
  const dueDate = activeChild?.due_date || profile?.child_due_date;
  const childName = activeChild?.name;
  const pregnancy = dueDate ? getPregnancyInfo(dueDate) : null;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <ChildSwitcher />
            <h1 className="text-[38px] font-light leading-tight mt-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {greeting}, {name}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {user && <NotificationBell userEmail={user.email} />}
          </div>
        </div>

      </div>

      {/* Pregnancy Hero Card */}
      {pregnancy && (
        <Link to={`/PregnancyWeekDetail?week=${pregnancy.currentWeek}`} className="block mx-5 mb-4">
          <div
            className="rounded-3xl overflow-hidden relative flex"
            style={{ background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', minHeight: 190 }}
          >
            {/* Left: text */}
            <div className="flex-1 p-5 flex flex-col justify-between z-10">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  {childName && activeChild?.birthdate ? childName.toUpperCase() + ' · ' : ''}{lang === 'da' ? 'TERMIN OM' : 'DUE IN'}
                </p>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-[72px] font-light leading-none" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                    {pregnancy.weeksLeft}
                  </span>
                  <span className="text-2xl font-light" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    {lang === 'da' ? 'uger' : 'weeks'}
                  </span>
                </div>
    
              </div>

              {/* Week pill — bottom */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mt-4 self-start"
                style={{ backgroundColor: 'rgba(255,255,255,0.75)' }}
              >
                <Baby className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                  {lang === 'da'
                    ? `Du er i uge ${pregnancy.currentWeek} (${pregnancy.currentWeek - 1}+${pregnancy.daysRem || 0})`
                    : `Week ${pregnancy.currentWeek}`}
                </span>
              </div>
            </div>

            {/* Right: photo */}
            <div className="relative w-[48%] flex-shrink-0 overflow-hidden rounded-r-3xl">
              <img
                src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/b0c96886b_generated_image.png"
                alt="gravid"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center top' }}
              />
              {/* Fade to left */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, var(--color-bg-card) 0%, transparent 40%)' }}
              />
            </div>
          </div>
        </Link>
      )}

      {/* Sleep + Next appointment row */}
      {user && (
        <div className="mx-5 mb-4 flex gap-3">
          <SleepSummaryCard userEmail={user.email} />
          <UpcomingEventCard userEmail={user.email} />
        </div>
      )}

      {/* Active moms card */}
      <div className="mx-5 mb-4">
        <ActiveMomsCard />
      </div>

      {/* Relevant posts */}
      <div className="mb-2">
        <AIRelevantPosts profile={profile} allPosts={posts} />
      </div>
    </div>
  );
}