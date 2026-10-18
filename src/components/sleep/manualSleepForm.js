import { format } from 'date-fns';
import { buildManualPeriods } from '@/lib/manualSleepPeriods';

// Hjælpere til skemaet for manuel søvn. Tider indtastes som lokale HH:mm på
// den valgte dato; krydser de midnat, forstås de som dagen efter.

const at = (date, time) => new Date(`${date}T${time}`);
const nextDay = (d) => { const n = new Date(d.getTime()); n.setDate(n.getDate() + 1); return n; };
const hm = (iso) => format(new Date(iso), 'HH:mm');

export function emptyForm() {
  return { sleepType: 'night', date: format(new Date(), 'yyyy-MM-dd'), startTime: '', endTime: '', wakings: [], note: '' };
}

export function formFromLog(log) {
  return {
    sleepType: log.sleep_type === 'nap' ? 'nap' : 'night',
    date: log.date,
    startTime: hm(log.session_start),
    endTime: hm(log.session_end),
    wakings: (log.periods || [])
      .filter(p => p.type === 'awake' && p.end)
      .map(p => ({ from: hm(p.start), to: hm(p.end) })),
    note: log.parent_note || '',
  };
}

// Returnerer { valid, startIso, endIso, wakings, endsNextDay, endsEarly, periods }
export function resolveForm(form) {
  if (!form.date || !form.startTime || !form.endTime) return { valid: false };
  const start = at(form.date, form.startTime);
  let end = at(form.date, form.endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return { valid: false };
  if (end <= start) end = nextDay(end);

  const wakings = [];
  for (const w of form.wakings) {
    if (!w.from || !w.to) continue;
    let from = at(form.date, w.from);
    if (from < start) from = nextDay(from);
    let to = at(form.date, w.to);
    while (to <= from) to = nextDay(to);
    wakings.push({ start: from.toISOString(), end: to.toISOString() });
  }

  const startIso = start.toISOString();
  const endIso = end.toISOString();
  return {
    valid: true,
    startIso,
    endIso,
    wakings,
    endsNextDay: end.toDateString() !== start.toDateString(),
    endsEarly: end.getHours() < 12,
    periods: buildManualPeriods(startIso, endIso, wakings),
  };
}