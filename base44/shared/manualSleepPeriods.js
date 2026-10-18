// ============================================================================
// Bygger periods-listen til en manuelt oprettet søvnsession.
// Bruges af både backend (createManualSleepLog) og frontend (forhåndsvisning),
// så resultatet er identisk med det der gemmes.
//
// Alle perioder får et end. Perioder på nul minutter udelades.
// wakings: [{ start, end }] (ISO-strenge) — antages valideret af kalderen.
// ============================================================================
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