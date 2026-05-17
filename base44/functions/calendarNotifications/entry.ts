import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';

async function sendPushToEmails(emails, title, message) {
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: emails },
    target_channel: 'push',
    headings: { en: title, da: title },
    contents: { en: message, da: message },
  };

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    console.log(`[calendarNotifications] Kører nu: ${now.toISOString()}`);

    // Hent alle kommende aftaler der ikke har fået notifikationer endnu
    const allEvents = await base44.asServiceRole.entities.CalendarEvent.list();
    console.log(`[calendarNotifications] Fandt ${allEvents.length} events`);

    let sentCount = 0;

    for (const event of allEvents) {
      const start = new Date(event.start_datetime);
      const diffMs = start - now;
      const diffMins = diffMs / 60000;

      console.log(`[calendarNotifications] Event: "${event.title}" starter ${start.toISOString()}, om ${diffMins.toFixed(1)} minutter. notify_30min_before_sent=${event.notify_30min_before_sent}`);

      // Find alle profiler for denne bruger (mor + far)
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: event.user_email });
      
      // Saml alle emails der skal notificeres (ejeren + eventuelle partner-profiler på samme konto)
      const emailsToNotify = [event.user_email];

      // Dagen før: mellem 23.5 og 25 timer til aftalen
      if (!event.notify_day_before_sent && diffMins > 23.5 * 60 && diffMins <= 25 * 60) {
        const dateStr = start.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
        const timeStr = start.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        await sendPushToEmails(
          emailsToNotify,
          `🗓️ Husk: ${event.title}`,
          `Aftale i morgen kl. ${timeStr} — ${dateStr}`
        );
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
        sentCount++;
      }

      // 30 min før: mellem 28 og 32 minutter til aftalen
      if (!event.notify_30min_before_sent && diffMins > 28 && diffMins <= 32) {
        const timeStr = start.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        await sendPushToEmails(
          emailsToNotify,
          `⏰ Snart: ${event.title}`,
          `Starter kl. ${timeStr} — om 30 minutter`
        );
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_30min_before_sent: true });
        sentCount++;
      }
    }

    return Response.json({ success: true, sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});