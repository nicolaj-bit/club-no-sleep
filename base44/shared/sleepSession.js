// ============================================================================
// Eneste kilde til sandhed for beregning af søvnsession-totals.
// Bruges af både frontend (LiveSleepTracker, SleepHistory, SleepSummaryCard)
// og backend (manageSleepSession, analyzeSleepLogs).
//
// En session består af: session_start, en liste af perioder (type: sleep|awake,
// start, end), og session_end. Den åbne/nuværende periode har end: null.
// Timeren beregnes ALTID ud fra tidsstempler (nu − periode.start), så tiden
// er korrekt selvom appen har været lukket eller telefonen slukket.
// ============================================================================

// Beregner samlet søvn, samlet vågen og antal opvågninger for en session.
// Hvis en periode ikke har 'end' (den nuværende), bruges 'now' som sluttid.
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

// Returnerer den nuværende (åbne) periode, eller null.
export function getCurrentPhase(session) {
  const periods = session?.periods || [];
  return periods.find(p => p && !p.end) || null;
}

// Returnerer start-tidsstemplet for den nuværende periode (til timer-beregning).
export function getCurrentPhaseStart(session) {
  const phase = getCurrentPhase(session);
  return phase ? phase.start : null;
}

// Formaterer millisekunder som TT:MM:SS (til live timer).
export function formatTimer(ms) {
  const totalSec = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Formaterer et ISO-tidsstempel som HH.MM (dansk klokkformat).
export function formatClockHm(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
}

// Formaterer millisekunder som "X t. Y min.".
export function formatHoursMinutes(ms) {
  const totalMin = Math.floor(Math.max(0, ms) / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h} t. ${m} min.`;
}