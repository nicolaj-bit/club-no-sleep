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

    // Send via OneSignal
    const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    const body = {
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: [user.email] },
      target_channel: 'push',
      headings: { en: notif.title, da: notif.title },
      contents: { en: notif.message, da: notif.message },
    };

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log('OneSignal response:', JSON.stringify(data));

    return Response.json({ sent: true, milestone_id, title: notif.title });
  } catch (error) {
    console.error('sendMilestoneNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});