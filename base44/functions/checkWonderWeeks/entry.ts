import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { getCurrentLeapNumber, getLeapByNumber } from '../../shared/getWonderWeek.js';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
const REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

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
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
  };
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${REST_API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const result = await res.json().catch(() => ({}));
    console.error(`OneSignal fejl for ${email}:`, JSON.stringify(result));
  }
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

    let sent = 0;

    for (const child of children) {
      if (!child.user_email || !child.due_date) continue;
      // Skip hvis brugeren ikke har slået tigerspring-notifikationer til
      if (!notifByOwner.get(child.user_email)) continue;

      // Tigerspring beregnes ALTID ud fra terminsdato — aldrig fødselsdato.
      // Samme kilde som app-visningen (base44/shared/getWonderWeek.js).
      const currentLeap = getCurrentLeapNumber(child.due_date);
      if (currentLeap === null) continue;

      // Idempotens pr. spring pr. barn: send KUN hvis aktuelt spring er
      // ANDERLEDES end sidst notificerede spring. Er det samme spring → send IKKE.
      if (currentLeap === child.last_notified_leap) {
        continue;
      }

      // Sæt last_notified_leap FØR afsendelse — guard mod gentagne/samtidige
      // kørsler, så resten af ugen (eller dagen) ikke sender igen.
      await base44.asServiceRole.entities.Child.update(child.id, {
        last_notified_leap: currentLeap,
      });

      const ww = getLeapByNumber(currentLeap);
      const title = 'Tigerspring';
      const message = ww
        ? `Spring ${currentLeap}: ${ww.name} ligger klar til dig i appen.`
        : 'Der ligger en ny udviklingsguide klar til jer i appen.';

      await createInAppNotification(base44, child.user_email, title, message);
      await sendPush(child.user_email, title, message);

      console.log(`Tigerspring ${currentLeap} notifikation sendt til ${child.user_email} (barn ${child.id})`);
      sent++;
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('checkWonderWeeks error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});