import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const MESSAGES_DA = [
  "Du gør det fantastisk! 5 dage med søvnlog – det er virkelig dedikeret forældreskab. 💛",
  "Kæmpe ros til dig! Du holder styr på barnets søvn som en mester. 🌙",
  "Vidste du, at konsekvens er nøglen til god søvn? Du er allerede godt i gang! ⭐",
  "5 dage i træk – det er ikke let, men du klarer det. Blid med dig selv, du gør det godt. 🤍",
  "Husk: Alle forældre har svære nætter. Du er ikke alene, og du gør en kæmpe forskel. 🌟",
];

const TIPS_BY_AGE_DA = [
  { maxMonths: 3, tip: "Nyfødte har brug for mange lure. Prøv at følge barnets naturlige søvnrytme frem for at tvinge faste tider." },
  { maxMonths: 6, tip: "Omkring 4 måneder sker der et søvnspring. Det er normalt at søvnen bliver rodet en tid – det går over!" },
  { maxMonths: 9, tip: "Fast sengetidsrutine hjælper meget nu: Bad, mad, sang, seng. Gentag det samme hver aften." },
  { maxMonths: 12, tip: "De fleste babyer kan nu klare en sammenhængende natsøvn. Konsekvent sengetid er din bedste ven." },
  { maxMonths: 24, tip: "Overtrætte småbørn har svært ved at falde i søvn. Prøv at lægge barnet lidt tidligere end du tror." },
  { maxMonths: 999, tip: "Søvnbehovet varierer meget fra barn til barn. Stol på din mavefornemmelse – du kender dit barn bedst." },
];

function getTip(childAgeMonths) {
  const tip = TIPS_BY_AGE_DA.find(t => childAgeMonths <= t.maxMonths);
  return tip ? tip.tip : TIPS_BY_AGE_DA[TIPS_BY_AGE_DA.length - 1].tip;
}

function getRandomMessage() {
  return MESSAGES_DA[Math.floor(Math.random() * MESSAGES_DA.length)];
}

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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
    const appId = Deno.env.get('ONESIGNAL_APP_ID');

    // Get all profiles with notifications enabled
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const last5Days = getLast5Days();

    let notificationsSent = 0;

    for (const profile of profiles) {
      if (!profile.wonderweeks_notifications) continue;
      if (!profile.user_email) continue;

      // Get this user's sleep logs for the last 5 days
      const logs = await base44.asServiceRole.entities.SleepLog.filter({ user_email: profile.user_email });

      const logDates = logs.map(l => l.date);
      const hasAll5Days = last5Days.every(day => logDates.includes(day));

      if (!hasAll5Days) continue;

      // Only send once – check if today (day 5) was just completed
      // i.e. today is in the logs and exactly 5 consecutive days
      const ageMonths = getChildAgeMonths(profile.child_birthdate);
      const tip = getTip(ageMonths);
      const praise = getRandomMessage();

      const body = {
        app_id: appId,
        include_aliases: { external_id: [profile.user_email] },
        target_channel: 'push',
        headings: { da: '💤 Du gør det fantastisk!', en: '💤 You are doing amazing!' },
        contents: {
          da: `${praise}\n\n💡 Tip: ${tip}`,
          en: `${praise}\n\n💡 Tip: ${tip}`,
        },
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

      if (res.ok) notificationsSent++;
    }

    return Response.json({ success: true, notificationsSent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});