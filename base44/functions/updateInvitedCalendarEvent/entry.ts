import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Inviteret partner opdaterer en aftale på primærbrugerens kalender.
// Body: { event_id, eventData }
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    if (!profile || !profile.is_invited) {
      return Response.json({ error: 'Not an invited user' }, { status: 403 });
    }

    const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { invitee_email: user.email },
      '-created_date',
      10
    );
    const invite = invites?.find((i) => i.status === 'accepted');
    if (!invite) return Response.json({ error: 'No accepted invitation' }, { status: 403 });
    if (invite.can_see_calendar === false) {
      return Response.json({ error: 'No permission to manage calendar' }, { status: 403 });
    }

    const inviterEmail = invite.inviter_email;
    const body = await req.json();
    const { event_id, eventData } = body;
    if (!event_id) return Response.json({ error: 'Missing event_id' }, { status: 400 });

    const events = await base44.asServiceRole.entities.CalendarEvent.filter({
      id: event_id,
      user_email: inviterEmail,
    });
    if (!events || events.length === 0) {
      return Response.json({ error: 'Event not found or does not belong to inviter' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.CalendarEvent.update(event_id, eventData);
    return Response.json({ ok: true, event: updated });
  } catch (error) {
    console.error('updateInvitedCalendarEvent error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}