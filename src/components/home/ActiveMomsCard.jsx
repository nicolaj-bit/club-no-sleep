import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';

function isNightTime() {
  const h = new Date().getHours();
  // Live: 20:00–06:00 (incl.)
  return h >= 20 || h < 6;
}

export default function ActiveMomsCard() {
  const { lang } = useLanguage();
  const [count, setCount] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const isLive = isNightTime();

  useEffect(() => {
    const load = () => {
      if (isLive) {
        // Live: mødre der er online lige nu
        base44.entities.UserProfile.filter({ profile_label: 'mor', is_online: true }).then(profiles => {
          setCount(profiles.length);
          setAvatars((profiles || []).filter(p => p.profile_image).slice(0, 3).map(p => p.profile_image));
        }).catch(() => setCount(0));
      } else {
        // Dagtid: mødre der var aktive i den seneste live-periode (har last_active indenfor de seneste 10 timer)
        const since = new Date();
        since.setHours(since.getHours() - 10);
        base44.entities.UserProfile.filter({ profile_label: 'mor' }).then(profiles => {
          const active = profiles.filter(p => {
            if (!p.last_active) return false;
            return new Date(p.last_active) >= since;
          });
          setCount(active.length);
          setAvatars((active || []).filter(p => p.profile_image).slice(0, 3).map(p => p.profile_image));
        }).catch(() => setCount(0));
      }
    };
    load();
    // Refresh hvert minut
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayCount = count ?? '...';
  const extra = (count ?? 0) > 3 ? count - 3 : 0;

  const label = lang === 'da' ? 'Et lys i mørket' : 'A light in the dark';

  const headline = isLive
    ? (lang === 'da' ? `Der er ${displayCount} mødre vågne` : `${displayCount} moms are awake`)
    : (lang === 'da' ? `Der var ${displayCount} mødre vågne` : `${displayCount} moms were awake`);

  // Placeholder avatars når ingen billeder
  const placeholderImages = [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=64&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&q=80',
  ];

  const displayAvatars = avatars.length > 0 ? avatars : placeholderImages;

  return (
    <Link to={createPageUrl('Community')} className="block active:opacity-70">
      <div
        className="rounded-2xl px-4 py-3"
        style={{ background: 'linear-gradient(135deg, var(--color-bg-card), var(--color-bg-subtle))', border: '1px solid var(--color-border)' }}
      >
        <p className="text-[13px] font-medium italic mb-1.5" style={{ color: 'var(--color-accent)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {label}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-semibold leading-snug" style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {headline}
              {isLive && <span className="ml-1.5 text-sm" style={{ color: '#E8B4B8' }}>●</span>}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? 'Du er ikke alene' : "You're not alone"} <span style={{ color: 'var(--color-accent)' }}>♥</span>
            </p>
          </div>

          {/* Avatar stack */}
          {(count ?? 0) > 0 && (
            <div className="flex items-center flex-shrink-0">
              <div className="flex -space-x-2.5">
                {(count ?? 0) > 4 ? (
                  <>
                    {displayAvatars.slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border-2 overflow-hidden"
                        style={{ borderColor: 'var(--color-bg-card)' }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div
                      className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                      style={{ borderColor: 'var(--color-bg-card)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                    >
                      +{count - 3}
                    </div>
                  </>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                    style={{ borderColor: 'var(--color-bg-card)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
                         >
                           +{count}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}