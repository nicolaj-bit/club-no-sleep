import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

// Opret in-app notifikation i AppNotification entiteten
async function createInAppNotification(base44, email, title, message, leap) {
  await base44.asServiceRole.entities.AppNotification.create({
    title,
    message,
    emoji: '🌟',
    link: '/Knowledge',
    target_emails: [email],
    published_at: new Date().toISOString(),
  });
}

// Send email fallback for iOS users
async function sendEmailFallback(base44, email, leapName) {
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    subject: `🌟 ${leapName} starter i morgen!`,
    body: `<p>Hej! Dit barn starter på <strong>${leapName}</strong> i morgen.</p><p>Læs om hvad du kan forvente på <a href="https://app.lalatoto.dk/Knowledge">LALATOTO</a>.</p>`,
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    let notificationsSent = 0;

    for (const profile of profiles) {
      if (!profile.wonderweeks_notifications) continue;

      const dateStr = profile.child_due_date || profile.child_birthdate;
      if (!dateStr) continue;

      const ageDays = getAgeInDays(dateStr);
      const tomorrowWeeks = Math.floor((ageDays + 1) / 7);
      const leap = WONDER_WEEKS.find(ww => ww.week === tomorrowWeeks && (ageDays + 1) % 7 === 0);
      if (!leap) continue;

      const title = `🌟 ${leap.name}`;
      const message = `Dit barn starter på ${leap.name} i morgen! Læs om hvad du kan forvente.`;

      // Opret in-app notifikation (vises i klokken i appen)
      await createInAppNotification(base44, profile.user_email, title, message, leap);

      // Send email som backup
      await sendEmailFallback(base44, profile.user_email, leap.name);

      console.log(`Notifikation sendt til ${profile.user_email}: in-app=true, email=true`);
      notificationsSent++;
    }

    return Response.json({ success: true, notificationsSent });
  } catch (error) {
    console.error('checkWonderWeeks error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});