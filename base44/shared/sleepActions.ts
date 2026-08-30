// Shared sleep session logic — used by manageSleepSession and nativeSleepAction.
// Extracted so nativeSleepAction can reuse the exact same action logic without
// duplicating code.

// Close the current open period (the one without 'end').
export function closeCurrentPeriod(periods, now) {
  if (!periods || periods.length === 0) return periods;
  const last = periods[periods.length - 1];
  if (!last.end) {
    return [...periods.slice(0, -1), { ...last, end: now }];
  }
  return periods;
}

// Find the single active session for the owner.
export async function findActiveSession(base44, ownerEmail) {
  const recent = await base44.asServiceRole.entities.SleepLog.filter(
    { user_email: ownerEmail },
    '-created_date',
    10
  );
  return (recent || []).find(
    l => l.session_status === 'active_sleep' || l.session_status === 'active_awake'
  ) || null;
}

// Find a session by id, verifying ownership.
export async function findSessionById(base44, id, ownerEmail) {
  const sessions = await base44.asServiceRole.entities.SleepLog.filter({ id, user_email: ownerEmail });
  return sessions?.[0] || null;
}

// Resolve the owner email — for invited users, returns the inviter's email.
// Returns { ownerEmail } on success, or { error: { status, body } } on failure.
export async function resolveOwnerEmail(base44, profile) {
  let ownerEmail = profile.user_email;

  if (profile.is_invited) {
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { invitee_email: profile.user_email },
      '-created_date',
      10
    );
    const invite = invites?.find(
      i => i.status === 'accepted' && i.inviter_email && i.inviter_email !== profile.user_email
    );
    if (invite) {
      if (invite.can_see_sleep_log === false) {
        return { error: { status: 403, body: { error: 'Ingen adgang til søvnlog' } } };
      }
      ownerEmail = invite.inviter_email;
    }
  }

  return { ownerEmail };
}

// Execute mark_awake or end action. Returns { status, body }.
export async function executeSleepAction(base44, ownerEmail, action, sessionId) {
  const now = new Date().toISOString();

  const session = sessionId
    ? await findSessionById(base44, sessionId, ownerEmail)
    : await findActiveSession(base44, ownerEmail);

  if (!session) {
    return { status: 404, body: { error: 'Ingen aktiv session' } };
  }

  if (action === 'mark_awake') {
    const periods = closeCurrentPeriod(session.periods || [], now);
    periods.push({ type: 'awake', start: now, end: null });
    const updated = await base44.asServiceRole.entities.SleepLog.update(session.id, {
      periods,
      session_status: 'active_awake',
    });
    return { status: 200, body: { ok: true, session: updated } };
  }

  if (action === 'end') {
    const periods = closeCurrentPeriod(session.periods || [], now);
    const updated = await base44.asServiceRole.entities.SleepLog.update(session.id, {
      periods,
      session_status: 'completed',
      session_end: now,
    });
    return { status: 200, body: { ok: true, session: updated } };
  }

  return { status: 400, body: { error: 'Ugyldig handling' } };
}