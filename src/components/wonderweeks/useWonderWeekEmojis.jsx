import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { WONDER_WEEKS } from './wonderweeksData';

/**
 * Returns a map of { [number]: emoji } merging DB overrides with defaults.
 */
export function useWonderWeekEmojis() {
  const { data: configs = [] } = useQuery({
    queryKey: ['wonderWeekConfigs'],
    queryFn: () => base44.entities.WonderWeekConfig.list(),
    staleTime: 1000 * 60 * 5,
  });

  const emojiMap = {};
  WONDER_WEEKS.forEach(ww => { emojiMap[ww.number] = ww.emoji; });
  configs.forEach(c => { if (c.emoji) emojiMap[c.number] = c.emoji; });

  return emojiMap;
}