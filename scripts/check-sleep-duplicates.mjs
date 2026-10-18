// ============================================================================
// Holder frontend-kopierne identiske med den delte søvnlogik.
//
// Hvorfor de findes
// -----------------
// base44/shared/sleepSession.js er eneste kilde til sandhed for søvnberegninger.
// Flere frontend-filer importerer direkte derfra, og det virker i buildet — men
// Base44s redigeringsværktøj afviser NYE frontend-filer, der gør det. Derfor
// måtte den manuelle søvnlog have kopier i src/lib/.
//
// Kopierne er identiske i dag. Risikoen er, at de skrider fra hinanden: så viser
// skemaet ét tal til moren, mens der gemmes et andet. Dette script sammenligner
// dem på opførsel og ikke på tekst, så kommentarer og formatering må gerne være
// forskellige — resultaterne må ikke.
//
// Køres af .github/workflows/checks.yml ved hvert push.
// ============================================================================
import { buildManualPeriods as sharedBuild } from '../base44/shared/manualSleepPeriods.js';
import { buildManualPeriods as clientBuild } from '../src/lib/manualSleepPeriods.js';
import {
  computeSessionTotals as sharedTotals,
  formatHoursMinutes as sharedFormat,
} from '../base44/shared/sleepSession.js';
import {
  computeSessionTotals as clientTotals,
  formatHoursMinutes as clientFormat,
} from '../src/lib/sleepSessionTotals.js';

const iso = (dayHourMinute) => new Date(`2026-10-17T${dayHourMinute}:00Z`).toISOString();
const problems = [];

function compare(label, a, b) {
  const left = JSON.stringify(a);
  const right = JSON.stringify(b);
  if (left !== right) {
    problems.push(`${label}\n    delt:    ${left}\n    kopi:    ${right}`);
  }
}

// --- buildManualPeriods ---------------------------------------------------
const periodCases = [
  ['uden opvågninger', iso('20:30'), iso('23:45'), []],
  ['én opvågning', iso('20:30'), iso('23:45'), [{ start: iso('22:00'), end: iso('22:20') }]],
  ['to opvågninger', iso('20:30'), iso('23:45'), [
    { start: iso('21:00'), end: iso('21:10') },
    { start: iso('22:00'), end: iso('22:20') },
  ]],
  ['opvågninger i omvendt rækkefølge', iso('20:30'), iso('23:45'), [
    { start: iso('22:00'), end: iso('22:20') },
    { start: iso('21:00'), end: iso('21:10') },
  ]],
  ['opvågning helt i starten', iso('20:30'), iso('23:45'), [
    { start: iso('20:30'), end: iso('20:50') },
  ]],
  ['opvågning helt til sidst', iso('20:30'), iso('23:45'), [
    { start: iso('23:20'), end: iso('23:45') },
  ]],
  ['to opvågninger i forlængelse af hinanden', iso('20:30'), iso('23:45'), [
    { start: iso('21:00'), end: iso('21:10') },
    { start: iso('21:10'), end: iso('21:30') },
  ]],
  ['tom liste af opvågninger', iso('20:30'), iso('20:31'), undefined],
];

for (const [label, start, end, wakings] of periodCases) {
  compare(
    `buildManualPeriods — ${label}`,
    sharedBuild(start, end, wakings),
    clientBuild(start, end, wakings)
  );
}

// --- computeSessionTotals -------------------------------------------------
const NOW = new Date('2026-10-17T23:00:00Z').getTime();
const totalsCases = [
  ['tom session', { periods: [] }],
  ['uden periods-felt', {}],
  ['kun søvn', { periods: sharedBuild(iso('20:30'), iso('23:45'), []) }],
  ['søvn og opvågninger', {
    periods: sharedBuild(iso('20:30'), iso('23:45'), [
      { start: iso('21:00'), end: iso('21:10') },
      { start: iso('22:00'), end: iso('22:20') },
    ]),
  }],
  ['åben periode uden end', { periods: [{ type: 'sleep', start: iso('22:00'), end: null }] }],
  ['periode uden start springes over', { periods: [{ type: 'sleep' }, { type: 'awake', start: iso('21:00'), end: iso('21:10') }] }],
];

for (const [label, session] of totalsCases) {
  compare(
    `computeSessionTotals — ${label}`,
    sharedTotals(session, NOW),
    clientTotals(session, NOW)
  );
}

// --- formatHoursMinutes ---------------------------------------------------
for (const ms of [0, 59_000, 60_000, 3_600_000, 26_400_000, -5_000]) {
  compare(`formatHoursMinutes — ${ms} ms`, sharedFormat(ms), clientFormat(ms));
}

// --- Resultat -------------------------------------------------------------
if (problems.length > 0) {
  console.error('FEJL: frontend-kopierne i src/lib/ opfører sig ikke som den delte søvnlogik.\n');
  for (const p of problems) console.error('  - ' + p + '\n');
  console.error('Ret kopierne i Base44, så de igen svarer til base44/shared/.');
  console.error('Filerne er:');
  console.error('  src/lib/manualSleepPeriods.js  ↔  base44/shared/manualSleepPeriods.js');
  console.error('  src/lib/sleepSessionTotals.js  ↔  base44/shared/sleepSession.js');
  process.exit(1);
}

console.log(
  `Søvnlogikken er ens begge steder (${periodCases.length + totalsCases.length + 6} tilfælde sammenlignet).`
);
