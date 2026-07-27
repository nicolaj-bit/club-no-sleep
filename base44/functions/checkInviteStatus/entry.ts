import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find invites for this user's email (sorted by newest first)
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { invitee_email: user.email },
      '-created_date',
      50
    );

    // Pick the most recent pending or accepted invite
    const invite = invites?.find(i => i.status === 'pending' || i.status === 'accepted');

    if (!invite) {
      return Response.json({ is_invited: false });
    }

    return Response.json({
      is_invited: true,
      inviter_email: invite.inviter_email,
      invite_id: invite.id,
      status: invite.status,
      invitee_title: invite.invitee_title,
      permissions: {
        can_see_sleep_log: invite.can_see_sleep_log,
        can_see_wonder_weeks: invite.can_see_wonder_weeks,
        can_see_calendar: invite.can_see_calendar,
        can_see_knowledge: invite.can_see_knowledge,
        notify_wonder_weeks: invite.notify_wonder_weeks,
        notify_sleep: invite.notify_sleep,
        notify_calendar: invite.notify_calendar,
      },
    });
  } catch (error) {
    console.error('checkInviteStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}