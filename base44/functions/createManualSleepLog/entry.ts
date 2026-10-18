import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildManualPeriods } from '../../shared/manualSleepPeriods.js';

// ============================================================================
// Manuel søvnlog — registrerer en søvn bagud med samme periods-struktur som
// en live-session (completed, alle perioder lukkede).
// Al læsning/skrivning sker med asServiceRole (RLS omgås for email/password-brugere).
// Input: { child_id?, sleep_type, session_start, session_end, wakings?, parent_note?,
//          local_date, existing_id? }
// ============================================================================

const fail = (error, status) => Response.json({ error }, { status });
const HAS_TZ = /(Z|[+-]\d{2}:?\d{2})$/i;
const MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

function parseDate(v) {
  if (typeof v !== 'string' || !HAS_TZ.test(v.trim())) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function formatDanishDate(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd || '');
  if (!m) return 'en anden dato';
  return `${parseInt(m[3], 10)}. ${MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
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
          return fail('Ingen adgang til søvnlog', 403);
        }
        ownerEmail = invite.inviter_email;
      }
    }

    // --- Barn tilhører ejeren ---
    let child = null;
    if (child_id) {
      const children = await base44.asServiceRole.entities.Child.filter({ id: child_id, user_email: ownerEmail });
      if (!children || children.length === 0) return fail('Barnet tilhører ikke brugeren', 403);
      child = children[0];
    }

    // --- Validering ---
    const start = parseDate(body.session_start);
    const end = parseDate(body.session_end);
    if (!start || !end) {
      return fail('Start- og sluttidspunkt mangler eller er ugyldige. Tjek tidspunkterne og prøv igen.', 400);
    }
    if (end.getTime() <= start.getTime()) {
      return fail('Sluttidspunktet skal ligge efter starttidspunktet.', 400);
    }
    if (end.getTime() > Date.now() + 5 * 60 * 1000) {
      return fail('Sluttidspunktet ligger i fremtiden. Registrér søvnen, når den er slut.', 400);
    }
    if (start.getTime() > Date.now() + 5 * 60 * 1000) {
      return fail('Starttidspunktet ligger i fremtiden. Du kan kun registrere søvn, der allerede er begyndt.', 400);
    }
    if (end.getTime() - start.getTime() > 24 * 60 * 60 * 1000) {
      return fail('En søvn kan højst vare 24 timer.', 400);
    }
    if (typeof local_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(local_date)) {
      return fail('Datoen mangler eller er ugyldig.', 400);
    }
    if (sleep_type !== 'night' && sleep_type !== 'nap') {
      return fail('Vælg om det er nattesøvn eller en lur.', 400);
    }

    const parsedWakings = [];
    for (const w of Array.isArray(wakings) ? wakings : []) {
      const ws = parseDate(w?.start);
      const we = parseDate(w?.end);
      if (!ws || !we) return fail('En opvågning har et ugyldigt tidspunkt.', 400);
      if (we.getTime() <= ws.getTime()) return fail('En opvågning skal slutte efter den begynder.', 400);
      if (ws.getTime() < start.getTime() || we.getTime() > end.getTime()) {
        return fail('En opvågning ligger uden for søvnens tidsrum.', 400);
      }
      parsedWakings.push({ s: ws.getTime(), e: we.getTime(), start: ws.toISOString(), end: we.toISOString() });
    }
    parsedWakings.sort((a, b) => a.s - b.s);
    for (let i = 1; i < parsedWakings.length; i++) {
      if (parsedWakings[i].s < parsedWakings[i - 1].e) {
        return fail('To opvågninger overlapper hinanden.', 400);
      }
    }

    // --- Ret en eksisterende manuel post? ---
    let existing = null;
    if (existing_id) {
      const found = await base44.asServiceRole.entities.SleepLog.filter({ id: existing_id, user_email: ownerEmail });
      existing = found?.[0] || null;
      if (!existing) return fail('Posten blev ikke fundet.', 404);
      if (existing.entry_mode !== 'manual') {
        return fail('Kun manuelt tilføjede poster kan rettes.', 403);
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
        return fail(`Søvnen overlapper en søvn, der allerede er registreret den ${when}. Ret tidspunkterne eller åbn den eksisterende post.`, 409);
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