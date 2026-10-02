// ============================================================================
// EN fælles notifikationsmotor for alt barn-relateret indhold:
// tigerspring, graviditetsuger, termin, aldersmilepæle, fødselsdage,
// graviditetsmilepæle — samt kalender-aftaler (dag-før / samme-dag).
//
// Tilstande (options.mode):
//   'dry'  (standard) — ingen afsendelse, ingen skrivning. Returnerer rapport
//                       over hvad der VILLE blive sendt (til test/verifikation).
//   'test' — sender KUN til options.testEmail; for alle andre skrives kun i
//            loggen hvad der ville sendes. Brug til at teste på egen konto.
//   'live' — sender til alle (efter godkendelse).
//
// SIKKERHEDSGRÆNSE: options.cap (standard 200). Hvis en kørsel i test/live
//   ville sende mere end cap notifikationer, afbryder motoren og skriver i
//   loggen i stedet — så en fejl ikke kan spamme alle brugere på én gang.
//
// IDEMPOTENS pr. begivenhed pr. barn via NotificationLog:
//   wonderweek-{n}, wonderweek-{n}-approaching, pregnancy-week-{N},
//   termin, age-{m}m, age-{y}y, preg-{N}.
//   Aftaler bruger eksisterende flag på CalendarEvent (ikke per-barn).
//
// FORÆLDEDE marker (bruges IKKE — se backfillNotificationLog):
//   Child.last_notified_leap, UserProfile.last_notified_pregnancy_week.
// ============================================================================

import { getGestationalAge } from './getGestationalAge.js';
import { WONDER_WEEKS } from './getWonderWeek.js';

const ONESIGNAL_APP_ID = (typeof Deno !== 'undefined') ? Deno.env.get('ONESIGNAL_APP_ID') : undefined;
const REST_API_KEY = (typeof Deno !== 'undefined') ? Deno.env.get('ONESIGNAL_REST_API_KEY') : undefined;

const PREGNANCY_MILESTONE_WEEKS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
const STAGGER_MS = 60_000;
const DAY_MS = 24 * 60 * 60 * 1000;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function childName(child) {
  const n = (child && child.name || '').trim();
  return n || 'dit barn';
}

function daysSince(dateStr, now) {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(now); t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - d.getTime()) / DAY_MS);
}

function isSameDateStr(dateStr, now) {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(now); t.setHours(0, 0, 0, 0);
  return d.getTime() === t.getTime();
}

function isSameDayAsMonthOffset(dateStr, months, now) {
  const base = new Date(dateStr); base.setHours(0, 0, 0, 0);
  const target = new Date(base.getFullYear(), base.getMonth() + months, base.getDate());
  target.setHours(0, 0, 0, 0);
  const t = new Date(now); t.setHours(0, 0, 0, 0);
  return target.getTime() === t.getTime();
}

function isSameDayAsYearOffset(dateStr, years, now) {
  const base = new Date(dateStr); base.setHours(0, 0, 0, 0);
  const target = new Date(base.getFullYear() + years, base.getMonth(), base.getDate());
  target.setHours(0, 0, 0, 0);
  const t = new Date(now); t.setHours(0, 0, 0, 0);
  return target.getTime() === t.getTime();
}

function optIn(profile, type) {
  if (type === 'wonderweek') return profile.wonderweeks_notifications !== false;
  if (type === 'pregnancy-week' || type === 'pregnancy-milestone' || type === 'termin') {
    return profile.notif_pregnancy_weekly !== false;
  }
  if (type === 'age-milestone' || type === 'birthday') {
    return profile.notif_pregnancy_weekly !== false;
  }
  return true;
}

function buildChildEvents(child, now) {
  const events = [];
  const name = childName(child);
  const due = child.due_date;
  const birth = child.birthdate;

  if (due) {
    const ageDays = daysSince(due, now);
    if (ageDays >= 0) {
      for (const ww of WONDER_WEEKS) {
        const startDay = ww.weekStart * 7;
        if (ageDays === startDay - 1) {
          events.push({ type: 'wonderweek', key: `wonderweek-${ww.number}-approaching`, title: 'Tigerspring', message: `${name} går ind i tigerspring ${ww.number} i morgen`, link: '/Knowledge' });
        }
        if (ageDays === startDay) {
          events.push({ type: 'wonderweek', key: `wonderweek-${ww.number}`, title: 'Tigerspring', message: `${name} er nu i tigerspring ${ww.number}`, link: '/Knowledge' });
        }
      }
    }
  }

  if (due && !birth) {
    const ga = getGestationalAge(due, now);
    if (ga && ga.days === 0) {
      const week = ga.ordinal;
      if (week >= 4 && week <= 42) {
        events.push({ type: 'pregnancy-week', key: `pregnancy-week-${week}`, title: `Uge ${week}`, message: `Uge ${week} — ${name}`, link: '/PregnancyWeeks' });
        if (PREGNANCY_MILESTONE_WEEKS.includes(week)) {
          events.push({ type: 'pregnancy-milestone', key: `preg-${week}`, title: `Uge ${week}`, message: `Ny milepæl klar for ${name} — uge ${week}`, link: '/Milestones' });
        }
      }
    }
    if (isSameDateStr(due, now)) {
      events.push({ type: 'termin', key: 'termin', title: 'Termin', message: `I dag er det termin for ${name}`, link: '/PregnancyWeeks' });
    }
  }

  if (birth) {
    for (let m = 1; m <= 11; m++) {
      if (isSameDayAsMonthOffset(birth, m, now)) {
        events.push({ type: 'age-milestone', key: `age-${m}m`, title: `${name} er ${m} måneder`, message: `${name} er ${m} måneder i dag`, link: '/Milestones' });
      }
    }
    for (let m = 13; m <= 23; m++) {
      if (isSameDayAsMonthOffset(birth, m, now)) {
        events.push({ type: 'age-milestone', key: `age-${m}m`, title: `${name} er ${m} måneder`, message: `${name} er ${m} måneder i dag`, link: '/Milestones' });
      }
    }
    for (let y = 1; y <= 3; y++) {
      if (isSameDayAsYearOffset(birth, y, now)) {
        events.push({ type: 'birthday', key: `age-${y}y`, title: `${name} fylder ${y} år`, message: `I dag fylder ${name} ${y} år`, link: '/Milestones' });
      }
    }
  }
  return events;
}

async function sendPush(email, title, message, link) {
  if (!ONESIGNAL_APP_ID || !REST_API_KEY) return false;
  const body = { app_id: ONESIGNAL_APP_ID, include_aliases: { external_id: [email] }, target_channel: 'push', headings: { da: title, en: title }, contents: { da: message, en: message } };
  if (link) body.url = link;
  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${REST_API_KEY}` }, body: JSON.stringify(body) });
    return res.ok;
  } catch (e) { console.error('[notificationEngine] Push fejlede:', e.message); return false; }
}

async function createInApp(base44, email, title, message, link) {
  await base44.asServiceRole.entities.AppNotification.create({ title, message, link: link || '/Calendar', target_emails: [email], published_at: new Date().toISOString() });
}

async function isLogged(base44, childId, type, key) {
  const rows = await base44.asServiceRole.entities.NotificationLog.filter({ childId, type, key });
  return Array.isArray(rows) && rows.length > 0;
}

async function logSent(base44, profilId, childId, type, key) {
  await base44.asServiceRole.entities.NotificationLog.create({ profilId, childId, type, key, sentAt: new Date().toISOString() });
}

function buildReport(plan) {
  const byType = {};
  const byUser = {};
  for (const item of plan) {
    byType[item.type] = (byType[item.type] || 0) + 1;
    if (!byUser[item.email]) byUser[item.email] = { total: 0, byType: {} };
    byUser[item.email].total++;
    byUser[item.email].byType[item.type] = (byUser[item.email].byType[item.type] || 0) + 1;
  }
  const duplicates = [];
  for (const [email, u] of Object.entries(byUser)) {
    for (const [type, count] of Object.entries(u.byType)) {
      if (count > 1) duplicates.push({ email, type, count });
    }
  }
  return { totalWouldSend: plan.length, byType, usersWithNotifications: Object.keys(byUser).length, duplicates };
}

async function buildAppointmentsPlan(profile, profileEvents, familyMap, todayStr, tomorrowStr) {
  const items = [];
  if (profile.notif_calendar_reminder === false) return items;
  const email = profile.user_email;
  for (const event of profileEvents) {
    const eventDateStr = new Date(event.start_datetime).toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
    const timeStr = new Date(event.start_datetime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });
    const partners = event.family_id ? (familyMap[event.family_id] || []).filter((p) => p.user_email !== email).map((p) => p.user_email) : [];
    const ownerName = profile.display_name || profile.username || 'En';

    if (eventDateStr === tomorrowStr && !event.notify_day_before_sent) {
      items.push({ email, profilId: profile.id, childId: null, childName: null, type: 'appointment-day-before', key: `appt-${event.id}-day-before`, title: 'Du har en aftale i morgen', message: `${event.title} kl. ${timeStr}`, link: '/Calendar', kind: 'appointment', eventId: event.id, flagField: 'notify_day_before_sent' });
      for (const pe of partners) items.push({ email: pe, profilId: null, childId: null, childName: null, type: 'appointment-day-before', key: `appt-${event.id}-day-before-${pe}`, title: `${ownerName} har delt en aftale med dig`, message: `${event.title} kl. ${timeStr}`, link: '/Calendar', kind: 'appointment', eventId: null, flagField: null });
    }
    if (eventDateStr === todayStr && !event.notify_same_day_sent) {
      items.push({ email, profilId: profile.id, childId: null, childName: null, type: 'appointment-same-day', key: `appt-${event.id}-same-day`, title: 'Du har en aftale i dag', message: `${event.title} kl. ${timeStr}`, link: '/Calendar', kind: 'appointment', eventId: event.id, flagField: 'notify_same_day_sent' });
      for (const pe of partners) items.push({ email: pe, profilId: null, childId: null, childName: null, type: 'appointment-same-day', key: `appt-${event.id}-same-day-${pe}`, title: `${ownerName} har delt en aftale med dig`, message: `${event.title} kl. ${timeStr}`, link: '/Calendar', kind: 'appointment', eventId: null, flagField: null });
    }
  }
  return items;
}

async function buildChildPlan(base44, profile, userChildren, now) {
  const items = [];
  for (const child of userChildren) {
    const evts = buildChildEvents(child, now);
    for (const e of evts) {
      if (!optIn(profile, e.type)) continue;
      if (await isLogged(base44, child.id, e.type, e.key)) continue;
      items.push({ email: profile.user_email, profilId: profile.id, childId: child.id, childName: childName(child), type: e.type, key: e.key, title: e.title, message: e.message, link: e.link, kind: 'child' });
    }
  }
  return items;
}

async function executeItems(base44, items) {
  let sent = 0;
  const apptItems = items.filter((i) => i.kind === 'appointment');
  const childItems = items.filter((i) => i.kind === 'child');

  for (const item of apptItems) {
    await createInApp(base44, item.email, item.title, item.message, item.link);
    await sendPush(item.email, item.title, item.message, item.link);
    if (item.flagField && item.eventId) {
      await base44.asServiceRole.entities.CalendarEvent.update(item.eventId, { [item.flagField]: true });
    }
    sent++;
    console.log(`[notificationEngine] ${item.type} sendt til ${item.email}`);
  }

  const byChild = {};
  for (const item of childItems) (byChild[item.childId] = byChild[item.childId] || []).push(item);
  const groups = Object.values(byChild);
  for (let i = 0; i < groups.length; i++) {
    for (const item of groups[i]) {
      await logSent(base44, item.profilId, item.childId, item.type, item.key);
      await createInApp(base44, item.email, item.title, item.message, item.link);
      await sendPush(item.email, item.title, item.message, item.link);
      sent++;
      console.log(`[notificationEngine] ${item.type}/${item.key} sendt til ${item.email} (${item.childName})`);
    }
    if (i < groups.length - 1) await sleep(STAGGER_MS);
  }
  return sent;
}

export async function runNotificationEngine(base44, options = {}) {
  const mode = options.mode || 'dry';
  const testEmail = options.testEmail;
  const cap = typeof options.cap === 'number' ? options.cap : 200;
  const now = new Date();
  const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });

  console.log(`[notificationEngine] mode=${mode} testEmail=${testEmail || '-'} cap=${cap} now=${now.toISOString()} i dag=${todayStr} i morgen=${tomorrowStr}`);

  const [profiles, children, allEvents] = await Promise.all([
    base44.asServiceRole.entities.UserProfile.list(),
    base44.asServiceRole.entities.Child.list(),
    base44.asServiceRole.entities.CalendarEvent.list(),
  ]);

  const familyMap = {};
  for (const p of profiles) if (p.family_id && p.user_email) (familyMap[p.family_id] = familyMap[p.family_id] || []).push(p);

  const plan = [];
  const processed = new Set();
  for (const profile of profiles) {
    const email = profile.user_email;
    if (!email || processed.has(email)) continue;
    processed.add(email);
    const userChildren = children.filter((c) => c.user_email === email);
    const profileEvents = allEvents.filter((e) => e.user_email === email);
    plan.push(...await buildAppointmentsPlan(profile, profileEvents, familyMap, todayStr, tomorrowStr));
    plan.push(...await buildChildPlan(base44, profile, userChildren, now));
  }

  const report = buildReport(plan);

  if (mode === 'dry') {
    for (const item of plan) console.log(`[notificationEngine][DRY] ${item.type}/${item.key} → ${item.email}: ${item.title} | ${item.message}`);
    return Response.json({ mode, ...report, wouldExceedCap: plan.length > cap, cap });
  }

  const actualItems = mode === 'test' ? plan.filter((i) => i.email === testEmail) : plan;
  if (actualItems.length > cap) {
    console.error(`[notificationEngine] SIKKERHEDSGRÆNSE overskredet: ${actualItems.length} > ${cap}. Afbryder uden at sende.`);
    for (const item of actualItems) console.log(`[notificationEngine][CAP-ABORT] ${item.type}/${item.key} → ${item.email}`);
    return Response.json({ mode, aborted: true, wouldSend: actualItems.length, cap, ...report });
  }

  if (mode === 'test') {
    for (const item of plan) if (item.email !== testEmail) console.log(`[notificationEngine][TEST-other] ${item.type}/${item.key} → ${item.email}: ${item.title}`);
  }

  const sent = await executeItems(base44, actualItems);
  console.log(`[notificationEngine] Færdig. mode=${mode} sendt=${sent}`);
  return Response.json({ mode, ...report, sent });
}

// Engangsudfyldning: overfører de gamle markører til NotificationLog så
// eksisterende brugere ikke får alt det de allerede har fået igen.
//   Child.last_notified_leap = N  → wonderweek-1..N (+ approaching)
//   UserProfile.last_notified_pregnancy_week = W → pregnancy-week-1..W (+ preg-*)
export async function backfillNotificationLog(base44) {
  const [profiles, children] = await Promise.all([
    base44.asServiceRole.entities.UserProfile.list(),
    base44.asServiceRole.entities.Child.list(),
  ]);
  const profileByEmail = {};
  for (const p of profiles) if (p.user_email) profileByEmail[p.user_email] = p;

  // Hent eksisterende log én gang og byg et sæt — undgår tusindvis af enkelte
  // filter-kald (som udløser rate-grænser).
  const existing = await base44.asServiceRole.entities.NotificationLog.list('-created_date', 5000);
  const seen = new Set((existing || []).map((r) => `${r.childId}|${r.type}|${r.key}`));

  const toCreate = [];
  const now = new Date().toISOString();

  for (const child of children) {
    const N = child.last_notified_leap;
    if (typeof N === 'number' && N >= 1) {
      const profile = profileByEmail[child.user_email];
      const profilId = profile ? profile.id : null;
      for (let k = 1; k <= N; k++) {
        for (const key of [`wonderweek-${k}`, `wonderweek-${k}-approaching`]) {
          const sig = `${child.id}|wonderweek|${key}`;
          if (!seen.has(sig)) { seen.add(sig); toCreate.push({ profilId, childId: child.id, type: 'wonderweek', key, sentAt: now }); }
        }
      }
    }
  }

  for (const profile of profiles) {
    const W = profile.last_notified_pregnancy_week;
    if (typeof W === 'number' && W >= 1) {
      const unborn = children.filter((c) => c.user_email === profile.user_email && c.due_date && !c.birthdate);
      for (const child of unborn) {
        for (let w = 1; w <= W; w++) {
          const pk = `${child.id}|pregnancy-week|pregnancy-week-${w}`;
          if (!seen.has(pk)) { seen.add(pk); toCreate.push({ profilId: profile.id, childId: child.id, type: 'pregnancy-week', key: `pregnancy-week-${w}`, sentAt: now }); }
          if (PREGNANCY_MILESTONE_WEEKS.includes(w)) {
            const mk = `${child.id}|pregnancy-milestone|preg-${w}`;
            if (!seen.has(mk)) { seen.add(mk); toCreate.push({ profilId: profile.id, childId: child.id, type: 'pregnancy-milestone', key: `preg-${w}`, sentAt: now }); }
          }
        }
      }
    }
  }

  // bulkCreate i batches á 100 for at holde os under rate-grænserne.
  let created = 0;
  for (let i = 0; i < toCreate.length; i += 100) {
    const batch = toCreate.slice(i, i + 100);
    await base44.asServiceRole.entities.NotificationLog.bulkCreate(batch);
    created += batch.length;
  }

  console.log(`[backfillNotificationLog] Oprettet ${created} log-rækker ud fra gamle markører.`);
  return Response.json({ success: true, created, profiles: profiles.length, children: children.length, withLeapMarker: children.filter((c) => typeof c.last_notified_leap === 'number').length, withPregnancyMarker: profiles.filter((p) => typeof p.last_notified_pregnancy_week === 'number').length });
}