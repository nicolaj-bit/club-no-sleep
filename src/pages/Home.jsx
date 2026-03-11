import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { da, enUS } from 'date-fns/locale';
import BlogCard from '@/components/blog/BlogCard';
import WonderWeekCard from '@/components/wonderweeks/WonderWeekCard';
import { getAgeInWeeks, getCurrentWonderWeek } from '@/components/wonderweeks/wonderweeksData';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useTranslation } from '@/components/hooks/useTranslation';

function getDailyAffirmationIndex() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear;
}

function getGreeting(lang, gender) {
  const hour = new Date().getHours();
  let greeting;
  
  if (hour >= 5 && hour < 12) {
    greeting = lang === 'da' ? 'God morgen' : 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = lang === 'da' ? 'God eftermiddag' : 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = lang === 'da' ? 'God aften' : 'Good evening';
  } else {
    greeting = lang === 'da' ? 'God nat' : 'Good night';
  }
  
  const suffix = gender === 'male' ? (lang === 'da' ? 'far' : 'dad') : (lang === 'da' ? 'mor' : 'mom');
  return `${greeting}, ${suffix} 🤍`;
}

export default function Home() {
  const headerVisible = useScrollDirection();
  const { t, lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) base44.auth.me().then(setUser).catch(() => {});
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.filter({ published: true }, '-published_date', 3),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfileHome', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      const p = profiles[0] || null;
      // Ny bruger uden profil → send til onboarding
      if (!p) {
        window.location.href = createPageUrl('Onboarding');
      }
      return p;
    },
    enabled: !!user?.email,
  });

  const ageInWeeks = getAgeInWeeks(profile?.child_due_date, profile?.child_birthdate);
  const wonderWeek = ageInWeeks !== null ? getCurrentWonderWeek(ageInWeeks) : null;

  const affirmationIndex = getDailyAffirmationIndex();
  const affirmation = t.affirmations[affirmationIndex % t.affirmations.length];
  const todayStr = format(new Date(), "EEEE 'd.' d. MMMM", { locale: lang === 'en' ? enUS : da });
  
  const greeting = getGreeting(lang, profile?.gender);

  // Translate affirmation to Danish when in Danish mode
  const translatedAffirmations = useTranslation(
    lang === 'da' && affirmation ? [{ text: affirmation }] : []
  );
  const displayAffirmation = lang === 'da' && translatedAffirmations[0]?.text ? translatedAffirmations[0].text : affirmation;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
         <p className="text-sm capitalize" style={{ color: 'var(--color-text-muted)' }}>{todayStr}</p>
         <h1 className="text-2xl font-semibold mt-0.5" style={{ color: 'var(--color-text-primary)' }}>{greeting}</h1>
       </div>

      {/* Daily Affirmation */}
      <div className="mx-5 mb-8">
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #C8A882 0%, #A0785A 100%)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 bg-white -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full opacity-10 bg-white translate-y-6 -translate-x-6" />
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">{t.dailyWord}</p>
           <p className="text-white text-lg font-medium leading-relaxed relative z-10">
             {displayAffirmation}
           </p>
        </div>
      </div>

      {/* Wonder Week Card */}
      {wonderWeek && wonderWeek.status !== 'complete' && (
        <WonderWeekCard wonderWeek={wonderWeek} ageInWeeks={ageInWeeks} />
      )}

      {/* Blog Posts */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.fromBlog}</h2>
          <Link to={createPageUrl('Blog')} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t.seeAll}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-bg-subtle)' }} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} variant="default" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}