import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Alle aldersbaserede milepæle med offset i dage fra fødselsdato
const AGE_MILESTONES = [
  { milestone_id: 'age-1w',  days: 7,    emoji: '🤍', headline: '1 uge gammel' },
  { milestone_id: 'age-2w',  days: 14,   emoji: '🤍', headline: '2 uger gammel' },
  { milestone_id: 'age-3w',  days: 21,   emoji: '🤍', headline: '3 uger gammel' },
  { milestone_id: 'age-1m',  days: 30,   emoji: '🌙', headline: '1 måned gammel' },
  { milestone_id: 'age-2m',  days: 61,   emoji: '🌙', headline: '2 måneder gammel' },
  { milestone_id: 'age-3m',  days: 91,   emoji: '🌙', headline: '3 måneder gammel' },
  { milestone_id: 'age-4m',  days: 122,  emoji: '🌙', headline: '4 måneder gammel' },
  { milestone_id: 'age-5m',  days: 152,  emoji: '🌙', headline: '5 måneder gammel' },
  { milestone_id: 'age-6m',  days: 183,  emoji: '🌙', headline: '6 måneder gammel — Halvt et år! 🌟' },
  { milestone_id: 'age-7m',  days: 213,  emoji: '🌙', headline: '7 måneder gammel' },
  { milestone_id: 'age-8m',  days: 244,  emoji: '🌙', headline: '8 måneder gammel' },
  { milestone_id: 'age-9m',  days: 274,  emoji: '🌙', headline: '9 måneder gammel' },
  { milestone_id: 'age-10m', days: 305,  emoji: '🌙', headline: '10 måneder gammel' },
  { milestone_id: 'age-11m', days: 335,  emoji: '🌙', headline: '11 måneder gammel' },
  { milestone_id: 'age-12m', days: 365,  emoji: '🌙', headline: '12 måneder gammel' },
  { milestone_id: 'age-13m', days: 396,  emoji: '🌙', headline: '13 måneder gammel' },
  { milestone_id: 'age-14m', days: 426,  emoji: '🌙', headline: '14 måneder gammel' },
  { milestone_id: 'age-15m', days: 457,  emoji: '🌙', headline: '15 måneder gammel' },
  { milestone_id: 'age-16m', days: 487,  emoji: '🌙', headline: '16 måneder gammel' },
  { milestone_id: 'age-17m', days: 518,  emoji: '🌙', headline: '17 måneder gammel' },
  { milestone_id: 'age-18m', days: 548,  emoji: '🌙', headline: '18 måneder gammel' },
  { milestone_id: 'age-19m', days: 579,  emoji: '🌙', headline: '19 måneder gammel' },
  { milestone_id: 'age-20m', days: 609,  emoji: '🌙', headline: '20 måneder gammel' },
  { milestone_id: 'age-21m', days: 640,  emoji: '🌙', headline: '21 måneder gammel' },
  { milestone_id: 'age-22m', days: 670,  emoji: '🌙', headline: '22 måneder gammel' },
  { milestone_id: 'age-23m', days: 701,  emoji: '🌙', headline: '23 måneder gammel' },
  { milestone_id: 'age-24m', days: 731,  emoji: '🌙', headline: '24 måneder gammel' },
  { milestone_id: 'age-1y',  days: 365,  emoji: '🎂', headline: '1 års fødselsdag — Tillykke! 🎉' },
  { milestone_id: 'age-2y',  days: 730,  emoji: '🎂', headline: '2 års fødselsdag — Tillykke! 🎉' },
  { milestone_id: 'age-3y',  days: 1095, emoji: '🎂', headline: '3 års fødselsdag — Tillykke! 🎉' },
];

// Alle graviditetsuger (4-42) baseret på terminsdato
// Hver uge får sit eget kalenderevent med titel, der matcher pregnancyWeeklyNotification
const PREGNANCY_WEEKS = [
  { milestone_id: 'preg-week-4',  weeks: 4,  emoji: '🌿', headline: 'Uge 4 – Det begynder!' },
  { milestone_id: 'preg-week-5',  weeks: 5,  emoji: '🌿', headline: 'Uge 5 – Hjertet slår' },
  { milestone_id: 'preg-week-6',  weeks: 6,  emoji: '🌿', headline: 'Uge 6 – Arme og ben spirer' },
  { milestone_id: 'preg-week-7',  weeks: 7,  emoji: '🌿', headline: 'Uge 7 – Hjernen vokser' },
  { milestone_id: 'preg-week-8',  weeks: 8,  emoji: '🌿', headline: 'Uge 8 – Alle organer anlagt' },
  { milestone_id: 'preg-week-9',  weeks: 9,  emoji: '🌿', headline: 'Uge 9 – Barnet bevæger sig' },
  { milestone_id: 'preg-week-10', weeks: 10, emoji: '🌿', headline: 'Uge 10 – Knoglerne hærder' },
  { milestone_id: 'preg-week-11', weeks: 11, emoji: '🌿', headline: 'Uge 11 – Næsten ud af første trimester' },
  { milestone_id: 'preg-week-12', weeks: 12, emoji: '🌿', headline: 'Uge 12 – Fingeraftryk dannes' },
  { milestone_id: 'preg-week-13', weeks: 13, emoji: '🌿', headline: 'Uge 13 – Andet trimester!' },
  { milestone_id: 'preg-week-14', weeks: 14, emoji: '🌿', headline: 'Uge 14 – Negle og tænder' },
  { milestone_id: 'preg-week-15', weeks: 15, emoji: '🌿', headline: 'Uge 15 – Du kan snart mærke bevægelser' },
  { milestone_id: 'preg-week-16', weeks: 16, emoji: '🌿', headline: 'Uge 16 – Barnet kan høre dig' },
  { milestone_id: 'preg-week-17', weeks: 17, emoji: '🌿', headline: 'Uge 17 – Fedt aflejres' },
  { milestone_id: 'preg-week-18', weeks: 18, emoji: '🌿', headline: 'Uge 18 – Bevægelser mærkes nu' },
  { milestone_id: 'preg-week-19', weeks: 19, emoji: '🌿', headline: 'Uge 19 – Midt i graviditeten' },
  { milestone_id: 'preg-week-20', weeks: 20, emoji: '🎉', headline: 'Uge 20 – HALVVEJS! 🎉' },
  { milestone_id: 'preg-week-21', weeks: 21, emoji: '🌿', headline: 'Uge 21 – Smagssansen aktiv' },
  { milestone_id: 'preg-week-22', weeks: 22, emoji: '🌿', headline: 'Uge 22 – Fingeraftryk er unikt' },
  { milestone_id: 'preg-week-23', weeks: 23, emoji: '🌿', headline: 'Uge 23 – Lungerne modnes' },
  { milestone_id: 'preg-week-24', weeks: 24, emoji: '🌿', headline: 'Uge 24 – En vigtig milepæl' },
  { milestone_id: 'preg-week-25', weeks: 25, emoji: '🌿', headline: 'Uge 25 – Barnet kan gribe' },
  { milestone_id: 'preg-week-26', weeks: 26, emoji: '🌿', headline: 'Uge 26 – Øjnene åbner sig' },
  { milestone_id: 'preg-week-27', weeks: 27, emoji: '🌿', headline: 'Uge 27 – Tredje trimester snart' },
  { milestone_id: 'preg-week-28', weeks: 28, emoji: '🌿', headline: 'Uge 28 – 1 kg!' },
  { milestone_id: 'preg-week-29', weeks: 29, emoji: '🌿', headline: 'Uge 29 – Hjernen vokser hurtigt' },
  { milestone_id: 'preg-week-30', weeks: 30, emoji: '🌿', headline: 'Uge 30 – Snart der!' },
  { milestone_id: 'preg-week-31', weeks: 31, emoji: '🌿', headline: 'Uge 31 – Alle sanser aktive' },
  { milestone_id: 'preg-week-32', weeks: 32, emoji: '🌿', headline: 'Uge 32 – Barnet vender sig' },
  { milestone_id: 'preg-week-33', weeks: 33, emoji: '🌿', headline: 'Uge 33 – Øver vejrtrækning' },
  { milestone_id: 'preg-week-34', weeks: 34, emoji: '🌿', headline: 'Uge 34 – Lungerne næsten modne' },
  { milestone_id: 'preg-week-35', weeks: 35, emoji: '🌿', headline: 'Uge 35 – Råmælk kan starte' },
  { milestone_id: 'preg-week-36', weeks: 36, emoji: '🌿', headline: 'Uge 36 – Snart fuldbåren' },
  { milestone_id: 'preg-week-37', weeks: 37, emoji: '🌟', headline: 'Uge 37 – FULDBÅREN! 🌟' },
  { milestone_id: 'preg-week-38', weeks: 38, emoji: '🌿', headline: 'Uge 38 – Klar til mødet' },
  { milestone_id: 'preg-week-39', weeks: 39, emoji: '🌿', headline: 'Uge 39 – Enhver dag nu' },
  { milestone_id: 'preg-week-40', weeks: 40, emoji: '👶', headline: 'Uge 40 – TERMINEN! 👶' },
  { milestone_id: 'preg-week-41', weeks: 41, emoji: '🧸', headline: 'Uge 41 – Lidt tålmodighed endnu' },
  { milestone_id: 'preg-week-42', weeks: 42, emoji: '🧸', headline: 'Uge 42 – Snart tid for igangsætning' },
];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// LMP = terminsdato - 280 dage; uge X starter på LMP + X*7 dage
function pregnancyWeekDate(dueDateStr, weeks) {
  const due = new Date(dueDateStr);
  const lmp = new Date(due.getTime() - 280 * 24 * 60 * 60 * 1000);
  lmp.setDate(lmp.getDate() + weeks * 7);
  return lmp.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Entity automation sender: { event: { entity_id, ... }, data: { ...childFields } }
    const childId = body.child_id || body.event?.entity_id || null;

    let children;
    if (childId) {
      // Fra entity automation: data er i body.data
      const childData = body.data;
      if (childData && (childData.birthdate || childData.due_date)) {
        children = [{ id: childId, ...childData }];
      } else {
        children = [];
      }
    } else {
      // Hent alle børn med paginering (service role)
      let allChildren = [];
      let skip = 0;
      const pageSize = 100;
      while (true) {
        const page = await base44.asServiceRole.entities.Child.list(null, pageSize, skip);
        if (!page || page.length === 0) break;
        allChildren = allChildren.concat(page);
        if (page.length < pageSize) break;
        skip += pageSize;
      }
      children = allChildren;
    }
    console.log(`Fandt ${children.length} børn`);

    let created = 0;
    let skipped = 0;

    for (const child of children) {
      if (!child.user_email) continue;

      const email = child.user_email;
      const cid = child.id;

      // Hent eksisterende milepæls-kalenderevents for dette barn
      const existing = await base44.asServiceRole.entities.CalendarEvent.filter({
        user_email: email,
        child_id: cid,
        category: 'milepæl',
      });

      const existingIds = new Set(existing.map(e => e.milestone_id).filter(Boolean));

      const toCreate = [];

      // ── Aldersbaserede milepæle (barn er født — har birthdate) ──
      if (child.birthdate) {
        for (const m of AGE_MILESTONES) {
          if (existingIds.has(m.milestone_id)) { skipped++; continue; }
          const eventDate = addDays(child.birthdate, m.days);
          toCreate.push({
            title: `${m.emoji} ${m.headline}`,
            description: `${child.name} fylder ${m.headline.toLowerCase()} — fang øjeblikket med en milepæls-sticker i appen! 📸`,
            start_datetime: `${eventDate}T09:00:00`,
            end_datetime: `${eventDate}T09:30:00`,
            user_email: email,
            category: 'milepæl',
            milestone_id: m.milestone_id,
            child_id: cid,
            notify_day_before: true,
            notify_30min_before: false,
          });
        }
      }

      // ── Graviditetsuger (har terminsdato) ──
      // Opretter et kalenderevent for HVER uge 4-42 baseret på terminsdatoen.
      // Gælder både: kun gravid (ingen birthdate), og gravid + allerede har et barn (due_date sat på ny graviditet)
      if (child.due_date) {
        for (const m of PREGNANCY_WEEKS) {
          if (existingIds.has(m.milestone_id)) { skipped++; continue; }
          const eventDate = pregnancyWeekDate(child.due_date, m.weeks);
          toCreate.push({
            title: `${m.emoji} ${m.headline}`,
            description: `Du er nu i uge ${m.weeks} af din graviditet! Åbn appen for at læse om din babys udvikling og få tips til ugen. 🌿`,
            start_datetime: `${eventDate}T09:00:00`,
            end_datetime: `${eventDate}T09:30:00`,
            user_email: email,
            category: 'milepæl',
            milestone_id: m.milestone_id,
            child_id: cid,
            notify_day_before: true,
            notify_30min_before: false,
          });
        }
      }

      // Opret én ad gangen med lille forsinkelse for at undgå rate limit
      for (const event of toCreate) {
        await base44.asServiceRole.entities.CalendarEvent.create(event);
        created++;
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      if (toCreate.length > 0) {
        console.log(`Oprettet ${toCreate.length} milepæle for ${email} (barn: ${child.name})`);
      }
    }

    return Response.json({ success: true, created, skipped, childrenFound: children.length, childNames: children.map(c => c.name) });
  } catch (error) {
    console.error('syncMilestoneCalendarEvents error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});