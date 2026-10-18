// Frontend-kopi af computeSessionTotals / formatHoursMinutes fra base44/shared/sleepSession.js
// Skal holdes identisk med den delte fil.
export function computeSessionTotals(session, nowMs) {
  const periods = session?.periods || [];
  let totalSleepMs = 0;
  let totalAwakeMs = 0;
  let wakeCount = 0;
  const now = nowMs || Date.now();
  for (const p of periods) {
    if (!p || !p.start) continue;
    const start = new Date(p.start).getTime();
    const end = p.end ? new Date(p.end).getTime() : now;
    const dur = Math.max(0, end - start);
    if (p.type === 'sleep') {
      totalSleepMs += dur;
    } else if (p.type === 'awake') {
      totalAwakeMs += dur;
      wakeCount += 1;
    }
  }
  return { totalSleepMs, totalAwakeMs, wakeCount };
}

export function formatHoursMinutes(ms) {
  const totalMin = Math.floor(Math.max(0, ms) / 60000);
  return `${Math.floor(totalMin / 60)} t. ${totalMin % 60} min.`;
}