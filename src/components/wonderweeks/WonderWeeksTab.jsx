import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getAgeInWeeks, getCurrentWonderWeek, wonderWeeks } from '@/components/wonderweeks/wonderweeksData';
import { ChevronRight, Sparkles, Clock } from 'lucide-react';

export default function WonderWeeksTab() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) base44.auth.me().then(setUser).catch(() => {});
    });
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfileWW', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const ageInWeeks = getAgeInWeeks(profile?.child_due_date, profile?.child_birthdate);
  const currentWW = ageInWeeks !== null ? getCurrentWonderWeek(ageInWeeks) : null;

  const getStatus = (ww) => {
    if (ageInWeeks === null) return 'unknown';
    if (ageInWeeks >= ww.weekEnd + 2) return 'complete';
    if (ageInWeeks >= ww.weekStart - 1 && ageInWeeks <= ww.weekEnd + 1) return 'active';
    if (ageInWeeks < ww.weekStart) return 'upcoming';
    return 'complete';
  };

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2E1A 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-2xl mb-1">🐯</p>
          <h2 className="text-lg font-semibold text-white mb-1">Tigerspring</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            De 10 store udviklingsspring i dit barns første leveår. Tider beregnes fra terminsdatoen.
          </p>
          {!profile?.child_due_date && (
            <Link
              to={createPageUrl('Profile')}
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              Tilføj terminsdato i profil <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </div>

      {/* Wonder Weeks list */}
      <div className="space-y-2">
        {wonderWeeks.map((ww) => {
          const status = getStatus(ww);
          const isActive = status === 'active';
          const isComplete = status === 'complete';
          const isUpcoming = status === 'upcoming' || status === 'unknown';

          return (
            <Link
              key={ww.number}
              to={createPageUrl('ArticleDetail') + `?category=Tigerspring&leap=${ww.number}`}
              className="flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.99]"
              style={{
                backgroundColor: isActive ? `${ww.color}12` : 'var(--color-bg-card)',
                borderColor: isActive ? ww.color : 'var(--color-border)',
                borderWidth: isActive ? '1.5px' : '1px',
                opacity: isComplete ? 0.45 : 1,
              }}
            >
              {/* Emoji */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: isComplete ? 'var(--color-bg-subtle)' : `${ww.color}20` }}
              >
                {isComplete ? '✓' : ww.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    Uge {ww.weekStart}
                  </span>
                  {isActive && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white flex items-center gap-1"
                      style={{ backgroundColor: ww.color }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Nu
                    </span>
                  )}
                  {isUpcoming && ageInWeeks !== null && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <Clock className="w-3 h-3" />
                      om {ww.weekStart - ageInWeeks} uger
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm leading-snug truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {ww.name}
                </p>
                <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                  {ww.shortDescription}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}