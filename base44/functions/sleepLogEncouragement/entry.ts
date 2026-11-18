import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { normalizeLanguage } from '../../shared/i18n.js';

function getLastNDays(n) {
  const days = [];
  for (let i = 0; i < n; i++) {
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

async function analyzeLogsWithAI(base44, logs, ageMonths, previousAdvice, lang) {
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

  const previousContext = previousAdvice.length === 0
    ? ''
    : lang === 'en'
      ? `\n\nAdvice already given (avoid repeating it):\n${previousAdvice.map(a => `- "${a.ai_title}": ${a.ai_message} (feedback: ${a.feedback || 'none'})`).join('\n')}`
      : `\n\nTidligere råd givet (undgå at gentage dem):\n${previousAdvice.map(a => `- "${a.ai_title}": ${a.ai_message} (feedback: ${a.feedback || 'ingen'})`).join('\n')}`;

  const promptDa = `Du er en varm og empatisk baby-søvnekspert. Analyser disse søvnlogs for en baby på ${ageMonths} måneder over de seneste dage:

${JSON.stringify(logSummary, null, 2)}
${previousContext}

Identificer det VIGTIGSTE mønster eller problem lige nu (fx mange natopvågninger, meget tidlig opvågning, lang indsovningstid, dårligt humør, gråd/uro nævnt i notater, uregelmæssig sengetid).

Returner en push-notifikation med:
1. En kort, varm titel (maks 8 ord) med relevant emoji
2. En kærlig besked på 1-2 sætninger: anerkend situationen + ét konkret handlingsorienteret råd.
3. En kort intern beskrivelse af det identificerede mønster (til feedback-læring, vises ikke til bruger, maks 20 ord).

Skriv på dansk. Vær varm, ikke klinisk. Varier dine råd og undgå at gentage tidligere råd der ikke hjalp.

Svar KUN som JSON: { "title": "...", "message": "...", "pattern": "..." }`;

  const promptEn = `You are a warm and empathetic baby sleep expert. Analyse these sleep logs for a baby of ${ageMonths} months over the last few days:

${JSON.stringify(logSummary, null, 2)}
${previousContext}

Identify the MOST important pattern or problem right now (for example many night wakings, waking very early, a long time to fall asleep, low mood, crying or unrest mentioned in the notes, irregular bedtime).

Return a push notification with:
1. A short, warm title (8 words maximum) with a relevant emoji
2. A loving message of 1 to 2 sentences: acknowledge the situation, plus one concrete, actionable piece of advice.
3. A short internal description of the pattern you identified (for feedback learning, not shown to the user, 20 words maximum).

Write in English. Be warm, not clinical. Vary your advice and avoid repeating earlier advice that did not help.

Answer ONLY as JSON: { "title": "...", "message": "...", "pattern": "..." }`;

  const prompt = lang === 'en' ? promptEn : promptDa;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        pattern: { type: 'string' },
      },
    },
  });

  return result;
}

async function sendPushNotification(apiKey, appId, userEmail, title, message, feedbackId, lang) {
  const feedbackUrl = `https://app.lalatoto.dk/SleepAdviceFeedback?id=${feedbackId}`;

  const body = {
    app_id: appId,
    include_aliases: { external_id: [userEmail] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
    url: feedbackUrl,
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
    buttons: lang === 'en'
      ? [
          { id: 'helpful', text: '👍 This helped' },
          { id: 'not_helpful', text: '👎 Did not help' },
        ]
      : [
          { id: 'helpful', text: '👍 Hjalp mig' },
          { id: 'not_helpful', text: '👎 Hjalp ikke' },
        ],
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

    const today = new Date().toISOString().split('T')[0];
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const last5Days = getLastNDays(5);

    let notificationsSent = 0;
    let skipped = 0;

    for (const profile of profiles) {
      if (!profile.wonderweeks_notifications) { skipped++; continue; }
      if (!profile.user_email) { skipped++; continue; }

      // Get all sleep logs for this user
      const allLogs = await base44.asServiceRole.entities.SleepLog.filter({ user_email: profile.user_email });
      const logDates = allLogs.map(l => l.date);

      // Only proceed if user has logged all 5 of the last 5 days
      const hasAll5Days = last5Days.every(day => logDates.includes(day));
      if (!hasAll5Days) { skipped++; continue; }

      // Don't send more than one notification per day per user
      const allFeedback = await base44.asServiceRole.entities.SleepAdviceFeedback.filter({ user_email: profile.user_email });
      const alreadySentToday = allFeedback.some(f => f.sent_date === today);
      if (alreadySentToday) { skipped++; continue; }

      // Get previous advice to avoid repetition and learn from feedback
      const previousAdvice = allFeedback
        .sort((a, b) => new Date(b.sent_date) - new Date(a.sent_date))
        .slice(0, 10); // last 10 pieces of advice

      // Get last 7 days of actual logs for analysis
      const last7Days = getLastNDays(7);
      const recentLogs = allLogs.filter(l => last7Days.includes(l.date));

      const ageMonths = getChildAgeMonths(profile.child_birthdate);
      // Sproget staar paa profilen, som allerede er hentet — intet ekstra opslag.
      const lang = normalizeLanguage(profile.language);

      // Ask AI to analyze and generate a personalized notification
      const aiResult = await analyzeLogsWithAI(base44, recentLogs, ageMonths, previousAdvice, lang);
      if (!aiResult?.title || !aiResult?.message) { skipped++; continue; }

      // Save the advice record first so we have an ID for the feedback link
      const adviceRecord = await base44.asServiceRole.entities.SleepAdviceFeedback.create({
        user_email: profile.user_email,
        ai_title: aiResult.title,
        ai_message: aiResult.message,
        sent_date: today,
        child_age_months: ageMonths,
        log_summary: aiResult.pattern || '',
      });

      const sent = await sendPushNotification(apiKey, appId, profile.user_email, aiResult.title, aiResult.message, adviceRecord.id, lang);
      if (sent) notificationsSent++;
    }

    return Response.json({ success: true, notificationsSent, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});