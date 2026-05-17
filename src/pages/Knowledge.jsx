import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import WonderWeeksTab from '@/components/wonderweeks/WonderWeeksTab';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';

export default function Knowledge() {
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Tigerspring" />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="px-4 pt-5 pb-6">
          <WonderWeeksTab />
        </div>
      </PullToRefresh>
    </div>
  );
}