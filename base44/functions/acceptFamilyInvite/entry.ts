import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called when an invited partner accepts an invitation.
// 1. Loads the FamilyInvite record
// 2. Finds the inviter's UserProfile to get their family_id (or uses their profile ID)
// 3. Sets family_id + family_role='partner' + subscription_status='active' on the invitee's UserProfile
// 4. Marks the FamilyInvite as 'accepted'

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invite_id } = await req.json();
    if (!invite_id) {
      return Response.json({ error: 'Missing invite_id' }, { status: 400 });
    }

    // Load invite — RLS allows invitee to read/update
    const invites = await base44.entities.FamilyInvite.filter({ id: invite_id });
    const invite = invites[0];
    if (!invite) {
      return Response.json({ error: 'Invitation ikke fundet' }, { status: 404 });
    }
    if (invite.invitee_email.toLowerCase() !== user.email.toLowerCase()) {
      return Response.json({ error: 'Denne invitation tilhører ikke dig' }, { status: 403 });
    }
    if (invite.status === 'accepted') {
      return Response.json({ ok: true, already_accepted: true });
    }

    // Get inviter's profile to find/create family_id
    const inviterProfiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: invite.inviter_email });
    const inviterProfile = inviterProfiles[0];
    if (!inviterProfile) {
      return Response.json({ error: 'Inviterens profil ikke fundet' }, { status: 404 });
    }

    // family_id = inviter's own profile id (if they haven't set one yet, use their profile id)
    const familyId = inviterProfile.family_id || inviterProfile.id;

    // Make sure inviter is marked as primary
    if (!inviterProfile.family_id || !inviterProfile.family_role) {
      await base44.asServiceRole.entities.UserProfile.update(inviterProfile.id, {
        family_id: familyId,
        family_role: 'primary',
      });
    }

    // Find or wait for invitee's profile
    const inviteeProfiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    const inviteeProfile = inviteeProfiles[0];

    if (inviteeProfile) {
      await base44.entities.UserProfile.update(inviteeProfile.id, {
        family_id: familyId,
        family_role: 'partner',
        subscription_status: 'active',
      });
    }

    // Mark invite as accepted
    await base44.entities.FamilyInvite.update(invite.id, { status: 'accepted' });

    console.log(`Family invite accepted: ${user.email} linked to family ${familyId} (inviter: ${invite.inviter_email})`);
    return Response.json({ ok: true, family_id: familyId });

  } catch (error) {
    console.error('acceptFamilyInvite error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});