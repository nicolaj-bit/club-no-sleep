import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    const allEvents = await base44.asServiceRole.entities.CalendarEvent.list();
    console.log(`[calendarDayNotifications] Fandt ${allEvents.length} events`);

    let sent = 0;

    for (const event of allEvents) {
      const eventDateStr = new Date(event.start_datetime).toLocaleDateString('sv-SE', { timeZone: 'Europe/Copenhagen' });
      const timeStr = new Date(event.start_datetime).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });
      const email = event.user_email;

      // Dagen før
      if (eventDateStr === tomorrowStr && !event.notify_day_before_sent) {
        await base44.asServiceRole.entities.AppNotification.create({
          title: 'Du har en aftale i morgen',
          message: `${event.title} kl. ${timeStr}`,
          link: '/Calendar',
          target_emails: [email],
          published_at: new Date().toISOString(),
        });
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
        console.log(`[calendarDayNotifications] Dagen-før notifikation sendt til ${email} for "${event.title}"`);
        sent++;
      }

      // På selve dagen
      if (eventDateStr === todayStr && !event.notify_same_day_sent) {
        await base44.asServiceRole.entities.AppNotification.create({
          title: 'Du har en aftale i dag',
          message: `${event.title} kl. ${timeStr}`,
          link: '/Calendar',
          target_emails: [email],
          published_at: new Date().toISOString(),
        });
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