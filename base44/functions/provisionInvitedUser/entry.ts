import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find pending or accepted invite for this user
    const invites = await base44.asServiceRole.entities.FamilyInvite.filter(
      { invitee_email: user.email },
      '-created_date',
      50
    );
    const invite = invites?.find(i => i.status === 'pending' || i.status === 'accepted');
    if (!invite) {
      return Response.json({ error: 'No pending invitation found' }, { status: 404 });
    }

    // Get inviter's profile to find family_id
    const inviterProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: invite.inviter_email,
    });
    const inviterProfile = inviterProfiles?.[0];

    // family_id = inviter's own profile id (fallback)
    const familyId = inviterProfile?.family_id || inviterProfile?.id || '';

    // Make sure inviter is marked as primary
    if (inviterProfile && (!inviterProfile.family_id || !inviterProfile.family_role)) {
      await base44.asServiceRole.entities.UserProfile.update(inviterProfile.id, {
        family_id: familyId,
        family_role: 'primary',
      });
    }

    // Find or create invitee's profile
    const inviteeProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: user.email,
    });

    const username = (user.email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (inviteeProfiles?.[0]) {
      // Update existing profile
      await base44.asServiceRole.entities.UserProfile.update(inviteeProfiles[0].id, {
        onboarding_completed: true,
        is_invited: true,
        inviter_email: invite.inviter_email,
        family_id: familyId,
        family_role: 'partner',
        subscription_status: 'active',
        is_visible: false,
        location_enabled: false,
      });
    } else {
      // Create new profile — fully provisioned
      await base44.asServiceRole.entities.UserProfile.create({
        username: username || user.email,
        display_name: username || '',
        user_email: user.email,
        profile_label: 'mor',
        gender: 'female',
        onboarding_completed: true,
        is_invited: true,
        inviter_email: invite.inviter_email,
        family_id: familyId,
        family_role: 'partner',
        subscription_status: 'active',
        is_visible: false,
        location_enabled: false,
      });
    }

    // Mark invite as accepted
    if (invite.status === 'pending') {
      await base44.asServiceRole.entities.FamilyInvite.update(invite.id, { status: 'accepted' });
    }

    console.log(`Invited user provisioned: ${user.email} linked to family ${familyId} (inviter: ${invite.inviter_email})`);
    return Response.json({ ok: true, family_id: familyId });
  } catch (error) {
    console.error('provisionInvitedUser error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}