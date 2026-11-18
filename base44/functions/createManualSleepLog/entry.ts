import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildManualPeriods } from '../../shared/manualSleepPeriods.js';
import { getUserLanguage } from '../../shared/i18n.js';

// ============================================================================
// Manuel søvnlog — registrerer en søvn bagud med samme periods-struktur som
// en live-session (completed, alle perioder lukkede).
// Al læsning/skrivning sker med asServiceRole (RLS omgås for email/password-brugere).
// Input: { child_id?, sleep_type, session_start, session_end, wakings?, parent_note?,
//          local_date, existing_id? }
// ============================================================================

// Sproget saettes, saa snart brugeren er kendt. Fejlbeskeder vises direkte i
// appen, saa de skal foelge brugerens sprogvalg ligesom alt andet.
let LANG = 'da';
const T = (da, en) => (LANG === 'en' ? en : da);
const fail = (error, status) => Response.json({ error }, { status });
const failT = (da, en, status) => fail(T(da, en), status);
const HAS_TZ = /(Z|[+-]\d{2}:?\d{2})$/i;
const MONTHS_DA = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseDate(v) {
  if (typeof v !== 'string' || !HAS_TZ.test(v.trim())) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function formatDanishDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || '');
  if (!m) return 'en anden dato';
  const day = parseInt(m[3], 10);
  const monthIdx = parseInt(m[2], 10) - 1;
  return T(`${day}. ${MONTHS_DA[monthIdx]} ${m[1]}`, `${day} ${MONTHS_EN[monthIdx]} ${m[1]}`);
}

function ageMonthsAt(birthdate, at) {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (isNaN(birth.getTime())) return null;
  return Math.max(0, Math.floor((at.getTime() - birth.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return fail('Unauthorized', 401);
    LANG = await getUserLanguage(base44, user.email);

    const body = await req.json().catch(() => ({}));
    const { child_id, sleep_type, wakings, parent_note, local_date, existing_id } = body;

    // --- Ejer / inviteret familiemedlem (samme logik som manageSleepSession) ---
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    let ownerEmail = user.email;

    if (profile?.is_invited) {
      const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
        { invitee_email: user.email },
        '-created_date',
        10
      );
      const invite = invites?.find(i => i.status === 'accepted' && i.inviter_email && i.inviter_email !== user.email);
      if (invite) {
        if (invite.can_see_sleep_log === false) {
          return failT('Ingen adgang til søvnlog', 'No access to the sleep log', 403);
        }
        ownerEmail = invite.inviter_email;
      }
    }

    // --- Barn tilhører ejeren ---
    let child = null;
    if (child_id) {
      const children = await base44.asServiceRole.entities.Child.filter({ id: child_id, user_email: ownerEmail });
      if (!children || children.length === 0) return failT('Barnet tilhører ikke brugeren', 'The child does not belong to this user', 403);
      child = children[0];
    }

    // --- Validering ---
    const start = parseDate(body.session_start);
    const end = parseDate(body.session_end);
    if (!start || !end) {
      return failT('Start- og sluttidspunkt mangler eller er ugyldige. Tjek tidspunkterne og prøv igen.', 'The start and end times are missing or invalid. Check the times and try again.', 400);
    }
    if (end.getTime() <= start.getTime()) {
      return failT('Sluttidspunktet skal ligge efter starttidspunktet.', 'The end time must be after the start time.', 400);
    }
    if (end.getTime() > Date.now() + 5 * 60 * 1000) {
      return failT('Sluttidspunktet ligger i fremtiden. Registrér søvnen, når den er slut.', 'The end time is in the future. Record the sleep once it is over.', 400);
    }
    if (start.getTime() > Date.now() + 5 * 60 * 1000) {
      return failT('Starttidspunktet ligger i fremtiden. Du kan kun registrere søvn, der allerede er begyndt.', 'The start time is in the future. You can only record sleep that has already begun.', 400);
    }
    if (end.getTime() - start.getTime() > 24 * 60 * 60 * 1000) {
      return failT('En søvn kan højst vare 24 timer.', 'A sleep can last at most 24 hours.', 400);
    }
    if (typeof local_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(local_date)) {
      return failT('Datoen mangler eller er ugyldig.', 'The date is missing or invalid.', 400);
    }
    if (sleep_type !== 'night' && sleep_type !== 'nap') {
      return failT('Vælg om det er nattesøvn eller en lur.', 'Choose whether this is night sleep or a nap.', 400);
    }

    const parsedWakings = [];
    for (const w of Array.isArray(wakings) ? wakings : []) {
      const ws = parseDate(w?.start);
      const we = parseDate(w?.end);
      if (!ws || !we) return failT('En opvågning har et ugyldigt tidspunkt.', 'One of the wake-ups has an invalid time.', 400);
      if (we.getTime() <= ws.getTime()) return failT('En opvågning skal slutte efter den begynder.', 'A wake-up must end after it begins.', 400);
      if (ws.getTime() < start.getTime() || we.getTime() > end.getTime()) {
        return failT('En opvågning ligger uden for søvnens tidsrum.', 'A wake-up falls outside the sleep period.', 400);
      }
      parsedWakings.push({ s: ws.getTime(), e: we.getTime(), start: ws.toISOString(), end: we.toISOString() });
    }
    parsedWakings.sort((a, b) => a.s - b.s);
    for (let i = 1; i < parsedWakings.length; i++) {
      if (parsedWakings[i].s < parsedWakings[i - 1].e) {
        return failT('To opvågninger overlapper hinanden.', 'Two wake-ups overlap.', 400);
      }
    }

    // --- Ret en eksisterende manuel post? ---
    let existing = null;
    if (existing_id) {
      const found = await base44.asServiceRole.entities.SleepLog.filter({ id: existing_id, user_email: ownerEmail });
      existing = found?.[0] || null;
      if (!existing) return failT('Posten blev ikke fundet.', 'The entry was not found.', 404);
      if (existing.entry_mode !== 'manual') {
        return failT('Kun manuelt tilføjede poster kan rettes.', 'Only manually added entries can be edited.', 403);
      }
    }

    // --- Overlap med eksisterende sessioner for samme ejer og samme barn ---
    const others = await base44.asServiceRole.entities.SleepLog.filter(
      { user_email: ownerEmail },
      '-created_date',
      1000
    );
    const sameChild = (c) => !c || !child_id || c === child_id;
    for (const o of others || []) {
      if (existing && o.id === existing.id) continue;
      if (!o.session_start || !sameChild(o.child_id)) continue;
      const os = new Date(o.session_start).getTime();
      const oe = o.session_end ? new Date(o.session_end).getTime() : Date.now();
      if (isNaN(os) || isNaN(oe)) continue;
      if (start.getTime() < oe && end.getTime() > os) {
        const when = formatDanishDate(o.date || String(o.session_start).slice(0, 10));
        return failT(`Søvnen overlapper en søvn, der allerede er registreret den ${when}.  Ret tidspunkterne eller åbn den eksisterende post.`.replace('.  ', '. '), `This sleep overlaps a sleep already recorded on ${when}. Change the times or open the existing entry.`, 409);
      }
    }

    // --- Byg posten ---
    const startIso = start.toISOString();
    const endIso = end.toISOString();
    const periods = buildManualPeriods(startIso, endIso, parsedWakings);

    let childAgeMonths = ageMonthsAt(child?.birthdate, start);
    if (childAgeMonths === null) {
      const ownerProfiles = ownerEmail === user.email
        ? profiles
        : await base44.asServiceRole.entities.UserProfile.filter({ user_email: ownerEmail });
      childAgeMonths = ageMonthsAt(ownerProfiles?.[0]?.child_birthdate, start);
    }

    const fields = {
      child_id: child_id || null,
      date: local_date,
      child_age_months: childAgeMonths,
      session_status: 'completed',
      sleep_type,
      session_start: startIso,
      session_end: endIso,
      periods,
      parent_note: typeof parent_note === 'string' ? parent_note.trim().slice(0, 2000) : '',
      entry_mode: 'manual',
    };

    let session;
    if (existing) {
      session = await base44.asServiceRole.entities.SleepLog.update(existing.id, fields);
    } else {
      session = await base44.asServiceRole.entities.SleepLog.create({
        ...fields,
        user_email: ownerEmail,
        profile_id: profile?.family_id || null,
        created_by_email: user.email,
      });
    }

    return Response.json({ ok: true, session });
  } catch (error) {
    console.error('createManualSleepLog error:', error?.message || error);
    return fail(error?.message || 'Unknown error', 500);
  }
});