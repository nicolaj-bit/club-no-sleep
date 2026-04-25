import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import { ArrowLeft } from 'lucide-react';
import WonderWeeksTab from '@/components/wonderweeks/WonderWeeksTab';
import { useTheme } from '@/components/ui/ThemeProvider';



export default function Knowledge() {
  const navigate = useNavigate();
  const headerVisible = useScrollDirection();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-transform duration-300"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-60"
            style={{ backgroundColor: 'var(--color-bg-subtle)' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <h1
            className="text-2xl font-light"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'Cormorant Garamond, Georgia, serif', letterSpacing: '0.06em' }}
          >
            Tigerspring
          </h1>
        </div>
      </header>

      <div className="px-4 pt-5 pb-6">
        <WonderWeeksTab />
      </div>
    </div>
  );
}