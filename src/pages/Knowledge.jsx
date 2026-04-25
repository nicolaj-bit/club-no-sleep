import React, { useState, useEffect } from 'react';
import { useScrollDirection } from '@/components/ui/useScrollDirection';
import PageHeader from '@/components/ui/PageHeader';
import WonderWeeksTab from '@/components/wonderweeks/WonderWeeksTab';
import { useTheme } from '@/components/ui/ThemeProvider';



export default function Knowledge() {
  const headerVisible = useScrollDirection();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Tigerspring" />

      <div className="px-4 pt-5 pb-6">
        <WonderWeeksTab />
      </div>
    </div>
  );
}