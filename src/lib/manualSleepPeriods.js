// Frontend-kopi af base44/shared/manualSleepPeriods.js. Skal holdes identisk.
export function buildManualPeriods(startIso, endIso, wakings) {
  const sorted = [...(wakings || [])].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const periods = [];
  const push = (type, start, end) => {
    if (new Date(end).getTime() - new Date(start).getTime() > 0) {
      periods.push({ type, start, end });
    }
  };
  let cursor = startIso;
  for (const w of sorted) {
    push('sleep', cursor, w.start);
    push('awake', w.start, w.end);
    cursor = w.end;
  }
  push('sleep', cursor, endIso);
  return periods;
}