// ============================================================================
// Eneste kilde til sandhed for tigerspring-beregning.
// Bruges af både frontend (WonderWeeksTab, wonderweeksData) og backend
// (checkWonderWeeks) — importer herfra, lad være med at kopiere formlen.
//
// Tigerspring beregnes ALTID ud fra terminsdato (due_date) — aldrig fødselsdato.
// Et tigerspring betragtes som "aktivt" i samme vindue som appen viser:
//   ageInWeeks >= weekStart - 1  &&  ageInWeeks <= weekEnd + 1
// Dette vindue bruges af både notifikation og app-visning, så de er enige om
// HVORNÅR et spring starter, og dermed hvornår notifikationen udløses.
// ============================================================================

export const WONDER_WEEKS = [
  { number: 1,  name: 'Verden åbner sig',     weekStart: 5,  weekEnd: 7  },
  { number: 2,  name: 'Mønstre opdages',      weekStart: 8,  weekEnd: 10 },
  { number: 3,  name: 'Overgange forstås',    weekStart: 12, weekEnd: 14 },
  { number: 4,  name: 'Begivenheder opdages', weekStart: 19, weekEnd: 21 },
  { number: 5,  name: 'Relationer opdages',   weekStart: 26, weekEnd: 30 },
  { number: 6,  name: 'Kategorier opdages',   weekStart: 37, weekEnd: 41 },
  { number: 7,  name: 'Sekvenser forstås',    weekStart: 46, weekEnd: 50 },
  { number: 8,  name: 'Programmer opdages',   weekStart: 55, weekEnd: 61 },
  { number: 9,  name: 'Principper opdages',   weekStart: 71, weekEnd: 77 },
  { number: 10, name: 'Systemer opdages',     weekStart: 75, weekEnd: 86 },
];

// Alder i fulde uger fra terminsdato.
export function getAgeInWeeksFromDue(dueDateStr, now) {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const today = now ? new Date(now) : new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - due.getTime();
  const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7);
  return Math.floor(diffWeeks);
}

// Returnerer nummeret på det tigerspring barnet er i lige nu (eller null),
// givet alder i uger. Bruger samme aktive vindue som app-visningen.
export function getLeapNumberByAge(ageInWeeks) {
  if (ageInWeeks === null || ageInWeeks < 0) return null;
  const active = WONDER_WEEKS.find(
    (ww) => ageInWeeks >= ww.weekStart - 1 && ageInWeeks <= ww.weekEnd + 1
  );
  return active ? active.number : null;
}

// Returnerer nummeret på det tigerspring barnet er i lige nu (eller null),
// givet terminsdato. Convenience-wrapper omkring de to ovenstående.
export function getCurrentLeapNumber(dueDateStr, now) {
  return getLeapNumberByAge(getAgeInWeeksFromDue(dueDateStr, now));
}

export function getLeapByNumber(number) {
  return WONDER_WEEKS.find((ww) => ww.number === number) || null;
}