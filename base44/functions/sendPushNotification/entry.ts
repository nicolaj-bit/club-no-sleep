import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Detect iOS user agent
function isIOSEmail(userAgent) {
  return /iPad|iPhone|iPod/.test(userAgent || '');
}

// Send OneSignal push (Android/web only)
async function sendOneSignalPush(title, message, url) {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  const body = {
    app_id: appId,
    included_segments: ['All'],
    headings: { en: title, da: title },
    contents: { en: message, da: message },
    isIos: false,
    isAndroid: true,
    isAnyWeb: true,
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

  return await res.json();
}

// Send email fallback for iOS users
async function sendEmailToIOSUsers(base44, title, message, url) {
  const profiles = await base44.asServiceRole.entities.UserProfile.list();
  const users = await base44.asServiceRole.entities.User.list();

  const emailMap = {};
  for (const u of users) {
    emailMap[u.email] = u;
  }

  let sent = 0;
  for (const profile of profiles) {
    if (!profile.user_email) continue;
    const emailBody = url
      ? `${message}\n\n👉 ${url}`
      : message;

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

    // Send push til Android/web via OneSignal
    const pushData = await sendOneSignalPush(title, message, url);
    console.log('OneSignal push sendt:', JSON.stringify(pushData));

    // Send email til iOS brugere
    const emailsSent = await sendEmailToIOSUsers(base44, title, message, url);
    console.log('Emails sendt til iOS brugere:', emailsSent);

    return Response.json({ success: true, push_recipients: pushData.recipients, ios_emails: emailsSent });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});