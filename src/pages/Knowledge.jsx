import React, { useState, useEffect } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import WonderWeeksTab from '@/components/wonderweeks/WonderWeeksTab';
import { useTheme } from '@/components/ui/ThemeProvider';



export default function Knowledge() {
  const headerVisible = useScrollDirection();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b transition-transform duration-300"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        <div className="px-4 py-3">
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