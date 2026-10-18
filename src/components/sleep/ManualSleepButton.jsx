import React, { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { useLanguage } from '@/components/ui/LanguageContext';
import { useSleepSession } from './useSleepSession';
import ManualSleepDialog from './ManualSleepDialog';

// Knap + skema til at tilføje søvn bagud. Skjules mens en session kører.
export default function ManualSleepButton({ user, activeChild }) {
  const { t } = useLanguage();
  const { activeSession } = useSleepSession(user);
  const [open, setOpen] = useState(false);

  if (!user || activeSession) return null;

  return (
    <div className="px-4 py-3 max-w-lg mx-auto">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
        style={{ backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
      >
        <PencilLine className="w-4 h-4" />
        {t.manualAddSleep}
      </button>
      <ManualSleepDialog open={open} onOpenChange={setOpen} user={user} activeChild={activeChild} />
    </div>
  );
}