import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { invite_id, permissions } = body;

    if (!invite_id) {
      return Response.json({ error: 'Missing invite_id' }, { status: 400 });
    }

    // Find the invite
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter({ id: invite_id });
    const invite = invites?.[0];
    if (!invite) {
      return Response.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Security: only the inviter can edit the invite
    if (invite.inviter_email !== user.email) {
      return Response.json({ error: 'Only the inviter can edit this invitation' }, { status: 403 });
    }

    // Build update payload from permissions
    const updateData = {};
    const allowedFields = [
      'can_see_sleep_log',
      'can_see_wonder_weeks',
      'can_see_calendar',
      'can_see_knowledge',
      'can_see_milestones',
      'notify_wonder_weeks',
      'notify_sleep',
      'notify_calendar',
    ];

    for (const field of allowedFields) {
      if (permissions[field] !== undefined) {
        updateData[field] = permissions[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.FamilyInvite.update(invite_id, updateData);

    console.log(`Invite ${invite_id} updated by ${user.email}`);
    return Response.json({ ok: true, invite: updated });
  } catch (error) {
    console.error('updateFamilyInvite error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}