import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Milestone definitions: { milestone_id, category, label, headline }
// We map age-based milestones to exact age thresholds
const AGE_MILESTONES = [
  // Uger (fra fødsel)
  { milestone_id: 'age-1w',  days: 7,   headline: '1 uge gammel',          emoji: '🤍' },
  { milestone_id: 'age-2w',  days: 14,  headline: '2 uger gammel',          emoji: '🤍' },
  { milestone_id: 'age-3w',  days: 21,  headline: '3 uger gammel',          emoji: '🤍' },
  // Måneder
  { milestone_id: 'age-1m',  days: 30,  headline: '1 måned gammel',         emoji: '🌙' },
  { milestone_id: 'age-2m',  days: 61,  headline: '2 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-3m',  days: 91,  headline: '3 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-4m',  days: 122, headline: '4 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-5m',  days: 152, headline: '5 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-6m',  days: 183, headline: '6 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-7m',  days: 213, headline: '7 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-8m',  days: 244, headline: '8 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-9m',  days: 274, headline: '9 måneder gammel',        emoji: '🌙' },
  { milestone_id: 'age-10m', days: 305, headline: '10 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-11m', days: 335, headline: '11 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-12m', days: 365, headline: '12 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-13m', days: 396, headline: '13 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-14m', days: 426, headline: '14 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-15m', days: 457, headline: '15 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-16m', days: 487, headline: '16 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-17m', days: 518, headline: '17 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-18m', days: 548, headline: '18 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-19m', days: 579, headline: '19 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-20m', days: 609, headline: '20 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-21m', days: 640, headline: '21 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-22m', days: 670, headline: '22 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-23m', days: 701, headline: '23 måneder gammel',       emoji: '🌙' },
  { milestone_id: 'age-24m', days: 731, headline: '24 måneder gammel',       emoji: '🌙' },
  // Fødselsdage
  { milestone_id: 'age-1y',  days: 365, headline: '1 års fødselsdag',        emoji: '🎂' },
  { milestone_id: 'age-2y',  days: 730, headline: '2 års fødselsdag',        emoji: '🎂' },
  { milestone_id: 'age-3y',  days: 1095,headline: '3 års fødselsdag',        emoji: '🎂' },
];

// Pregnancy milestones based on weeks pregnant
const PREGNANCY_MILESTONES = [
  { milestone_id: 'preg-4',  weeks: 4,  headline: '4 uger i maven',   emoji: '🌿' },
  { milestone_id: 'preg-8',  weeks: 8,  headline: '8 uger i maven',   emoji: '🌿' },
  { milestone_id: 'preg-12', weeks: 12, headline: '12 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-16', weeks: 16, headline: '16 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-20', weeks: 20, headline: '20 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-24', weeks: 24, headline: '24 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-28', weeks: 28, headline: '28 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-32', weeks: 32, headline: '32 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-36', weeks: 36, headline: '36 uger i maven',  emoji: '🌿' },
  { milestone_id: 'preg-40', weeks: 40, headline: '40 uger i maven',  emoji: '🎉' },
  { milestone_id: 'preg-41', weeks: 41, headline: '41 uger i maven',  emoji: '🧸' },
  { milestone_id: 'preg-42', weeks: 42, headline: '42 uger i maven',  emoji: '🧸' },
];

const ONESIGNAL_APP_ID = '71bec506-d231-47da-aa17-f8790b335a32';

function daysSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - d) / (24 * 60 * 60 * 1000));
}

function weeksSince(dateStr) {
  return Math.floor(daysSince(dateStr) / 7);
}

// Weeks pregnant = weeks from LMP ≈ due_date - 40 weeks
function weeksPregnant(dueDateStr) {
  const due = new Date(dueDateStr);
  const now = new Date();
  const daysUntilDue = Math.floor((due - now) / (24 * 60 * 60 * 1000));
  return 40 - Math.ceil(daysUntilDue / 7);
}

async function sendPush(email, title, message, apiKey) {
  const body = {
    app_id: ONESIGNAL_APP_ID,
    include_aliases: { external_id: [email] },
    target_channel: 'push',
    headings: { da: title, en: title },
    contents: { da: message, en: message },
    url: 'https://app.lalatoto.dk/Milestones',
  };

  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log(`Push til ${email}:`, JSON.stringify(data));
  return res.ok;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    // Hent alle børn
    const children = await base44.asServiceRole.entities.Child.list();
    // Hent alle profiler (for user_email)
    const profiles = await base44.asServiceRole.entities.UserProfile.list();

    const profileByEmail = {};
    for (const p of profiles) {
      profileByEmail[p.user_email] = p;
    }

    let sent = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const child of children) {
      const email = child.user_email;
      if (!email) continue;

      // ── Aldersbaserede milepæle (barn er født) ──
      if (child.birthdate) {
        const ageDays = daysSince(child.birthdate);

        for (const m of AGE_MILESTONES) {
          if (ageDays === m.days) {
            const title = `${m.emoji} ${m.headline}`;
            const message = `${child.name} er ${m.headline.toLowerCase()} i dag! Fang øjeblikket med en milepæls-sticker 📸`;
            const ok = await sendPush(email, title, message, apiKey);
            if (ok) sent++;
          }
        }
      }

      // ── Graviditets-milepæle (barn ikke født endnu) ──
      if (!child.birthdate && child.due_date) {
        const wp = weeksPregnant(child.due_date);
        for (const m of PREGNANCY_MILESTONES) {
          // Tjek om vi er præcis på den uge (dagens ugedag = mandag i den uge)
          const daysUntilDue = Math.floor((new Date(child.due_date) - new Date()) / (24 * 60 * 60 * 1000));
          const exactWeek = 40 - Math.floor(daysUntilDue / 7);
          const dayIntoWeek = (40 * 7 - daysUntilDue) % 7;

          if (exactWeek === m.weeks && dayIntoWeek === 0) {
            const title = `${m.emoji} ${m.headline}`;
            const message = `Du er nu ${m.weeks} uger gravid! Fang øjeblikket med en milepæls-sticker 📸`;
            const ok = await sendPush(email, title, message, apiKey);
            if (ok) sent++;
          }
        }
      }
    }

    console.log(`Milestone notifikationer sendt: ${sent}`);
    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('checkMilestoneNotifications error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});