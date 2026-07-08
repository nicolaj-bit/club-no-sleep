import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Opret in-app notifikationer for en liste af emails — ingen emojis
async function createInAppNotifications(base44, emails, title, message, link) {
  for (const email of emails) {
    await base44.asServiceRole.entities.AppNotification.create({
      title,
      message,
      link: link || '/Calendar',
      target_emails: [email],
      published_at: new Date().toISOString(),
    });
  }
}

async function sendEmailFallback(base44, email, eventTitle, eventTime, isReminder30min) {
  try {
    const subject = isReminder30min
      ? `Om 30 min: ${eventTitle}`
      : `Husk i morgen: ${eventTitle}`;

    const preheader = isReminder30min
      ? `Din aftale starter kl. ${eventTime}`
      : `Du har en aftale i morgen kl. ${eventTime}`;

    const headingText = isReminder30min
      ? `Om 30 minutter`
      : `I morgen`;

    const bodyText = isReminder30min
      ? `Din aftale <strong>${eventTitle}</strong> starter kl. <strong>${eventTime}</strong>.`
      : `Du har en aftale i morgen kl. <strong>${eventTime}</strong>:<br><strong>${eventTitle}</strong>`;

    const html = `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F1;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background-color:#FFFDF9;border-radius:16px;overflow:hidden;border:1px solid #EDE4DB;">
          <tr>
            <td style="background-color:#5B3F2B;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:13px;letter-spacing:0.15em;color:#C9AA8F;text-transform:uppercase;font-weight:500;">CLUB NO SLEEP</p>
              <p style="margin:8px 0 0;font-size:22px;color:#FFFDF9;font-weight:300;letter-spacing:0.05em;">${headingText}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#2B1F16;">${bodyText}</p>
              <hr style="border:none;border-top:1px solid #EDE4DB;margin:24px 0;">
              <p style="margin:0;font-size:13px;color:#7A665A;line-height:1.6;">
                Denne paamindelse er sendt fra din Club No Sleep kalender.<br>
                Du kan administrere dine aftaler direkte i appen.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#F3E9E1;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B08D72;">Club No Sleep - Sendt fordi du har aktiveret kalender-paamindelser</p>
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
      from_name: 'Club No Sleep',
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
    const body = await req.json().catch(() => ({}));
    const forceEmail = body.force_email;

    if (forceEmail) {
      await sendEmailFallback(base44, forceEmail.email, forceEmail.title || 'Test aftale', forceEmail.time || '14:30', forceEmail.is30min !== false);
      return Response.json({ success: true, sent: 1, mode: 'force_test' });
    }

    const createTest = body.create_test_event_for;
    if (createTest) {
      const in30min = new Date(Date.now() + 30 * 60 * 1000);
      const event = await base44.asServiceRole.entities.CalendarEvent.create({
        title: createTest.title || 'Test aftale',
        description: 'Test-event til 30-min notifikationstest',
        start_datetime: in30min.toISOString(),
        user_email: createTest.email,
        category: 'andet',
        notify_day_before: false,
        notify_30min_before: true,
        notify_day_before_sent: true,
        notify_30min_before_sent: false,
      });
      return Response.json({ success: true, created_event: event.id, starts_at: in30min.toISOString(), mode: 'test_event_created' });
    }

    const now = new Date();
    console.log(`[calendarNotifications] Kører nu: ${now.toISOString()}`);

    const allEvents = await base44.asServiceRole.entities.CalendarEvent.list();
    console.log(`[calendarNotifications] Fandt ${allEvents.length} events`);

    let sentCount = 0;

    for (const event of allEvents) {
      const start = new Date(event.start_datetime);
      const diffMs = start - now;
      const diffMins = diffMs / 60000;

      console.log(`[calendarNotifications] Event: "${event.title}" starter ${start.toISOString()}, om ${diffMins.toFixed(1)} minutter. notify_30min_before_sent=${event.notify_30min_before_sent}`);

      const emailsToNotify = [event.user_email];

      // Dagen før: mellem 23.5 og 25 timer til aftalen
      if (event.notify_day_before !== false && !event.notify_day_before_sent && diffMins > 23.5 * 60 && diffMins <= 25 * 60) {
        const dateStr = start.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' });
        const timeStr = start.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        const title = `Du har en aftale i morgen`;
        const msg = `${event.title} kl. ${timeStr}`;
        await createInAppNotifications(base44, emailsToNotify, title, msg, '/Calendar');
        for (const email of emailsToNotify) {
          await sendEmailFallback(base44, email, event.title, timeStr, false);
        }
        await base44.asServiceRole.entities.CalendarEvent.update(event.id, { notify_day_before_sent: true });
        sentCount++;
      }

      // 30 min før: mellem 28 og 32 minutter til aftalen
      if (event.notify_30min_before !== false && !event.notify_30min_before_sent && diffMins > 28 && diffMins <= 32) {
        const timeStr = start.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
        const title = `Du har en aftale snart`;
        const msg = `${event.title} kl. ${timeStr}`;
        await createInAppNotifications(base44, emailsToNotify, title, msg, '/Calendar');
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