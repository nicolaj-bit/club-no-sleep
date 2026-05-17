import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Send OneSignal push (Android/web only — iOS understøtter ikke web push)
async function sendOneSignalPush(title, message, url, segment = 'all') {
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  const body = {
    app_id: appId,
    headings: { en: title, da: title },
    contents: { en: message, da: message },
    isIos: false,
    isAndroid: true,
    isAnyWeb: true,
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

// Send email til alle brugere som iOS fallback
async function sendEmailToAllUsers(base44, title, message, url, segment) {
  const profiles = await base44.asServiceRole.entities.UserProfile.list();

  let sent = 0;
  for (const profile of profiles) {
    if (!profile.user_email) continue;
    if (segment === 'moms' && profile.profile_label !== 'mor') continue;
    if (segment === 'dads' && profile.profile_label !== 'far') continue;

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
    const payload = await req.json();
    const { trigger_type, rule_id, send_now } = payload;

    // Admin manual send
    if (send_now && rule_id) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const rule = await base44.asServiceRole.entities.PushNotificationRule.get(rule_id);
      if (!rule) return Response.json({ error: 'Regel ikke fundet' }, { status: 404 });

      const pushResult = await sendOneSignalPush(rule.title, rule.message, rule.url, rule.target_segment);
      const emailsSent = await sendEmailToAllUsers(base44, rule.title, rule.message, rule.url, rule.target_segment);

      await base44.asServiceRole.entities.PushNotificationRule.update(rule_id, {
        last_triggered_at: new Date().toISOString(),
      });
      return Response.json({ success: true, push_recipients: pushResult.recipients, ios_emails: emailsSent });
    }

    // Automated trigger
    if (!trigger_type) {
      return Response.json({ error: 'trigger_type påkrævet' }, { status: 400 });
    }

    const rules = await base44.asServiceRole.entities.PushNotificationRule.filter({
      trigger_type,
      is_active: true,
    });

    console.log(`[processPushRules] trigger_type=${trigger_type}, fandt ${rules.length} aktive regler`);

    const results = [];
    for (const rule of rules) {
      if (trigger_type === 'scheduled') {
        const now = new Date();
        const copenhagenDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Copenhagen' }));
        const currentHH = String(copenhagenDate.getHours()).padStart(2, '0');
        const currentMM = String(copenhagenDate.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHH}:${currentMM}`;
        const currentDayNum = copenhagenDate.getDay(); // 0=Sun, 6=Sat

        if (rule.schedule_time && currentTime !== rule.schedule_time) continue;
        if (rule.schedule_days && rule.schedule_days.length > 0 && !rule.schedule_days.includes(currentDayNum)) continue;
      }

      console.log(`[processPushRules] Sender regel: ${rule.name} (id: ${rule.id})`);
      const pushResult = await sendOneSignalPush(rule.title, rule.message, rule.url, rule.target_segment);
      console.log(`[processPushRules] OneSignal resultat:`, JSON.stringify(pushResult));
      const emailsSent = await sendEmailToAllUsers(base44, rule.title, rule.message, rule.url, rule.target_segment);
      console.log(`[processPushRules] Emails sendt: ${emailsSent}`);

      await base44.asServiceRole.entities.PushNotificationRule.update(rule.id, {
        last_triggered_at: new Date().toISOString(),
      });
      results.push({ rule_id: rule.id, rule_name: rule.name, push_recipients: pushResult.recipients, ios_emails: emailsSent });
    }

    return Response.json({ success: true, triggered: results.length, results });
  } catch (error) {
    console.error('processPushRules error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});