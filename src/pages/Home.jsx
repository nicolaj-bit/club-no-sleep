import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import WonderWeekCard from '@/components/wonderweeks/WonderWeekCard';
import { getAgeInWeeks, getCurrentWonderWeek } from '@/components/wonderweeks/wonderweeksData';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import ChildDevelopmentCard from '@/components/home/ChildDevelopmentCard';
import SleepSummaryCard from '@/components/home/SleepSummaryCard';
import UpcomingEventCard from '@/components/home/UpcomingEventCard';
import AIRelevantPosts from '@/components/home/AIRelevantPosts';

function getDailyAffirmationIndex() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear;
}

function getGreeting(lang, gender) {
  const hour = new Date().getHours();
  let greeting;
  if (hour >= 5 && hour < 12) {
    greeting = lang === 'da' ? 'Godmorgen' : 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = lang === 'da' ? 'Godeftermiddag' : 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = lang === 'da' ? 'Godaften' : 'Good evening';
  } else {
    greeting = lang === 'da' ? 'Godnat' : 'Good night';
  }
  const suffix = gender === 'male' ? (lang === 'da' ? 'far' : 'dad') : (lang === 'da' ? 'mor' : 'mom');
  return `${greeting}, ${suffix} 🤍`;
}

export default function Home() {
  const { t, lang } = useLanguage();
  const { activeProfile, loading: profileLoading } = useActiveProfile();
  const [user, setUser] = useState(null);
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) base44.auth.me().then(setUser).catch(() => {});
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Redirect to onboarding if no profile exists after loading
  useEffect(() => {
    if (!profileLoading && user && activeProfile === null) {
      window.location.href = createPageUrl('Onboarding');
    }
  }, [profileLoading, user, activeProfile]);

  const { data: posts = [] } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date', 20),
  });

  const profile = activeProfile;

  const ageInWeeks = getAgeInWeeks(profile?.child_due_date, profile?.child_birthdate);
  const wonderWeek = ageInWeeks !== null ? getCurrentWonderWeek(ageInWeeks) : null;

  const affirmationIndex = getDailyAffirmationIndex();
  const affirmation = t.affirmations[affirmationIndex % t.affirmations.length];
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  const greeting = getGreeting(lang, profile?.gender);

  const translatedAffirmations = useTranslation(
    lang === 'da' && affirmation ? [{ text: affirmation }] : []
  );
  const displayAffirmation = lang === 'da' && translatedAffirmations[0]?.text
    ? translatedAffirmations[0].text
    : affirmation;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5">
        <p className="text-xs font-medium uppercase tracking-widest capitalize mb-1" style={{ color: 'var(--color-text-muted)' }}>{todayStr}</p>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'Georgia, serif' }}>{greeting}</h1>
      </div>

      {/* Daily Affirmation */}
      <div className="mx-5 mb-5">
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #C8A882 0%, #7A4F2E 100%)' }}
        >
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-15 bg-white" />
          <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full opacity-10 bg-white" />
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full opacity-20 bg-white" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-3">{t.dailyWord}</p>
          <p className="text-white text-base font-medium leading-relaxed relative z-10" style={{ textWrap: 'pretty' }}>
            {displayAffirmation}
          </p>
        </div>
      </div>

      {/* Child development age pill */}
      <ChildDevelopmentCard profile={profile} />

      {/* Sleep + Calendar row */}
      {user && (
        <div className="mx-5 mb-5 flex gap-3">
          <SleepSummaryCard userEmail={user.email} />
          <UpcomingEventCard userEmail={user.email} />
        </div>
      )}

      {/* Wonder Week Card */}
      {wonderWeek && wonderWeek.status !== 'complete' && (
        <div className="mb-5">
          <WonderWeekCard wonderWeek={wonderWeek} ageInWeeks={ageInWeeks} />
        </div>
      )}

      {/* AI-curated blog posts */}
      <AIRelevantPosts profile={profile} allPosts={posts} />
    </div>
  );
}