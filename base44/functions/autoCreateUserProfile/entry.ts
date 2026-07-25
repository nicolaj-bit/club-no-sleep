import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const userData = body?.data || {};
    const email = userData.email;

    if (!email) {
      return Response.json({ skipped: true, reason: 'no email in payload' });
    }

    // Idempotency: skip if a UserProfile already exists for this email
    const existing = await base44.asServiceRole.entities.UserProfile.filter({ user_email: email });
    if (existing && existing.length > 0) {
      return Response.json({ skipped: true, reason: 'profile already exists' });
    }

    const username = (email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9_]/g, '');

    await base44.asServiceRole.entities.UserProfile.create({
      username: username || email,
      display_name: userData.full_name || username || '',
      user_email: email,
      profile_label: 'mor',
      gender: 'female',
      onboarding_completed: false,
      subscription_status: 'trial',
      trial_started_at: new Date().toISOString(),
      is_visible: false,
      location_enabled: false,
    });

    return Response.json({ created: true, email });
  } catch (error) {
    console.error('[autoCreateUserProfile] error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
});