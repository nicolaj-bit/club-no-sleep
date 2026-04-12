import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Helper: send OneSignal push
async function sendPush(title, message, url, segment = 'all') {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  const body = {
    app_id: appId,
    headings: { en: title, da: title },
    contents: { en: message, da: message },
  };

  if (segment === 'all') {
    body.included_segments = ['All'];
  } else if (segment === 'moms') {
    body.filters = [{ field: 'tag', key: 'profile_label', relation: '=', value: 'mor' }];
  } else if (segment === 'dads') {
    body.filters = [{ field: 'tag', key: 'profile_label', relation: '=', value: 'far' }];
  } else {
    body.included_segments = ['All'];
  }

  if (url) body.url = url;

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Called with { trigger_type, rule_id } — or from admin with { rule_id, send_now: true }
    const { trigger_type, rule_id, send_now } = payload;

    // Admin manual send — verify admin
    if (send_now && rule_id) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const rule = await base44.asServiceRole.entities.PushNotificationRule.get(rule_id);
      if (!rule) return Response.json({ error: 'Regel ikke fundet' }, { status: 404 });

      const result = await sendPush(rule.title, rule.message, rule.url, rule.target_segment);
      await base44.asServiceRole.entities.PushNotificationRule.update(rule_id, {
        last_triggered_at: new Date().toISOString(),
      });
      return Response.json({ success: true, recipients: result.recipients });
    }

    // Automated trigger — check rules matching trigger_type
    if (!trigger_type) {
      return Response.json({ error: 'trigger_type påkrævet' }, { status: 400 });
    }

    const rules = await base44.asServiceRole.entities.PushNotificationRule.filter({
      trigger_type,
      is_active: true,
    });

    const results = [];
    for (const rule of rules) {
      // For scheduled rules, check time and days
      if (trigger_type === 'scheduled') {
        const now = new Date();
        const copenhagenHour = now.toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen', hour: '2-digit', minute: '2-digit', hour12: false });
        const currentDay = new Date().toLocaleString('en-US', { timeZone: 'Europe/Copenhagen', weekday: 'short' });
        const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        const currentDayNum = dayMap[currentDay];

        if (rule.schedule_time && copenhagenHour !== rule.schedule_time) continue;
        if (rule.schedule_days && rule.schedule_days.length > 0 && !rule.schedule_days.includes(currentDayNum)) continue;
      }

      const result = await sendPush(rule.title, rule.message, rule.url, rule.target_segment);
      await base44.asServiceRole.entities.PushNotificationRule.update(rule.id, {
        last_triggered_at: new Date().toISOString(),
      });
      results.push({ rule_id: rule.id, rule_name: rule.name, recipients: result.recipients });
    }

    return Response.json({ success: true, triggered: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});