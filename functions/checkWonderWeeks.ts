import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Wonder weeks timing in weeks from due date
const WONDER_WEEKS = [
  { number: 1, week: 5, name: 'Tigerspring 1 – Sansernes verden' },
  { number: 2, week: 8, name: 'Tigerspring 2 – Mønstre' },
  { number: 3, week: 12, name: 'Tigerspring 3 – Overgange' },
  { number: 4, week: 19, name: 'Tigerspring 4 – Begivenheder' },
  { number: 5, week: 26, name: 'Tigerspring 5 – Relationer' },
  { number: 6, week: 37, name: 'Tigerspring 6 – Kategorier' },
  { number: 7, week: 46, name: 'Tigerspring 7 – Sekvenser' },
  { number: 8, week: 55, name: 'Tigerspring 8 – Programmer' },
  { number: 9, week: 64, name: 'Tigerspring 9 – Principper' },
  { number: 10, week: 75, name: 'Tigerspring 10 – Systemer' },
];

function getAgeInDays(dueDateStr) {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = now - due;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This is called by automation - use service role
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    const appId = Deno.env.get('ONESIGNAL_APP_ID');
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    let notificationsSent = 0;

    for (const profile of profiles) {
      if (!profile.wonderweeks_notifications) continue;
      
      const dateStr = profile.child_due_date || profile.child_birthdate;
      if (!dateStr) continue;

      const ageDays = getAgeInDays(dateStr);

      // Check if tomorrow is exactly the start week of a wonder week (notify 1 day before)
      const tomorrowWeeks = Math.floor((ageDays + 1) / 7);
      const leap = WONDER_WEEKS.find(ww => ww.week === tomorrowWeeks && (ageDays + 1) % 7 === 0);
      if (!leap) continue;

      // Send targeted notification to this user via external_user_id
      const body = {
        app_id: appId,
        include_aliases: { external_id: [profile.user_email] },
        target_channel: 'push',
        headings: { en: `🌟 ${leap.name}`, da: `🌟 ${leap.name}` },
        contents: {
          en: `Dit barn starter nu på ${leap.name}! Læs om hvad du kan forvente.`,
          da: `Dit barn starter på ${leap.name} i morgen! Læs om hvad du kan forvente.`,
        },
        url: 'https://app.lalatoto.dk/Knowledge',
      };

      const res = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) notificationsSent++;
    }

    return Response.json({ success: true, notificationsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});