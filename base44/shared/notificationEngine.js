// ============================================================================
// EN fælles notifikationsmotor for alt barn-relateret indhold:
// tigerspring, graviditetsuger, termin, aldersmilepæle, fødselsdage og
// graviditetsmilepæle — samt kalender-aftaler (dag-før / samme-dag).
//
// Denne fil er den eneste kilde til logikken. De gamle funktioner
// (checkWonderWeeks, pregnancyWeeklyNotification, calendarEngine,
// checkMilestoneNotifications) er nu tynde kald ind i runNotificationEngine().
//
// IDEMPOTENS pr. begivenhed pr. barn via NotificationLog:
//   en begivenhed sendes KUN, hvis der ikke findes en linje med samme
//   (childId, type, key). Det gælder uanset hvor mange gange appen åbnes,
//   eller hvilket barn der er valgt i kalenderen.
//
// FORUDSIGELIGE NØGLER:
//   tigerspring (dagen før):  wonderweek-{n}-approaching
//   tigerspring (på dagen):   wonderweek-{n}
//   graviditetsuge:           pregnancy-week-{N}
//   termin:                    termin
//   aldersmilepæl (måneder):  age-{m}m
//   fødselsdag (år):          age-{y}y
//   graviditetsmilepæl:       preg-{N}
//
// FORÆLDEDE marker (bruges IKKE længere — erstattet af NotificationLog):
//   Child.last_notified_leap
//   UserProfile.last_notified_pregnancy_week
// De står stadig i skemaerne for bagudkompatibilitet, men motoren læser/
// skriver dem ikke. Der er kun ét tællesystem nu.
// ============================================================================

import { getGestationalAge } from './getGestationalAge.js';
import { WONDER_WEEKS } from './getWonderWeek.js';

const ONESIGNAL_APP_ID = (typeof Deno !== 'undefined') ? Deno.env.get('ONESIGNAL_APP_ID') : undefined;
const REST_API_KEY = (typeof Deno !== 'undefined') ? Deno.env.get('ONESIGNAL_REST_API_KEY') : undefined;

const PREGNANCY_MILESTONE_WEEKS = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
// Mellemrum mellem børns notifikationer så de ikke smelter sammen på låseskærmen.
const STAGGER_MS = 60_000;
const DAY_MS = 24 * 60 * 60 * 1000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

// Opt-in pr. begivenhedstype ud fra profilens indstillinger.
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

// Byg alle begivenheder for ét barn på en given dag.
function buildChildEvents(child, now) {
  const events = [];
  const name = childName(child);
  const due = child.due_date;
  const birth = child.birthdate;

  // Tigerspring — altid fra terminsdato (gælder både fødte og ufødte).
  // "approaching" = dagen før start ("i morgen"); "start" = på selve dagen.
  if (due) {
    const ageDays = daysSince(due, now);
    if (ageDays >= 0) {
      for (const ww of WONDER_WEEKS) {
        const startDay = ww.weekStart * 7;
        if (ageDays === startDay - 1) {
          events.push({
            type: 'wonderweek',
            key: `wonderweek-${ww.number}-approaching`,
            title: 'Tigerspring',
            message: `${name} går ind i tigerspring ${ww.number} i morgen`,
            link: '/Knowledge',
          });
        }
        if (ageDays === startDay) {
          events.push({
            type: 'wonderweek',
            key: `wonderweek-${ww.number}`,
            title: 'Tigerspring',
            message: `${name} er nu i tigerspring ${ww.number}`,
            link: '/Knowledge',
          });
        }
      }
    }
  }

  // Graviditet (ufødt barn: terminsdato, ingen fødselsdato).
  if (due && !birth) {
    const ga = getGestationalAge(due, now);
    // Start af ny graviditetsuge (ga.days === 0)
    if (ga && ga.days === 0) {
      const week = ga.ordinal;
      if (week >= 4 && week <= 42) {
        events.push({
          type: 'pregnancy-week',
          key: `pregnancy-week-${week}`,
          title: `Uge ${week}`,
          message: `Uge ${week} — ${name}`,
          link: '/PregnancyWeeks',
        });
        if (PREGNANCY_MILESTONE_WEEKS.includes(week)) {
          events.push({
            type: 'pregnancy-milestone',
            key: `preg-${week}`,
            title: `Uge ${week}`,
            message: `Ny milepæl klar for ${name} — uge ${week}`,
            link: '/Milestones',
          });
        }
      }
    }
    // Terminusdagen
    if (isSameDateStr(due, now)) {
      events.push({
        type: 'termin',
        key: 'termin',
        title: 'Termin',
        message: `I dag er det termin for ${name}`,
        link: '/PregnancyWeeks',
      });
    }
  }

  // Født barn: aldersmilepæle (måneder) og fødselsdage (år).
  if (birth) {
    for (let m = 1; m <= 11; m++) {
      if (isSameDayAsMonthOffset(birth, m, now)) {
        events.push({
          type: 'age-milestone',
          key: `age-${m}m`,
          title: `${name} er ${m} måneder`,
          message: `${name} er ${m} måneder i dag`,
          link: '/Milestones',
        });
      }
    }
    for (let m = 13; m <= 23; m++) {
      if (isSameDayAsMonthOffset(birth, m, now)) {
        events.push({
          type: 'age-milestone',
          key: `age-${m}m`,
          title: `${name} er ${m} måneder`,
          message: `${name} er ${m} måneder i dag`,
          link: '/Milestones',
        });
      }
    }
    for (let y = 1; y <= 3; y++) {
      if (isSameDayAsYearOffset(birth, y, now)) {
        events.push({
          type: 'birthday',
          key: `age-${y}y`,
          title: `${name} fylder ${y} år`,
          message: `I dag fylder ${name} ${y} år`,
          link: '/Milestones',
        });
      }
    }
  }

  return events;
}

async function sendPush(email, title, message, link) {
  if (!ONESIGNAL_APP_ID || !REST_API_KEY) return false;
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [email] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
  };
  if (link) body.url = link;
  try {
    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${REST_API_KEY}` },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (e) {
    console.error('[notificationEngine] Push fejlede:', e.message);
    return false;
  }
}

async function createInApp(base44, email, title, message, link) {
  await base44.asServiceRole.entities.AppNotification.create({
    title,
    message,
    link: link || '/Calendar',
    target_emails: [email],
    published_at: new Date().toISOString(),
  });
}

async function isLogged(base44, childId, type, key) {
  const rows = await base44.asServiceRole.entities.NotificationLog.filter({ childId, type, key });
  return Array.isArray(rows) && rows.length > 0;
}

async function logSent(base44, profilId, childId, type, key) {
  await base44.asServiceRole.entities.NotificationLog.create({
    profilId,
    childId,
    type,
    key,
    sentAt: new Date().toISOString(),
  });
}

// Kalender-aftaler: dag-før og samme-dag med partnerdeling.
// Idempotens via eksisterende flag på CalendarEvent (ikke per-barn).
async function handleAppointments(base44, profile, profileEvents, familyMap, todayStr, tomorrowStr) {
  if (profile.notif_calendar_reminder === false) return 0;
  const email = profile.user_email;
  let count = 0;

  for (const event of profileEvents) {
    const eventDateStr = new Date(event.start_datetime).toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
    const timeStr = new Date(event.start_datetime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });

    // Dagen før
    if (eventDateStr === tomorrowStr && !event.notify_day_before_sent) {
      const title = 'Du har en aftale i morgen';
      const message = `${event.title} kl. ${timeStr}`;
      await createInApp(base44, email, title, message, '/Calendar');
      await sendPush(email, title, message, '/Calendar');
      await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
      count++;
      if (event.family_id) {
        const partners = (familyMap[event.family_id] || []).filter((p) => p.user_email !== email);
        const ownerName = profile.display_name || profile.username || 'En';
        for (const partner of partners) {
          const pTitle = `${ownerName} har delt en aftale med dig`;
          const pMessage = `${event.title} kl. ${timeStr}`;
          await createInApp(base44, partner.user_email, pTitle, pMessage, '/Calendar');
          await sendPush(partner.user_email, pTitle, pMessage, '/Calendar');
          count++;
        }
      }
    }

    // Samme dag
    if (eventDateStr === todayStr && !event.notify_same_day_sent) {
      const title = 'Du har en aftale i dag';
      const message = `${event.title} kl. ${timeStr}`;
      await createInApp(base44, email, title, message, '/Calendar');
      await sendPush(email, title, message, '/Calendar');
      await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_same_day_sent: true });
      count++;
      if (event.family_id) {
        const partners = (familyMap[event.family_id] || []).filter((p) => p.user_email !== email);
        const ownerName = profile.display_name || profile.username || 'En';
        for (const partner of partners) {
          const pTitle = `${ownerName} har delt en aftale med dig`;
          const pMessage = `${event.title} kl. ${timeStr}`;
          await createInApp(base44, partner.user_email, pTitle, pMessage, '/Calendar');
          await sendPush(partner.user_email, pTitle, pMessage, '/Calendar');
          count++;
        }
      }
    }
  }
  return count;
}

// Hovedindgang — kaldes af de fire tynde funktioner og af notificationEngine.
export async function runNotificationEngine(base44) {
  const now = new Date();
  const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });

  console.log(`[notificationEngine] Kører ${now.toISOString()}. I dag: ${todayStr}, I morgen: ${tomorrowStr}`);

  const [profiles, children, allEvents] = await Promise.all([
    base44.asServiceRole.entities.UserProfile.list(),
    base44.asServiceRole.entities.Child.list(),
    base44.asServiceRole.entities.CalendarEvent.list(),
  ]);
  console.log(`[notificationEngine] Profiler: ${profiles.length}, Børn: ${children.length}, Aftaler: ${allEvents.length}`);

  // Familie-kort til partnerdeling af aftaler
  const familyMap = {};
  for (const p of profiles) {
    if (p.family_id && p.user_email) {
      (familyMap[p.family_id] = familyMap[p.family_id] || []).push(p);
    }
  }

  let sent = 0;
  const processed = new Set();

  for (const profile of profiles) {
    const email = profile.user_email;
    if (!email || processed.has(email)) continue;
    processed.add(email);

    const userChildren = children.filter((c) => c.user_email === email);
    const profileEvents = allEvents.filter((e) => e.user_email === email);

    // 1) Aftaler (flag-idempotens, ikke per-barn)
    sent += await handleAppointments(base44, profile, profileEvents, familyMap, todayStr, tomorrowStr);

    // 2) Per-barn begivenheder (NotificationLog-idempotens)
    const childrenWithEvents = [];
    for (const child of userChildren) {
      const evts = buildChildEvents(child, now);
      const toSend = [];
      for (const e of evts) {
        if (!optIn(profile, e.type)) continue;
        if (await isLogged(base44, child.id, e.type, e.key)) continue;
        toSend.push(e);
      }
      if (toSend.length) childrenWithEvents.push({ child, toSend });
    }

    for (let i = 0; i < childrenWithEvents.length; i++) {
      const { child, toSend } = childrenWithEvents[i];
      for (const e of toSend) {
        // Reservér slot FØR afsendelse — guard mod samtidige kørsler (de fire
        // tynde funktioner kan trigge motoren tæt på hinanden).
        await logSent(base44, profile.id, child.id, e.type, e.key);
        await createInApp(base44, email, e.title, e.message, e.link);
        await sendPush(email, e.title, e.message, e.link);
        sent++;
        console.log(`[notificationEngine] ${e.type}/${e.key} sendt til ${email} (${child.name})`);
      }
      // Stagger mellem børn så de ikke smelter sammen på låseskærmen.
      if (i < childrenWithEvents.length - 1) {
        await sleep(STAGGER_MS);
      }
    }
  }

  console.log(`[notificationEngine] Færdig. Sendt: ${sent}, Profiler: ${processed.size}`);
  return Response.json({ success: true, sent, processed: processed.size });
}