import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function PregnancyDiaryCard({ week, userEmail }) {
  const { lang } = useLanguage();
  const [hasEntry, setHasEntry] = useState(false);

  useEffect(() => {
    if (!userEmail || !week) return;
    import('@/api/base44Client').then(({ base44 }) => {
      base44.entities.PregnancyDiary.filter({ user_email: userEmail, week }, '-created_date', 1).then(entries => {
        setHasEntry(entries.length > 0);
      }).catch(() => {});
    });
  }, [userEmail, week]);

  return (
    <Link to={week ? `/PregnancyDiary?week=${week}` : '/PregnancyDiary'} className="block flex-1 cursor-pointer">
      <div
        className="rounded-3xl p-4 h-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5C3317 0%, #A0785A 100%)' }}
      >
        <div className="mb-3">
          <BookHeart className="w-5 h-5 text-white/80" />
        </div>
        <p className="text-white/60 text-xs font-medium mb-1">
          {lang === 'da' ? 'Graviditetsdagbog' : 'Pregnancy diary'}
        </p>
        {week ? (
          <>
            <p className="text-white text-sm font-bold leading-snug">
              {lang === 'da' ? `Uge ${week}` : `Week ${week}`}
            </p>
            <p className="text-white/50 text-xs mt-1">
              {hasEntry
                ? (lang === 'da' ? '✓ Skrevet denne uge' : '✓ Written this week')
                : (lang === 'da' ? 'Gem minder →' : 'Save memories →')}
            </p>
          </>
        ) : (
          <p className="text-white/60 text-sm mt-1">
            {lang === 'da' ? 'Skriv i dag →' : 'Write today →'}
          </p>
        )}
      </div>
    </Link>
  );
}