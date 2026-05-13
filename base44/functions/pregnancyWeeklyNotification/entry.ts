import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';
const REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

const WEEK_TITLES = {
  4: 'Uge 4 – Det begynder!',
  5: 'Uge 5 – Hjertet slår',
  6: 'Uge 6 – Arme og ben spirer',
  7: 'Uge 7 – Hjernen vokser',
  8: 'Uge 8 – Alle organer anlagt',
  9: 'Uge 9 – Barnet bevæger sig',
  10: 'Uge 10 – Knoglerne hærder',
  11: 'Uge 11 – Næsten ud af første trimester',
  12: 'Uge 12 – Fingeraftryk dannes',
  13: 'Uge 13 – Andet trimester!',
  14: 'Uge 14 – Negle og tænder',
  15: 'Uge 15 – Du kan snart mærke bevægelser',
  16: 'Uge 16 – Barnet kan høre dig',
  17: 'Uge 17 – Fedt aflejres',
  18: 'Uge 18 – Bevægelser mærkes nu',
  19: 'Uge 19 – Midt i graviditeten',
  20: 'Uge 20 – HALVVEJS! 🎉',
  21: 'Uge 21 – Smagssansen aktiv',
  22: 'Uge 22 – Fingeraftryk er unikt',
  23: 'Uge 23 – Lungerne modnes',
  24: 'Uge 24 – En vigtig milepæl',
  25: 'Uge 25 – Barnet kan gribe',
  26: 'Uge 26 – Øjnene åbner sig',
  27: 'Uge 27 – Tredje trimester snart',
  28: 'Uge 28 – 1 kg!',
  29: 'Uge 29 – Hjernen vokser hurtigt',
  30: 'Uge 30 – Snart der!',
  31: 'Uge 31 – Alle sanser aktive',
  32: 'Uge 32 – Barnet vender sig',
  33: 'Uge 33 – Øver vejrtrækning',
  34: 'Uge 34 – Lungerne næsten modne',
  35: 'Uge 35 – Råmælk kan starte',
  36: 'Uge 36 – Snart fuldbåren',
  37: 'Uge 37 – FULDBÅREN! 🌟',
  38: 'Uge 38 – Klar til mødet',
  39: 'Uge 39 – Enhver dag nu',
  40: 'Uge 40 – TERMINEN! 👶',
  41: 'Uge 41 – Lidt tålmodighed endnu',
  42: 'Uge 42 – Snart tid for igangsætning',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both admin calls and scheduled automation calls
    let user = null;
    try {
      user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      // Called from automation without user context — allowed
    }

    // Fetch all profiles with a due date set
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const today = new Date();
    let sent = 0;

    for (const profile of profiles) {
      if (!profile.child_due_date || !profile.user_email) continue;

      const dueDate = new Date(profile.child_due_date);
      const daysUntilDue = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
      const currentWeek = 40 - Math.round(daysUntilDue / 7);

      if (currentWeek < 4 || currentWeek > 42) continue;

      const title = WEEK_TITLES[currentWeek] || `Graviditet uge ${currentWeek}`;

      // Send targeted notification to this user via their email tag
      const body = {
        app_id: ONESIGNAL_APP_ID,
        filters: [{ field: 'tag', key: 'email', relation: '=', value: profile.user_email }],
        headings: { da: title, en: title },
        contents: {
          da: '🤰 Åben appen for at læse om din babys udvikling denne uge.',
          en: '🤰 Open the app to read about your baby\'s development this week.'
        },
        url: 'https://lalatoto.dk/Knowledge',
      };

      const res = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${REST_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) sent++;
    }

    return Response.json({ success: true, notificationsSent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});