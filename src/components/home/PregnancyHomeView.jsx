import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { differenceInWeeks, differenceInDays } from 'date-fns';
import { useLanguage } from '@/components/ui/LanguageContext';
import { ChevronRight, Heart, BookOpen, Calendar, Baby, Sparkles, ArrowRight, BookHeart } from 'lucide-react';
import NotificationBell from '@/components/ui/NotificationBell';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import { PREGNANCY_WEEKS } from '@/components/knowledge/pregnancyWeekData';

function getPregnancyWeek(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  const daysLeft = differenceInDays(due, today);
  if (daysLeft < 0) return null;
  const weeksLeft = Math.ceil(daysLeft / 7);
  const currentWeek = 40 - weeksLeft;
  return { currentWeek: Math.max(1, Math.min(42, currentWeek)), weeksLeft, daysLeft };
}

function ProgressRing({ week }) {
  const pct = Math.min(1, week / 40);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <svg width="100" height="100" className="transform -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="white" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function getGreeting(lang, name) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) greeting = lang === 'da' ? 'Godmorgen' : 'Good morning';
  else if (hour >= 12 && hour < 17) greeting = lang === 'da' ? 'Godeftermiddag' : 'Good afternoon';
  else if (hour >= 17 && hour < 21) greeting = lang === 'da' ? 'Godaften' : 'Good evening';
  else greeting = lang === 'da' ? 'Godnat' : 'Good night';
  return `${greeting}, ${name} 🤍`;
}

export default function PregnancyHomeView({ profile, user, posts = [] }) {
  const { t, lang } = useLanguage();
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  const displayName = profile?.display_name || user?.full_name || (lang === 'da' ? 'kommende mor' : 'mom-to-be');
  const greeting = getGreeting(lang, displayName);

  const pregnancy = profile?.child_due_date ? getPregnancyWeek(profile.child_due_date) : null;
  const dueDate = profile?.child_due_date ? new Date(profile.child_due_date) : null;
  const dueDateStr = dueDate ? format(dueDate, 'd. MMMM yyyy', { locale: lang === 'en' ? enUS : da }) : null;

  const week = pregnancy?.currentWeek ?? null;
  const weekData = week !== null ? PREGNANCY_WEEKS[week] || PREGNANCY_WEEKS[Math.min(42, Math.max(4, week))] : null;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] capitalize mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{todayStr}</p>
            <h1 className="text-4xl font-light leading-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{greeting}</h1>
          </div>
          {user && <NotificationBell userEmail={user.email} />}
        </div>
      </div>

      {/* Pregnancy week hero card */}
      {pregnancy && (
        <div className="mx-5 mb-5">
          <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 100, height: 100 }}>
                <ProgressRing week={pregnancy.currentWeek} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{pregnancy.currentWeek}</span>
                  <span className="text-white/60 text-[10px] uppercase tracking-widest">{lang === 'da' ? 'uge' : 'week'}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1">
                  {lang === 'da' ? 'Din graviditet' : 'Your pregnancy'}
                </p>
                <p className="text-white text-xl font-light leading-snug" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  {lang === 'da' ? `Uge ${pregnancy.currentWeek} af 40` : `Week ${pregnancy.currentWeek} of 40`}
                </p>
                {pregnancy.weeksLeft > 0 ? (
                  <p className="text-white/70 text-sm mt-1">
                    {pregnancy.weeksLeft === 1
                      ? (lang === 'da' ? '1 uge til termin' : '1 week until due')
                      : (lang === 'da' ? `${pregnancy.weeksLeft} uger til termin` : `${pregnancy.weeksLeft} weeks until due`)}
                  </p>
                ) : (
                  <p className="text-white/70 text-sm mt-1">{lang === 'da' ? '🎉 Termin er nær!' : '🎉 Due date is near!'}</p>
                )}
                {dueDateStr && (
                  <p className="text-white/50 text-xs mt-0.5">📅 {dueDateStr}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ugentlig milepæl */}
      {weekData && week !== null && (
        <div className="mx-5 mb-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? `Uge ${week} – hvad sker der?` : `Week ${week} – what's happening?`}
            </p>
          </div>

          {/* Baby */}
          <div className="rounded-2xl border overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
                  <Baby className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>
                  {lang === 'da' ? 'Babyen' : 'Your baby'}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', lineHeight: '1.6' }}>
                {weekData.baby}
              </p>
            </div>
          </div>

          {/* Mor */}
          <div className="rounded-2xl border overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>
                  {lang === 'da' ? 'Din krop' : 'Your body'}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', lineHeight: '1.6' }}>
                {weekData.mom}
              </p>
            </div>
          </div>

          {/* Tip */}
          <div className="rounded-2xl px-4 py-3 mb-3 border" style={{ backgroundColor: 'var(--color-bg-subtle)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-cappuccino)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-cappuccino)' }}>
                {lang === 'da' ? 'Ugens tip' : 'Tip of the week'}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{weekData.tip}</p>
          </div>

          {/* Læs mere om ugen */}
          <Link
            to={`/PregnancyWeekDetail?week=${week}`}
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl font-medium text-sm transition-opacity active:opacity-70"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '16px' }}>
              {lang === 'da' ? `Læs alt om uge ${week}` : `Read all about week ${week}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Dagbog CTA */}
      {week !== null && (
        <div className="mx-5 mb-5">
          <Link
            to={`/PregnancyDiary?week=${week}`}
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border active:opacity-70"
            style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
                <BookHeart className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Min dagbog</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Gem minder & mavebilleder fra uge {week}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="mx-5 mb-5 grid grid-cols-2 gap-3">
        <Link to={createPageUrl('Knowledge')} className="rounded-2xl p-4 border flex items-center gap-3 active:opacity-70" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'da' ? 'Viden' : 'Knowledge'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? 'Alle uger' : 'All weeks'}
            </p>
          </div>
        </Link>
        <Link to={createPageUrl('Calendar')} className="rounded-2xl p-4 border flex items-center gap-3 active:opacity-70" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'da' ? 'Kalender' : 'Calendar'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? 'Dine aftaler' : 'Your events'}
            </p>
          </div>
        </Link>
      </div>

      {/* Kommende begivenheder */}
      {user && (
        <div className="mx-5 mb-5">
          <UpcomingEventCard userEmail={user.email} fullWidth />
        </div>
      )}

      {/* Relevante blogindlæg */}
      <AIRelevantPosts profile={profile} allPosts={posts} />
    </div>
  );
}