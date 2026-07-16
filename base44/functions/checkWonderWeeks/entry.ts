import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Wonder weeks timing in weeks from DUE DATE (never from birth date)
const WONDER_WEEKS = [
  { number: 1, week: 5, name: 'Sansernes verden' },
  { number: 2, week: 8, name: 'Monstre' },
  { number: 3, week: 12, name: 'Overgange' },
  { number: 4, week: 19, name: 'Begivenheder' },
  { number: 5, week: 26, name: 'Relationer' },
  { number: 6, week: 37, name: 'Kategorier' },
  { number: 7, week: 46, name: 'Sekvenser' },
  { number: 8, week: 55, name: 'Programmer' },
  { number: 9, week: 71, name: 'Principper' },
  { number: 10, week: 75, name: 'Systemer' },
];

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
const REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

function getAgeInDays(dueDateStr) {
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((now - due) / (24 * 60 * 60 * 1000));
}

async function createInAppNotification(base44, email, title, message) {
  await base44.asServiceRole.entities.AppNotification.create({
    title,
    message,
    link: '/Knowledge',
    target_emails: [email],
    published_at: new Date().toISOString(),
  });
}

async function sendPush(email, title, message) {
  if (!ONESIGNAL_APP_ID || !REST_API_KEY) return false;
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [email] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
  };
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const profiles = await base44.asServiceRole.entities.UserProfile.list();
    const children = await base44.asServiceRole.entities.Child.list();

    // Opt-in pr. bruger
    const notifByOwner = new Map();
    for (const p of profiles) {
      notifByOwner.set(p.user_email, p.wonderweeks_notifications === true);
    }

    // Grupper børn pr. user_email
    const childrenByOwner = new Map();
    for (const child of children) {
      if (!child.user_email || !child.due_date) continue;
      if (!childrenByOwner.has(child.user_email)) {
        childrenByOwner.set(child.user_email, []);
      }
      childrenByOwner.get(child.user_email).push(child);
    }

    let sent = 0;

    for (const [email, kids] of childrenByOwner) {
      // Skip hvis brugeren ikke har slået tigerspring-notifikationer til
      if (!notifByOwner.get(email)) continue;

      for (const child of kids) {
        // Tigerspring beregnes ALTID ud fra terminsdato — aldrig fødselsdato
        const ageDays = getAgeInDays(child.due_date);
        if (ageDays < 0) continue;

        for (const ww of WONDER_WEEKS) {
          // Præcis én dag: dagen før tigerspringet starter
          if (ageDays === (ww.week - 1) * 7) {
            const title = 'Et nyt tigerspring nærmer sig';
            const message = 'Baby kan være på vej ind i en periode, hvor verden bliver lidt større. Læs mere i appen.';
            await createInAppNotification(base44, email, title, message);
            await sendPush(email, title, message);
            console.log(`Tigerspring approaching sent til ${email}: ${ww.name} (child ${child.id})`);
            sent++;
          }

          // Præcis én dag: startdagen
          if (ageDays === ww.week * 7) {
            const title = 'Tigerspring';
            const message = 'Der ligger en ny udviklingsguide klar til jer.';
            await createInAppNotification(base44, email, title, message);
            await sendPush(email, title, message);
            console.log(`Tigerspring start sent til ${email}: ${ww.name} (child ${child.id})`);
            sent++;
          }
        }
      }
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('checkWonderWeeks error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});