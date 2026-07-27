import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find user's profile — must be invited
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    if (!profile || !profile.is_invited) {
      return Response.json({ error: 'Not an invited user' }, { status: 403 });
    }

    // Find accepted FamilyInvite
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { invitee_email: user.email },
      '-created_date',
      10
    );
    const invite = invites?.find(i => i.status === 'accepted');
    if (!invite) {
      return Response.json({ error: 'No accepted invitation' }, { status: 403 });
    }

    // Check permission
    if (invite.can_see_sleep_log === false) {
      return Response.json({ error: 'No permission to log sleep' }, { status: 403 });
    }

    const inviterEmail = invite.inviter_email;
    const body = await req.json();
    const { sleepLogData, existing_id } = body;

    // Verify child_id belongs to inviter
    if (sleepLogData.child_id) {
      const children = await base44.asServiceRole.entities.Child.filter({
        id: sleepLogData.child_id,
        user_email: inviterEmail
      });
      if (!children || children.length === 0) {
        return Response.json({ error: 'Child does not belong to inviter' }, { status: 403 });
      }
    }

    const payload = {
      ...sleepLogData,
      user_email: inviterEmail,
      profile_id: profile.family_id || null,
      created_by_email: user.email,
    };

    if (existing_id) {
      // Verify existing log belongs to inviter before updating
      const existingLogs = await base44.asServiceRole.entities.SleepLog.filter({
        id: existing_id,
        user_email: inviterEmail
      });
      if (!existingLogs || existingLogs.length === 0) {
        return Response.json({ error: 'Sleep log not found or does not belong to inviter' }, { status: 403 });
      }
      const updated = await base44.asServiceRole.entities.SleepLog.update(existing_id, payload);
      return Response.json({ ok: true, sleepLog: updated });
    }

    const created = await base44.asServiceRole.entities.SleepLog.create(payload);
    return Response.json({ ok: true, sleepLog: created });
  } catch (error) {
    console.error('createInvitedSleepLog error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}