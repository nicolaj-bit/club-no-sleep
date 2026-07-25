import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      invitee_email,
      invitee_title,
      inviter_email,
      inviter_name,
      invite_id,
      can_see_sleep_log,
      can_see_wonder_weeks,
      can_see_calendar,
      can_see_knowledge,
      notify_wonder_weeks,
      notify_sleep,
      notify_calendar,
      description,
    } = await req.json();

    if (!invitee_email || !invitee_title || !inviter_email) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Sikkerhed: inviter_email skal matche den indloggede bruger
    if (inviter_email !== user.email) {
      return Response.json({ error: 'inviter_email does not match authenticated user' }, { status: 403 });
    }

    // Opret FamilyInvite-record med service role (RLS blokerer frontend create)
    const invite = await base44.asServiceRole.entities.FamilyInvite.create({
      inviter_email,
      invitee_email,
      invitee_title,
      can_see_sleep_log: can_see_sleep_log ?? true,
      can_see_wonder_weeks: can_see_wonder_weeks ?? true,
      can_see_calendar: can_see_calendar ?? true,
      can_see_knowledge: can_see_knowledge ?? false,
      notify_wonder_weeks: notify_wonder_weeks ?? true,
      notify_sleep: notify_sleep ?? false,
      notify_calendar: notify_calendar ?? true,
      status: 'pending',
      description: description || undefined,
    });

    const inviteUrl = `https://clubnosleep.com/AcceptInvite?invite=${invite.id}`;

    console.log(`Family invite created from ${user.email} to ${invitee_email} (${invitee_title})`);
    return Response.json({ ok: true, invite, inviteUrl });
  } catch (error) {
    console.error('sendFamilyInvite error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});