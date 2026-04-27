import React, { useState, useRef, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import MilestoneCamera from '@/components/milestones/MilestoneCamera';
import MilestoneFramePicker from '@/components/milestones/MilestoneFramePicker';
import { MILESTONE_FRAMES } from '@/components/milestones/milestonesData';

export default function Milestones() {
  const [selectedFrame, setSelectedFrame] = useState(MILESTONE_FRAMES[0]);
  const [cameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Milepæle" />

      {!cameraOpen ? (
        <MilestoneFramePicker
          frames={MILESTONE_FRAMES}
          selectedFrame={selectedFrame}
          onSelect={setSelectedFrame}
          onOpen={() => setCameraOpen(true)}
        />
      ) : (
        <MilestoneCamera
          frame={selectedFrame}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}