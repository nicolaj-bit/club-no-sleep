import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
const REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

// Pregnancy week titles — no emojis
const WEEK_TITLES = {
  4:  'Uge 4',
  5:  'Uge 5',
  6:  'Uge 6',
  7:  'Uge 7',
  8:  'Uge 8',
  9:  'Uge 9',
  10: 'Uge 10',
  11: 'Uge 11',
  12: 'Uge 12',
  13: 'Uge 13',
  14: 'Uge 14',
  15: 'Uge 15',
  16: 'Uge 16',
  17: 'Uge 17',
  18: 'Uge 18',
  19: 'Uge 19',
  20: 'Uge 20',
  21: 'Uge 21',
  22: 'Uge 22',
  23: 'Uge 23',
  24: 'Uge 24',
  25: 'Uge 25',
  26: 'Uge 26',
  27: 'Uge 27',
  28: 'Uge 28',
  29: 'Uge 29',
  30: 'Uge 30',
  31: 'Uge 31',
  32: 'Uge 32',
  33: 'Uge 33',
  34: 'Uge 34',
  35: 'Uge 35',
  36: 'Uge 36',
  37: 'Uge 37',
  38: 'Uge 38',
  39: 'Uge 39',
  40: 'Uge 40',
  41: 'Uge 41',
  42: 'Uge 42',
};

// Beregn graviditetsuge ud fra terminsdato (uge 40 = terminsdagen)
function getPregnancyWeek(dueDateStr) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - today) / (1000 * 60 * 60 * 24));
  return 40 - Math.floor(daysUntilDue / 7);
}

// Er det præcis første dag i en ny uge? (dage til termin deleligt med 7)
function isNewWeekToday(dueDateStr) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.round((due - today) / (1000 * 60 * 60 * 24));
  return daysUntilDue % 7 === 0;
}

// Er terminsdatoen stadig i fremtiden (barnet ikke født)?
function isStillPregnant(dueDateStr, birthdateStr) {
  if (birthdateStr) return false;
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due >= today;
}

async function sendPushNotification(email, title, message) {
  if (!ONESIGNAL_APP_ID || !REST_API_KEY) return false;
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [email] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
    url: 'https://lalatoto.dk/PregnancyWeeks',
  };
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const result = await res.json();
  if (!res.ok) {
    console.error(`OneSignal fejl for ${email}:`, JSON.stringify(result));
  }
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const [profiles, children] = await Promise.all([
      base44.asServiceRole.entities.UserProfile.list(),
      base44.asServiceRole.entities.Child.list(),
    ]);

    console.log(`Behandler ${profiles.length} profiler og ${children.length} børn`);

    const childDueDateByEmail = {};
    for (const child of children) {
      if (!child.user_email || !child.due_date) continue;
      if (!isStillPregnant(child.due_date, child.birthdate)) continue;
      if (!childDueDateByEmail[child.user_email]) {
        childDueDateByEmail[child.user_email] = child.due_date;
      }
    }

    let sent = 0;
    const processed = new Set();

    for (const profile of profiles) {
      if (!profile.user_email) continue;
      if (processed.has(profile.user_email)) continue;

      const dueDate = childDueDateByEmail[profile.user_email] || profile.child_due_date;
      if (!dueDate) continue;
      if (!isStillPregnant(dueDate, profile.child_birthdate)) continue;

      if (profile.notif_pregnancy_weekly === false) {
        console.log(`${profile.user_email}: Graviditetsnotifikationer slået fra`);
        continue;
      }

      if (!isNewWeekToday(dueDate)) {
        console.log(`${profile.user_email}: Ikke ny uge i dag (terminsdato: ${dueDate})`);
        continue;
      }

      const week = getPregnancyWeek(dueDate);
      if (week < 4 || week > 42) {
        console.log(`${profile.user_email}: Uge ${week} er uden for interval, springer over`);
        continue;
      }

      const title = WEEK_TITLES[week] || `Uge ${week}`;
      const message = `Uge ${week} ligger klar til dig i appen.`;

      await base44.asServiceRole.entities.AppNotification.create({
        title,
        message,
        link: '/PregnancyWeeks',
        target_emails: [profile.user_email],
        published_at: new Date().toISOString(),
      });

      await sendPushNotification(profile.user_email, title, message);

      console.log(`Uge ${week} notifikation sendt til ${profile.user_email} (terminsdato: ${dueDate})`);
      processed.add(profile.user_email);
      sent++;
    }

    return Response.json({ success: true, notificationsSent: sent });
  } catch (error) {
    console.error('pregnancyWeeklyNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});