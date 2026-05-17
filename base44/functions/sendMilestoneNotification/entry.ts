import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { milestone_id } = await req.json();
    if (!milestone_id) return Response.json({ error: 'milestone_id required' }, { status: 400 });

    // Find notifikationstekst for denne milepæl
    const notifications = await base44.asServiceRole.entities.MilestoneNotification.filter({
      milestone_id,
      is_active: true,
    });

    if (!notifications.length) {
      return Response.json({ sent: false, reason: 'No notification configured for this milestone' });
    }

    const notif = notifications[0];
    const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    // Send OneSignal push (Android only — iOS understøtter ikke web push)
    const pushBody = {
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: [user.email] },
      target_channel: 'push',
      isIos: false,
      isAndroid: true,
      headings: { en: notif.title, da: notif.title },
      contents: { en: notif.message, da: notif.message },
    };

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify(pushBody),
    });

    const data = await res.json();
    console.log('OneSignal response:', JSON.stringify(data));

    // Send email som fallback (dækker iOS-brugere)
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: notif.title,
      body: `<p>${notif.message}</p>`,
    });

    return Response.json({ sent: true, milestone_id, title: notif.title });
  } catch (error) {
    console.error('sendMilestoneNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});