import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
const REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

// Wonder weeks — weeks from due date (NOT birth date)
const WONDER_WEEKS = [
  { number: 1, week: 5, name: 'Sansernes verden' },
  { number: 2, week: 8, name: 'Mønstre' },
  { number: 3, week: 12, name: 'Overgange' },
  { number: 4, week: 19, name: 'Begivenheder' },
  { number: 5, week: 26, name: 'Relationer' },
  { number: 6, week: 37, name: 'Kategorier' },
  { number: 7, week: 46, name: 'Sekvenser' },
  { number: 8, week: 55, name: 'Programmer' },
  { number: 9, week: 71, name: 'Principper' },
  { number: 10, week: 75, name: 'Systemer' },
];

function getPregnancyWeek(dueDateStr, onDate) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const target = new Date(onDate);
  target.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - target) / (24 * 60 * 60 * 1000));
  return 40 - Math.floor(daysUntilDue / 7);
}

function isPregnancyWeekStart(dueDateStr, onDate) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const target = new Date(onDate);
  target.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - target) / (24 * 60 * 60 * 1000));
  return daysUntilDue % 7 === 0;
}

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

function daysSince(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((now - d) / (24 * 60 * 60 * 1000));
}

// Check if today is an age milestone (X months or X years from birth)
function getTodayAgeMilestone(birthDateStr) {
  if (!birthDateStr) return null;

  // Months 1-23 (skip 12 = birthday)
  for (let m = 1; m <= 23; m++) {
    if (m === 12) continue;
    if (isSameDayAsMonthOffset(birthDateStr, m)) {
      return {
        type: 'age_milestone',
        title: m === 6 ? 'Baby er 6 måneder i dag 🌟' : `Baby er ${m} måneder i dag 🌙`,
        message: 'Der ligger nye milepæle klar i appen.',
        link: '/Milestones',
        emoji: m === 6 ? '🌟' : '🌙',
      };
    }
  }

  // Birthdays (1, 2, 3 years)
  for (let y = 1; y <= 3; y++) {
    if (isSameDayAsYearOffset(birthDateStr, y)) {
      return {
        type: 'birthday',
        title: `Baby er ${y} år i dag 🎂`,
        message: 'Gem dagen med en milepæl, hvis du har lyst.',
        link: '/Milestones',
        emoji: '🎂',
      };
    }
  }

  return null;
}

// Check if today is the start of a wonder week (always from due date)
function getTodayWonderWeek(dueDateStr) {
  if (!dueDateStr) return null;
  const ageDays = daysSince(dueDateStr);
  if (ageDays < 0) return null;
  const ageWeeks = Math.floor(ageDays / 7);

  for (const ww of WONDER_WEEKS) {
    if (ageWeeks === ww.week) {
      return {
        type: 'wonder_week',
        title: 'Et nyt tigerspring nærmer sig 🌟',
        message: 'Baby kan være på vej ind i en periode, hvor verden bliver lidt større. Læs mere i appen.',
        link: '/Knowledge',
        emoji: '🌟',
      };
    }
  }
  return null;
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${REST_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (e) {
    console.error('[calendarEngine] Push failed:', e.message);
    return false;
  }
}

async function createInApp(base44, email, title, message, emoji, link) {
  await base44.asServiceRole.entities.AppNotification.create({
    title,
    message,
    emoji: emoji || '🗓️',
    link: link || '/Calendar',
    target_emails: [email],
    published_at: new Date().toISOString(),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });

    console.log(`[calendarEngine] Running at ${now.toISOString()}. Today: ${todayStr}, Tomorrow: ${tomorrowStr}`);

    // Fetch all data in parallel
    const [profiles, children, allEvents] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.list(),
      base44.asServiceRole.entities.Child.list(),
      base44.asServiceRole.entities.CalendarEvent.list(),
    ]);

    console.log(`[calendarEngine] Profiles: ${profiles.length}, Children: ${children.length}, Events: ${allEvents.length}`);

    let sent = 0;
    const processed = new Set();

    for (const profile of profiles) {
      if (!profile.user_email) continue;
      if (processed.has(profile.user_email)) continue;

      const email = profile.user_email;

      // Find due date and birth date from children (primary) or profile (fallback)
      const userChildren = children.filter(c => c.user_email === email);
      const unbornChild = userChildren.find(c => c.due_date && !c.birthdate);
      const bornChild = userChildren.find(c => c.birthdate);
      const anyChildWithDueDate = userChildren.find(c => c.due_date);

      const dueDate = unbornChild?.due_date || anyChildWithDueDate?.due_date || profile.child_due_date;
      const birthDate = bornChild?.birthdate || profile.child_birthdate;

      const isPregnant = dueDate && !birthDate;
      const isBaby = !!birthDate;

      // ── Pregnancy week notification (pregnancy mode only) ──
      if (isPregnant && profile.notif_pregnancy_weekly !== false) {
        if (isPregnancyWeekStart(dueDate, now)) {
          const week = getPregnancyWeek(dueDate, now);
          if (week >= 4 && week <= 42) {
            const title = 'Ny uge i graviditeten 🤰';
            const message = `Du er nu i uge ${week}. Der ligger en lille opdatering klar til dig.`;
            await createInApp(base44, email, title, message, '🤰', '/PregnancyWeeks');
            await sendPush(email, title, message, '/PregnancyWeeks');
            sent++;
            console.log(`[calendarEngine] Pregnancy week ${week} notification sent to ${email}`);
          }
        }
      }

      // ── Age milestone notification (baby mode only) ──
      if (isBaby && profile.notif_pregnancy_weekly !== false) {
        const milestone = getTodayAgeMilestone(birthDate);
        if (milestone) {
          await createInApp(base44, email, milestone.title, milestone.message, milestone.emoji, milestone.link);
          await sendPush(email, milestone.title, milestone.message, milestone.link);
          sent++;
          console.log(`[calendarEngine] Age milestone notification sent to ${email}: ${milestone.title}`);
        }
      }

      // ── Wonder week notification (always from due date) ──
      if (dueDate && profile.wonderweeks_notifications !== false) {
        const ww = getTodayWonderWeek(dueDate);
        if (ww) {
          await createInApp(base44, email, ww.title, ww.message, ww.emoji, ww.link);
          await sendPush(email, ww.title, ww.message, ww.link);
          sent++;
          console.log(`[calendarEngine] Wonder week notification sent to ${email}`);
        }
      }

      // ── User appointment notifications ──
      if (profile.notif_calendar_reminder !== false) {
        const userEvents = allEvents.filter(e => e.user_email === email);
        for (const event of userEvents) {
          const eventDateStr = new Date(event.start_datetime).toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
          const timeStr = new Date(event.start_datetime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });

          // Day before
          if (eventDateStr === tomorrowStr && !event.notify_day_before_sent) {
            const title = 'Du har en aftale i morgen 🗓️';
            const message = `${event.title} kl. ${timeStr}`;
            await createInApp(base44, email, title, message, '🗓️', '/Calendar');
            await sendPush(email, title, message, '/Calendar');
            await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
            sent++;
          }

          // Same day
          if (eventDateStr === todayStr && !event.notify_same_day_sent) {
            const title = 'Du har en aftale i dag 📅';
            const message = `${event.title} kl. ${timeStr}`;
            await createInApp(base44, email, title, message, '📅', '/Calendar');
            await sendPush(email, title, message, '/Calendar');
            await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_same_day_sent: true });
            sent++;
          }
        }
      }

      processed.add(email);
    }

    return Response.json({ success: true, sent, processed: processed.size });
  } catch (error) {
    console.error('[calendarEngine] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});