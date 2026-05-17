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

async function sendEmailFallback(base44, email, eventTitle, eventTime, isReminder30min) {
  try {
    const subject = isReminder30min
      ? `⏰ Om 30 min: ${eventTitle}`
      : `🗓️ Husk i morgen: ${eventTitle}`;

    const preheader = isReminder30min
      ? `Din aftale starter kl. ${eventTime} — husk at gøre dig klar`
      : `Du har en aftale i morgen kl. ${eventTime}`;

    const headingText = isReminder30min
      ? `Om 30 minutter`
      : `I morgen`;

    const bodyText = isReminder30min
      ? `Din aftale <strong>${eventTitle}</strong> starter kl. <strong>${eventTime}</strong>.<br>Tid til at gøre dig klar! 🌸`
      : `Du har en aftale i morgen kl. <strong>${eventTime}</strong>:<br><strong>${eventTitle}</strong>`;

    const html = `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!-- Preheader (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F1;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background-color:#FFFDF9;border-radius:16px;overflow:hidden;border:1px solid #EDE4DB;">
          
          <!-- Header -->
          <tr>
            <td style="background-color:#5B3F2B;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;letter-spacing:0.15em;color:#C9AA8F;text-transform:uppercase;font-weight:500;">LALATOTO</p>
              <p style="margin:8px 0 0;font-size:22px;color:#FFFDF9;font-weight:300;letter-spacing:0.05em;">${headingText}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#2B1F16;">${bodyText}</p>
              <hr style="border:none;border-top:1px solid #EDE4DB;margin:24px 0;">
              <p style="margin:0;font-size:13px;color:#7A665A;line-height:1.6;">
                Denne påmindelse er sendt fra din LALATOTO kalender.<br>
                Du kan administrere dine aftaler direkte i appen.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F3E9E1;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B08D72;">© LALATOTO · Sendt fordi du har aktiveret kalender-påmindelser</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'LALATOTO',
      subject,
      body: html,
    });
    console.log(`[calendarNotifications] Email sendt til ${email}`);
  } catch (e) {
    console.log(`[calendarNotifications] Email fejlede for ${email}: ${e.message}`);
  }
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
      if (event.notify_day_before !== false && !event.notify_day_before_sent && diffMins > 23.5 * 60 && diffMins <= 25 * 60) {
        const dateStr = start.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
        const timeStr = start.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        const title = `🗓️ Husk: ${event.title}`;
        const msg = `Aftale i morgen kl. ${timeStr} — ${dateStr}`;
        await sendPushToEmails(emailsToNotify, title, msg);
        for (const email of emailsToNotify) {
          await sendEmailFallback(base44, email, event.title, timeStr, false);
        }
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
        sentCount++;
      }

      // 30 min før: mellem 28 og 32 minutter til aftalen
      if (event.notify_30min_before !== false && !event.notify_30min_before_sent && diffMins > 28 && diffMins <= 32) {
        const timeStr = start.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        const title = `⏰ Snart: ${event.title}`;
        const msg = `Starter kl. ${timeStr} — om 30 minutter`;
        await sendPushToEmails(emailsToNotify, title, msg);
        for (const email of emailsToNotify) {
          await sendEmailFallback(base44, email, event.title, timeStr, true);
        }
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_30min_before_sent: true });
        sentCount++;
      }
    }

    return Response.json({ success: true, sent: sentCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});