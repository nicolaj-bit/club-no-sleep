import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Age milestones — calculated from BIRTH DATE
// One notification on the date child reaches that age
const AGE_MILESTONES = [
  { milestone_id: 'age-1m',  months: 1,  headline: '1 måned gammel' },
  { milestone_id: 'age-2m',  months: 2,  headline: '2 måneder gammel' },
  { milestone_id: 'age-3m',  months: 3,  headline: '3 måneder gammel' },
  { milestone_id: 'age-4m',  months: 4,  headline: '4 måneder gammel' },
  { milestone_id: 'age-5m',  months: 5,  headline: '5 måneder gammel' },
  { milestone_id: 'age-6m',  months: 6,  headline: '6 måneder gammel' },
  { milestone_id: 'age-7m',  months: 7,  headline: '7 måneder gammel' },
  { milestone_id: 'age-8m',  months: 8,  headline: '8 måneder gammel' },
  { milestone_id: 'age-9m',  months: 9,  headline: '9 måneder gammel' },
  { milestone_id: 'age-10m', months: 10, headline: '10 måneder gammel' },
  { milestone_id: 'age-11m', months: 11, headline: '11 måneder gammel' },
  { milestone_id: 'age-13m', months: 13, headline: '13 måneder gammel' },
  { milestone_id: 'age-14m', months: 14, headline: '14 måneder gammel' },
  { milestone_id: 'age-15m', months: 15, headline: '15 måneder gammel' },
  { milestone_id: 'age-16m', months: 16, headline: '16 måneder gammel' },
  { milestone_id: 'age-17m', months: 17, headline: '17 måneder gammel' },
  { milestone_id: 'age-18m', months: 18, headline: '18 måneder gammel' },
  { milestone_id: 'age-19m', months: 19, headline: '19 måneder gammel' },
  { milestone_id: 'age-20m', months: 20, headline: '20 måneder gammel' },
  { milestone_id: 'age-21m', months: 21, headline: '21 måneder gammel' },
  { milestone_id: 'age-22m', months: 22, headline: '22 måneder gammel' },
  { milestone_id: 'age-23m', months: 23, headline: '23 måneder gammel' },
];

// Birthday milestones — from BIRTH DATE, annual
const BIRTHDAY_MILESTONES = [
  { milestone_id: 'age-1y', years: 1 },
  { milestone_id: 'age-2y', years: 2 },
  { milestone_id: 'age-3y', years: 3 },
];

// Pregnancy milestones — from DUE DATE, on first day of relevant week
const PREGNANCY_MILESTONES = [
  { milestone_id: 'preg-4',  weeks: 4 },
  { milestone_id: 'preg-8',  weeks: 8 },
  { milestone_id: 'preg-12', weeks: 12 },
  { milestone_id: 'preg-16', weeks: 16 },
  { milestone_id: 'preg-20', weeks: 20 },
  { milestone_id: 'preg-24', weeks: 24 },
  { milestone_id: 'preg-28', weeks: 28 },
  { milestone_id: 'preg-32', weeks: 32 },
  { milestone_id: 'preg-36', weeks: 36 },
  { milestone_id: 'preg-40', weeks: 40 },
];

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');

function isSameDayAsMonthOffset(dateStr, monthsToAdd) {
  const base = new Date(dateStr);
  base.setHours(0, 0, 0, 0);
  const target = new Date(base.getFullYear(), base.getMonth() + monthsToAdd, base.getDate());
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return target.getTime() === now.getTime();
}

function isSameDayAsYearOffset(dateStr, yearsToAdd) {
  const base = new Date(dateStr);
  base.setHours(0, 0, 0, 0);
  const target = new Date(base.getFullYear() + yearsToAdd, base.getMonth(), base.getDate());
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return target.getTime() === now.getTime();
}

// LMP = terminsdato - 280 dage (40 uger)
function isTodayStartOfWeek(dueDateStr, weeks) {
  const due = new Date(dueDateStr);
  const lmp = new Date(due.getTime() - 280 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const lmpMidnight = new Date(lmp.getFullYear(), lmp.getMonth(), lmp.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceLmp = Math.round((nowMidnight - lmpMidnight) / (24 * 60 * 60 * 1000));
  return daysSinceLmp === weeks * 7;
}

async function sendPush(email, title, message, apiKey) {
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [email] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
    url: 'https://app.lalatoto.dk/Milestones',
  };

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log(`Push til ${email}:`, JSON.stringify(data));
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    const [children, profiles] = await Promise.all([
      base44.asServiceRole.entities.Child.list(),
      base44.asServiceRole.entities.UserProfile.list(),
    ]);

    const profileByEmail = {};
    for (const p of profiles) {
      profileByEmail[p.user_email] = p;
    }

    let sent = 0;

    for (const child of children) {
      const email = child.user_email;
      if (!email) continue;

      // ── Aldersbaserede milepæle (fra fødselsdato) ──
      if (child.birthdate) {
        // Month milestones (1-11, 13-23)
        for (const m of AGE_MILESTONES) {
          if (isSameDayAsMonthOffset(child.birthdate, m.months)) {
            const title = `Baby er ${m.months} måneder i dag`;
            const message = 'Der ligger nye milepæle klar i appen.';
            const ok = await sendPush(email, title, message, apiKey);
            if (ok) sent++;
          }
        }

        // Birthday milestones (1, 2, 3 years)
        for (const b of BIRTHDAY_MILESTONES) {
          if (isSameDayAsYearOffset(child.birthdate, b.years)) {
            const title = 'I dag er det babys fødselsdag';
            const message = 'Gem dagen med en milepæl, hvis du har lyst.';
            const ok = await sendPush(email, title, message, apiKey);
            if (ok) sent++;
          }
        }
      }

      // ── Graviditets-milepæle (fra terminsdato) ──
      if (!child.birthdate && child.due_date) {
        for (const m of PREGNANCY_MILESTONES) {
          if (isTodayStartOfWeek(child.due_date, m.weeks)) {
            const title = `Uge ${m.weeks}`;
            const message = 'Der ligger en ny milepæl klar i appen.';
            const ok = await sendPush(email, title, message, apiKey);
            if (ok) sent++;
          }
        }
      }
    }

    console.log(`Milestone notifikationer sendt: ${sent}`);
    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('checkMilestoneNotifications error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});