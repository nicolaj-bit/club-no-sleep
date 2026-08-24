import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ============================================================================
// Live søvnsession — håndterer alle tilstande:
//   start:          opretter en ny active_sleep session (kun én aktiv ad gangen)
//   mark_awake:     active_sleep → active_awake (lukker søvnperiode, åbner vågenperiode)
//   mark_sleeping:  active_awake → active_sleep (lukker vågenperiode, åbner søvnperiode)
//   end:            → completed (lukker nuværende periode, sætter session_end)
//   undo_end:       completed → active_sleep (genåbner session, starter ny søvnperiode)
//
// Virker for både hovedbrugere og inviterede familiemedlemmer.
// Al data skrives med asServiceRole så RLS omgås for email/password-brugere.
// Tidsstempler gemmes i databasen — frontend beregner timeren som (nu − start).
// ============================================================================

async function getChildAgeMonths(base44, ownerEmail, childId) {
  try {
    if (childId) {
      const children = await base44.asServiceRole.entities.Child.filter({ id: childId });
      const child = children?.[0];
      if (child?.birthdate) {
        const birth = new Date(child.birthdate);
        const now = new Date();
        return Math.max(0, Math.floor((now - birth) / (30.44 * 24 * 60 * 60 * 1000)));
      }
    }
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: ownerEmail });
    const p = profiles?.[0];
    if (p?.child_birthdate) {
      const birth = new Date(p.child_birthdate);
      const now = new Date();
      return Math.max(0, Math.floor((now - birth) / (30.44 * 24 * 60 * 60 * 1000)));
    }
  } catch {}
  return null;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, session_id, child_id } = body;

    // Find brugerens profil for at afgøre om de er inviteret
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
          return Response.json({ error: 'Ingen adgang til søvnlog' }, { status: 403 });
        }
        ownerEmail = invite.inviter_email;
      }
    }

    // Verificér at barnet tilhører ejeren
    if (child_id) {
      const children = await base44.asServiceRole.entities.Child.filter({ id: child_id, user_email: ownerEmail });
      if (!children || children.length === 0) {
        return Response.json({ error: 'Barnet tilhører ikke brugeren' }, { status: 403 });
      }
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // Hjælpefunktion: find den enkelte aktive session for ejeren
    async function findActiveSession() {
      const recent = await base44.asServiceRole.entities.SleepLog.filter(
        { user_email: ownerEmail },
        '-created_date',
        10
      );
      return (recent || []).find(
        l => l.session_status === 'active_sleep' || l.session_status === 'active_awake'
      ) || null;
    }

    // Hjælpefunktion: hent en session efter id (verificer ejerskab)
    async function findSessionById(id) {
      const sessions = await base44.asServiceRole.entities.SleepLog.filter({ id, user_email: ownerEmail });
      return sessions?.[0] || null;
    }

    // Hjælpefunktion: luk den nuværende åbne periode
    function closeCurrentPeriod(periods) {
      if (!periods || periods.length === 0) return periods;
      const last = periods[periods.length - 1];
      if (!last.end) {
        return [...periods.slice(0, -1), { ...last, end: now }];
      }
      return periods;
    }

    // === START ===
    if (action === 'start') {
      const existing = await findActiveSession();
      if (existing) {
        return Response.json({ error: 'En aktiv session findes allerede', session: existing }, { status: 409 });
      }

      const childAgeMonths = await getChildAgeMonths(base44, ownerEmail, child_id);

      const session = await base44.asServiceRole.entities.SleepLog.create({
        user_email: ownerEmail,
        child_id: child_id || null,
        profile_id: profile?.family_id || null,
        created_by_email: user.email,
        date: today,
        session_status: 'active_sleep',
        session_start: now,
        session_end: null,
        periods: [{ type: 'sleep', start: now, end: null }],
        child_age_months: childAgeMonths,
      });
      return Response.json({ ok: true, session });
    }

    // === MARK_AWAKE / MARK_SLEEPING ===
    if (action === 'mark_awake' || action === 'mark_sleeping') {
      const session = session_id ? await findSessionById(session_id) : await findActiveSession();
      if (!session) return Response.json({ error: 'Ingen aktiv session' }, { status: 404 });

      const newType = action === 'mark_awake' ? 'awake' : 'sleep';
      const newStatus = action === 'mark_awake' ? 'active_awake' : 'active_sleep';
      const periods = closeCurrentPeriod(session.periods || []);
      periods.push({ type: newType, start: now, end: null });

      const updated = await base44.asServiceRole.entities.SleepLog.update(session.id, {
        periods,
        session_status: newStatus,
      });
      return Response.json({ ok: true, session: updated });
    }

    // === END ===
    if (action === 'end') {
      const session = session_id ? await findSessionById(session_id) : await findActiveSession();
      if (!session) return Response.json({ error: 'Ingen aktiv session' }, { status: 404 });

      const periods = closeCurrentPeriod(session.periods || []);
      const updated = await base44.asServiceRole.entities.SleepLog.update(session.id, {
        periods,
        session_status: 'completed',
        session_end: now,
      });
      return Response.json({ ok: true, session: updated });
    }

    // === UNDO_END ===
    if (action === 'undo_end') {
      const session = session_id ? await findSessionById(session_id) : null;
      if (!session) return Response.json({ error: 'Session ikke fundet' }, { status: 404 });

      const periods = (session.periods || []).slice();
      periods.push({ type: 'sleep', start: now, end: null });

      const updated = await base44.asServiceRole.entities.SleepLog.update(session.id, {
        periods,
        session_status: 'active_sleep',
        session_end: null,
      });
      return Response.json({ ok: true, session: updated });
    }

    return Response.json({ error: 'Ukendt handling' }, { status: 400 });
  } catch (error) {
    console.error('manageSleepSession error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}