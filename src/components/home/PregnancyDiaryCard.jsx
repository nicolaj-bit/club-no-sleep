import React from 'react';
import { Link } from 'react-router-dom';
import { BookHeart } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function PregnancyDiaryCard({ week }) {
  const { lang } = useLanguage();

  return (
    <Link
      to={week ? `/PregnancyDiary?week=${week}` : '/PregnancyDiary'}
      className="flex-1 rounded-2xl p-4 border flex flex-col gap-3 active:opacity-70 transition-opacity min-h-[90px]"
      style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(145deg, #5C3317 0%, #A0785A 100%)' }}>
        <BookHeart className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {lang === 'da' ? 'Dagbog' : 'Diary'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {week
            ? (lang === 'da' ? `Uge ${week} – gem minder` : `Week ${week} – save memories`)
            : (lang === 'da' ? 'Din graviditetsdagbog' : 'Your pregnancy diary')}
        </p>
      </div>
    </Link>
  );
}