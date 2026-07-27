import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find the user's profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    if (!profile || !profile.is_invited) {
      return Response.json({ is_invited: false });
    }

    // Find ACCEPTED FamilyInvite only — pending invites don't grant access
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { invitee_email: user.email },
      '-created_date',
      10
    );
    const invite = invites?.find(i => i.status === 'accepted');
    if (!invite) {
      return Response.json({ is_invited: false });
    }

    const inviterEmail = invite.inviter_email;
    const permissions = {
      can_see_sleep_log: invite.can_see_sleep_log !== false,
      can_see_wonder_weeks: invite.can_see_wonder_weeks !== false,
      can_see_calendar: invite.can_see_calendar !== false,
      can_see_knowledge: invite.can_see_knowledge === true,
      can_see_milestones: invite.can_see_milestones !== false,
      notify_wonder_weeks: invite.notify_wonder_weeks !== false,
      notify_sleep: invite.notify_sleep === true,
      notify_calendar: invite.notify_calendar !== false,
    };

    // Fetch inviter's profile
    const inviterProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: inviterEmail });
    const inviterProfile = inviterProfiles?.[0] || null;

    // Fetch inviter's children
    const inviterChildren = await base44.asServiceRole.entities.Child.filter({ user_email: inviterEmail }, 'order', 20);

    let inviterSleepLogs = [];
    let inviterCalendarEvents = [];

    if (permissions.can_see_sleep_log) {
      inviterSleepLogs = await base44.asServiceRole.entities.SleepLog.filter({ user_email: inviterEmail }, '-date', 60);
    }

    if (permissions.can_see_calendar) {
      // Sort descending (newest first) so upcoming events are included even with many past events
      inviterCalendarEvents = await base44.asServiceRole.entities.CalendarEvent.filter({ user_email: inviterEmail }, '-start_datetime', 100);
    }

    return Response.json({
      is_invited: true,
      inviter_email: inviterEmail,
      permissions,
      inviter_profile: inviterProfile,
      inviter_children: inviterChildren,
      inviter_sleep_logs: inviterSleepLogs,
      inviter_calendar_events: inviterCalendarEvents,
    });
  } catch (error) {
    console.error('getSharedFamilyData error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}