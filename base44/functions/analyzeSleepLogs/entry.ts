import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { computeSessionTotals } from '../../shared/sleepSession.js';
import { getUserLanguage } from '../../shared/i18n.js';

function getChildAgeMonths(birthdateStr) {
  if (!birthdateStr) return 6;
  const birth = new Date(birthdateStr);
  const now = new Date();
  return Math.floor((now - birth) / (30.44 * 24 * 60 * 60 * 1000));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sessionId = body?.session_id;

    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    // Raadgiverens svar skal vaere paa brugerens eget sprog. Instruktionen til
    // modellen skrives derfor paa det sprog, svaret skal have — en instruktion
    // paa dansk giver et dansk svar, uanset hvad man beder om til sidst.
    const lang = await getUserLanguage(base44, user.email);
    const ageMonths = getChildAgeMonths(profile?.child_birthdate);

    let targetSession = null;
    let allLogs = [];

    if (sessionId) {
      const sessions = await base44.entities.SleepLog.filter({ id: sessionId, user_email: user.email });
      targetSession = sessions?.[0] || null;
      if (!targetSession) {
        return Response.json({ error: 'Session not found' }, { status: 404 });
      }
      allLogs = await base44.entities.SleepLog.filter({ user_email: user.email }, '-date', 7);
    } else {
      allLogs = await base44.entities.SleepLog.filter({ user_email: user.email }, '-date', 7);
      targetSession = allLogs[0];
    }

    if (allLogs.length === 0 && !targetSession) {
      return Response.json({
        title: lang === 'en' ? 'Start by logging' : 'Start med at logge',
        message: lang === 'en'
          ? 'Log sleep for a few days and I can begin giving you personal advice and spotting patterns in your nights.'
          : 'Log søvnen et par dage, så kan jeg begynde at give dig personlige råd og se mønstre i jeres søvn.',
        pattern: null,
        logs_count: 0,
      });
    }

    const logSummary = allLogs.map(l => {
      if (l.periods && l.periods.length > 0) {
        const totals = computeSessionTotals(l);
        return {
          date: l.date,
          total_sleep_minutes: Math.round(totals.totalSleepMs / 60000),
          total_awake_minutes: Math.round(totals.totalAwakeMs / 60000),
          wake_count: totals.wakeCount,
          parent_note: l.parent_note || '',
        };
      }
      return {
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
      };
    });

    let sessionContext = '';
    if (sessionId && targetSession) {
      const totals = computeSessionTotals(targetSession);
      sessionContext = lang === 'en'
        ? `\n\nFocus on last night's session:\n- Total sleep: ${Math.round(totals.totalSleepMs / 60000)} minutes\n- Number of wake-ups: ${totals.wakeCount}\n- Total awake: ${Math.round(totals.totalAwakeMs / 60000)} minutes`
        : `\n\nFokus på nattens session:\n- Samlet søvn: ${Math.round(totals.totalSleepMs / 60000)} minutter\n- Antal opvågninger: ${totals.wakeCount}\n- Samlet vågen: ${Math.round(totals.totalAwakeMs / 60000)} minutter`;
    }

    const promptDa = `Du er en varm og empatisk baby-søvnekspert. Analyser disse søvnlogs for en baby på ${ageMonths} måneder (${allLogs.length} dage logget):

${JSON.stringify(logSummary, null, 2)}${sessionContext}

Lav en personlig analyse. Kig efter mønstre som:
- Mange natopvågninger
- Meget tidlig opvågning
- Lang indsovningstid
- Uregelmæssig sengetid
- Om det faktisk ser godt ud – i så fald: giv en varm opmuntring og bekræft at de gør det godt

Skriv:
1. En varm, personlig titel (maks 8 ord)
2. En besked på 2-3 sætninger: anerkend det du ser i dataen + giv ét konkret handlingsorienteret råd ELLER en kærlig opmuntring hvis det ser godt ud
3. Én linje der opsummerer hvad du identificerede (til internt brug)

Skriv på dansk. Vær varm, empatisk og menneskelig – ikke klinisk.

Svar KUN som JSON: { "title": "...", "message": "...", "pattern": "..." }`;

    const promptEn = `You are a warm and empathetic baby sleep expert. Analyse these sleep logs for a baby of ${ageMonths} months (${allLogs.length} days logged):

${JSON.stringify(logSummary, null, 2)}${sessionContext}

Write a personal analysis. Look for patterns such as:
- Many night wakings
- Waking very early
- A long time to fall asleep
- Irregular bedtime
- Whether it actually looks good — in which case give warm encouragement and confirm that they are doing well

Write:
1. A warm, personal title (8 words maximum)
2. A message of 2 to 3 sentences: acknowledge what you see in the data, plus one concrete, actionable piece of advice OR loving encouragement if things look good
3. One line summarising what you identified (for internal use)

Write in English. Be warm, empathetic and human — not clinical.

Answer ONLY as JSON: { "title": "...", "message": "...", "pattern": "..." }`;

    const prompt = lang === 'en' ? promptEn : promptDa;

    const result = await base44.integrations.Core.InvokeLLM({
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

    return Response.json({ ...result, logs_count: allLogs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});