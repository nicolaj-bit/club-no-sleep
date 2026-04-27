import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function ActiveMomsCard() {
  const { lang } = useLanguage();
  const [count, setCount] = useState(null);
  const [avatars, setAvatars] = useState([]);

  useEffect(() => {
    base44.entities.UserProfile.filter({ profile_label: 'mor', is_online: true }).then(profiles => {
      setCount(profiles.length);
      setAvatars(profiles.filter(p => p.profile_image).slice(0, 3).map(p => p.profile_image));
    }).catch(() => setCount(0));
  }, []);

  const displayCount = count ?? '...';
  const extra = count > 3 ? count - 3 : 0;

  return (
    <Link to={createPageUrl('Community')} className="block active:opacity-70">
      <div
        className="rounded-2xl px-4 py-3"
        style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'da' ? 'MØDRE VÅGER LIGE NU' : 'MOMS AWAKE RIGHT NOW'}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold leading-snug" style={{ color: 'var(--color-text-primary)' }}>
              {lang === 'da' ? `Der er ${displayCount} mødre vågne` : `${displayCount} moms are awake`}
              {' '}
              <span style={{ color: '#E8B4B8' }}>●</span>
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'da' ? 'Du er ikke alene' : "You're not alone"} ♥
            </p>
          </div>

          {/* Avatar stack */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {avatars.length > 0 ? avatars.map((img, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 overflow-hidden"
                  style={{ borderColor: 'var(--color-bg)' }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              )) : [0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: 'var(--color-bg)', backgroundColor: '#DCC1B0' }}
                >
                  <span className="text-xs text-white">👤</span>
                </div>
              ))}
            </div>
            {extra > 0 && (
              <div
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center -ml-2 text-xs font-semibold"
                style={{ borderColor: 'var(--color-bg)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)' }}
              >
                +{extra}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}