import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { normalizeLanguage } from '../../shared/i18n.js';

// Modtagerens eget sprog bestemmer teksten og tidsformatet.
const T = (lang, da, en) => (lang === 'en' ? en : da);

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
const REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

async function sendPush(email, title, message) {
  if (!ONESIGNAL_APP_ID || !REST_API_KEY) return false;
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [email] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
  };
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

// Kører dagligt — sender in-app notifikation:
// 1) Dagen før events (starter i morgen)
// 2) På selve dagen (starter i dag)
// Ingen emojis. Kort, varm, rolig tone.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const todayStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });

    console.log(`[calendarDayNotifications] Kører. I dag: ${todayStr}, I morgen: ${tomorrowStr}`);

    const [allEvents, profiles] = await Promise.all([
      base44.asServiceRole.entities.CalendarEvent.list(),
      base44.asServiceRole.entities.UserProfile.list(),
    ]);
    console.log(`[calendarDayNotifications] Fandt ${allEvents.length} events`);

    const notifPrefByEmail = {};
    const langByEmail = {};
    for (const p of profiles) {
      if (p.user_email) {
        notifPrefByEmail[p.user_email] = p.notif_calendar_reminder !== false;
        langByEmail[p.user_email] = normalizeLanguage(p.language);
      }
    }

    let sent = 0;

    for (const event of allEvents) {
      const eventDateStr = new Date(event.start_datetime).toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
      const email = event.user_email;
      const lang = langByEmail[email] || 'da';
      const timeStr = new Date(event.start_datetime).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'da-DK', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });
      const when = T(lang, `${event.title} kl. ${timeStr}`, `${event.title} at ${timeStr}`);

      // Dagen før
      if (eventDateStr === tomorrowStr && !event.notify_day_before_sent) {
        await base44.asServiceRole.entities.AppNotification.create({
          title: T(lang, 'Du har en aftale i morgen', 'You have an appointment tomorrow'),
          message: when,
          link: '/Calendar',
          target_emails: [email],
          published_at: new Date().toISOString(),
        });
        if (notifPrefByEmail[email] !== false) {
          await sendPush(email, T(lang, 'Du har en aftale i morgen', 'You have an appointment tomorrow'), when);
        }
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
        console.log(`[calendarDayNotifications] Dagen-før notifikation sendt til ${email} for "${event.title}"`);
        sent++;
      }

      // På selve dagen
      if (eventDateStr === todayStr && !event.notify_same_day_sent) {
        await base44.asServiceRole.entities.AppNotification.create({
          title: T(lang, 'Du har en aftale i dag', 'You have an appointment today'),
          message: when,
          link: '/Calendar',
          target_emails: [email],
          published_at: new Date().toISOString(),
        });
        if (notifPrefByEmail[email] !== false) {
          await sendPush(email, T(lang, 'Du har en aftale i dag', 'You have an appointment today'), when);
        }
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_same_day_sent: true });
        console.log(`[calendarDayNotifications] Samme-dag notifikation sendt til ${email} for "${event.title}"`);
        sent++;
      }
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('[calendarDayNotifications] Fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});