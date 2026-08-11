// ============================================================================
// Eneste kilde til sandhed for gestationsalder-beregning.
// Bruges af både frontend (PregnancyHomeView, PregnancyWeeks, PregnancyTab)
// og backend (pregnancyWeeklyNotification) — importer herfra, lad være med at
// kopiere formlen.
//
// gaDays = 280 - daysUntilDue   (280 dage = 40 uger fuld termin)
// completedWeeks = floor(gaDays / 7)
// days = gaDays % 7
// ordinal (ugen man ER i) = completedWeeks + 1
// Parentes-format: `${completedWeeks}+${days}` — starter på +0 SAMME dag som
// ordinal-ugen skifter.
//
// Eksempel: første dag i uge 39 → completedWeeks=38, days=0 → "uge 39 (38+0)".
// Dagene tæller op til 38+6; ved 39+0 skifter ordinal til uge 40.
// ============================================================================

export function getGestationalAge(dueDateStr, now) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const today = now ? new Date(now) : new Date();
  today.setHours(0, 0, 0, 0);
  const ms = due.getTime() - today.getTime();
  const daysUntilDue = Math.round(ms / (1000 * 60 * 60 * 24));
  const gaDays = 280 - daysUntilDue;
  const completedWeeks = Math.floor(gaDays / 7);
  const days = gaDays % 7;
  const ordinal = completedWeeks + 1;
  return { gaDays, completedWeeks, days, ordinal, daysUntilDue };
}

// "TERMIN OM X uger" — hele uger til termin.
export function weeksUntilDue(dueDateStr, now) {
  const ga = getGestationalAge(dueDateStr, now);
  if (!ga) return null;
  return Math.max(0, Math.floor(ga.daysUntilDue / 7));
}