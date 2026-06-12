import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Send email-notifikation til alle brugere (OneSignal er fjernet)
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

    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    let sent = 0;
    for (const profile of profiles) {
      if (!profile.user_email) continue;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: profile.user_email,
        subject: title,
        body: `<p>${message}</p>${url ? `<p><a href="${url}">Læs mere</a></p>` : ''}`,
      });
      sent++;
    }

    console.log('Email notifikationer sendt til:', sent, 'brugere');
    return Response.json({ success: true, emails_sent: sent });
  } catch (error) {
    console.error('sendPushNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});