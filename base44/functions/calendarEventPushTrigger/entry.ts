import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called by entity automation when a CalendarEvent is created
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;

    if (event?.type !== 'create') {
      return Response.json({ skipped: true });
    }

    const targetEmail = data?.user_email || data?.created_by;
    if (!targetEmail) {
      return Response.json({ skipped: true, reason: 'Ingen bruger-email på event' });
    }

    // Find active rules for calendar_event
    const rules = await base44.asServiceRole.entities.PushNotificationRule.filter({
      trigger_type: 'calendar_event',
      is_active: true,
    });

    if (rules.length === 0) {
      return Response.json({ skipped: true, reason: 'Ingen aktive kalender-regler' });
    }

    const appId = Deno.env.get('ONESIGNAL_APP_ID');
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    const results = [];
    for (const rule of rules) {
      // Replace placeholders in title/message with event data
      let title = rule.title || 'Ny kalenderaftale';
      let message = rule.message || 'Der er tilføjet en ny aftale';

      const eventDate = data?.start_datetime
        ? new Date(data.start_datetime).toLocaleDateString('da-DK')
        : '';

      if (data) {
        title = title.replace('{title}', data.title || '').replace('{date}', eventDate);
        message = message.replace('{title}', data.title || '').replace('{date}', eventDate);
      }

      const body = {
        app_id: appId,
        include_aliases: { external_id: [targetEmail] },
        target_channel: 'push',
        headings: { en: title, da: title },
        contents: { en: message, da: message },
      };

      if (rule.url) body.url = rule.url;

      const res = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      await base44.asServiceRole.entities.PushNotificationRule.update(rule.id, {
        last_triggered_at: new Date().toISOString(),
      });
      results.push({ rule_name: rule.name, recipients: result.recipients });
    }

    return Response.json({ success: true, triggered: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});