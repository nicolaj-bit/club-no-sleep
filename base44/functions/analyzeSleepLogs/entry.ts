import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    // Get user profile for child age
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    const ageMonths = getChildAgeMonths(profile?.child_birthdate);

    // Get last 7 days of sleep logs
    const allLogs = await base44.entities.SleepLog.filter({ user_email: user.email }, '-date', 7);

    if (allLogs.length === 0) {
      return Response.json({
        title: '🌙 Start med at logge',
        message: 'Log søvnen et par dage, så kan jeg begynde at give dig personlige råd og se mønstre i jeres søvn.',
        pattern: null,
        logs_count: 0,
      });
    }

    const logSummary = allLogs.map(l => ({
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

    const prompt = `Du er en varm og empatisk baby-søvnekspert. Analyser disse søvnlogs for en baby på ${ageMonths} måneder (${allLogs.length} dage logget):

${JSON.stringify(logSummary, null, 2)}

Lav en personlig analyse. Kig efter mønstre som:
- Mange natopvågninger
- Meget tidlig opvågning
- Lang indsovningstid
- Dårligt humør/overtræt
- Bekymringer nævnt i notater
- Uregelmæssig sengetid
- Om det faktisk ser godt ud – i så fald: giv en varm opmuntring og bekræft at de gør det godt

Skriv:
1. En varm, personlig titel med emoji (maks 8 ord)
2. En besked på 2-3 sætninger: anerkend det du ser i dataen + giv ét konkret handlingsorienteret råd ELLER en kærlig opmuntring hvis det ser godt ud
3. Én linje der opsummerer hvad du identificerede (til internt brug)

Skriv på dansk. Vær varm, empatisk og menneskelig – ikke klinisk.

Svar KUN som JSON: { "title": "...", "message": "...", "pattern": "..." }`;

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