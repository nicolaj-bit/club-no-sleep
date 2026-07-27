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
    if (invite.can_see_calendar === false) {
      return Response.json({ error: 'No permission to manage calendar' }, { status: 403 });
    }

    const inviterEmail = invite.inviter_email;
    const body = await req.json();
    const { event_id } = body;

    if (!event_id) {
      return Response.json({ error: 'Missing event_id' }, { status: 400 });
    }

    // Verify the event belongs to the inviter
    const events = await base44.asServiceRole.entities.CalendarEvent.filter({
      id: event_id,
      user_email: inviterEmail
    });
    if (!events || events.length === 0) {
      return Response.json({ error: 'Event not found or does not belong to inviter' }, { status: 403 });
    }

    await base44.asServiceRole.entities.CalendarEvent.delete(event_id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('deleteInvitedCalendarEvent error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}