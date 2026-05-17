import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Send OneSignal push til alle subscribed brugere
async function sendOneSignalPush(title, message, url) {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  const body = {
    app_id: appId,
    included_segments: ['Subscribed Users'],
    headings: { en: title, da: title },
    contents: { en: message, da: message },
  };

  if (url) body.url = url;

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log('OneSignal svar:', JSON.stringify(data));
  return data;
}

// Hent alle OneSignal subscribers (external_user_id = email)
async function getOneSignalSubscriberEmails() {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  try {
    const res = await fetch(`https://onesignal.com/api/v1/players?app_id=${appId}&limit=300`, {
      headers: { 'Authorization': `Key ${apiKey}` },
    });
    const data = await res.json();
    const emails = new Set();
    for (const player of (data.players || [])) {
      if (player.external_user_id) {
        emails.add(player.external_user_id.toLowerCase());
      }
    }
    console.log('OneSignal subscribers fundet:', emails.size);
    return emails;
  } catch (e) {
    console.error('Kunne ikke hente OneSignal subscribers:', e.message);
    return new Set();
  }
}

// Send email fallback til brugere der IKKE er OneSignal subscribers
async function sendEmailFallback(base44, title, message, url, subscriberEmails) {
  const profiles = await base44.asServiceRole.entities.UserProfile.list();

  let sent = 0;
  for (const profile of profiles) {
    if (!profile.user_email) continue;
    // Skip hvis de allerede får push via OneSignal
    if (subscriberEmails.has(profile.user_email.toLowerCase())) continue;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: profile.user_email,
      subject: title,
      body: `<p>${message}</p>${url ? `<p><a href="${url}">Læs mere</a></p>` : ''}`,
    });
    sent++;
  }
  return sent;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, message, url } = await req.json();

    if (!title || !message) {
      return Response.json({ error: 'title og message er påkrævet' }, { status: 400 });
    }

    // 1. Send push via OneSignal til alle subscribed
    const pushData = await sendOneSignalPush(title, message, url);
    const pushRecipients = pushData.recipients || 0;

    // 2. Find hvem der er OneSignal subscribers
    const subscriberEmails = await getOneSignalSubscriberEmails();

    // 3. Send email til resten
    const emailsSent = await sendEmailFallback(base44, title, message, url, subscriberEmails);
    console.log('Email fallback sendt til:', emailsSent, 'brugere');

    return Response.json({ 
      success: true, 
      push_recipients: pushRecipients,
      ios_emails: emailsSent,
      onesignal_subscribers: subscriberEmails.size
    });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});