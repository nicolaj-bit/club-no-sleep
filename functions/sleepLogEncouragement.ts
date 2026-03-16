import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function getLast5Days() {
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getChildAgeMonths(birthdateStr) {
  if (!birthdateStr) return 6;
  const birth = new Date(birthdateStr);
  const now = new Date();
  return Math.floor((now - birth) / (30.44 * 24 * 60 * 60 * 1000));
}

async function analyzeLogsWithAI(base44, logs, ageMonths) {
  const logSummary = logs.map(l => ({
    date: l.date,
    bedtime: l.bedtime,
    sleep_time: l.sleep_time,
    wake_time: l.wake_time,
    minutes_to_sleep: l.minutes_to_sleep,
    night_wakings: l.night_wakings?.length || 0,
    naps: l.naps?.length || 0,
    sleep_method: l.sleep_method,
    bedtime_mood: l.bedtime_mood,
    parent_note: l.parent_note || '',
  }));

  const prompt = `Du er en varm og empatisk baby-søvnekspert. Analyser disse søvnlogs for en baby på ${ageMonths} måneder over de seneste 5 dage:

${JSON.stringify(logSummary, null, 2)}

Identificer det VIGTIGSTE mønster eller problem (fx mange natopvågninger, meget tidlig opvågning, lang indsovningstid, dårligt humør, forælderens egne noter om bekymringer).

Returner en push-notifikation med:
1. En kort, varm titel (maks 8 ord) med relevant emoji
2. En kærlig besked på 1-2 sætninger der anerkender situationen + giver ét konkret, handlingsorienteret råd baseret på det identificerede mønster.

Skriv på dansk. Vær varm, ikke klinisk. Undgå at lyde som en robot.

Svar KUN som JSON: { "title": "...", "message": "..." }`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
      },
    },
  });

  return result;
}

async function sendPushNotification(apiKey, appId, userEmail, title, message) {
  const body = {
    app_id: appId,
    include_aliases: { external_id: [userEmail] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
    url: 'https://app.lalatoto.dk/SleepLog',
  };

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
    const appId = Deno.env.get('ONESIGNAL_APP_ID');

    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const last5Days = getLast5Days();

    let notificationsSent = 0;
    let skipped = 0;

    for (const profile of profiles) {
      if (!profile.wonderweeks_notifications) { skipped++; continue; }
      if (!profile.user_email) { skipped++; continue; }

      // Get this user's sleep logs
      const allLogs = await base44.asServiceRole.entities.SleepLog.filter({ user_email: profile.user_email });
      const logDates = allLogs.map(l => l.date);

      // Only proceed if user has logged all 5 days
      const hasAll5Days = last5Days.every(day => logDates.includes(day));
      if (!hasAll5Days) { skipped++; continue; }

      // Get the actual log objects for the last 5 days
      const recentLogs = allLogs.filter(l => last5Days.includes(l.date));

      const ageMonths = getChildAgeMonths(profile.child_birthdate);

      // Ask AI to analyze and generate a personalized notification
      const aiResult = await analyzeLogsWithAI(base44, recentLogs, ageMonths);

      if (!aiResult?.title || !aiResult?.message) { skipped++; continue; }

      const sent = await sendPushNotification(apiKey, appId, profile.user_email, aiResult.title, aiResult.message);
      if (sent) notificationsSent++;
    }

    return Response.json({ success: true, notificationsSent, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});