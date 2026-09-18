import { useEffect, useState } from 'react';
import { getDailyAffirmationCardIndex } from '@/lib/dailyAffirmation';

// Dagens affirmations-index via kortspils-udvælgelse (se src/lib/dailyAffirmation.js).
export function useDailyAffirmationIndex(count) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!count) return;
    let cancelled = false;
    getDailyAffirmationCardIndex(count).then(i => {
      if (!cancelled) setIndex(i);
    });
    return () => { cancelled = true; };
  }, [count]);

  return index;
}