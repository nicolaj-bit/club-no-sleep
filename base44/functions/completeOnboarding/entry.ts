import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      plan = 'demo',
      username,
      display_name,
      profile_label,
      city,
      profile_image,
      child_birthdate,
      child_due_date,
      childMode,
      child_name,
      marketing_consent,
    } = body;

    if (!username || !profile_label) {
      return Response.json({ error: 'Missing required fields: username, profile_label' }, { status: 400 });
    }

    const isActive = plan === 'paid' || plan === 'appstore' || plan === 'googleplay';
    const now = new Date().toISOString();
    const gender = profile_label === 'mor' ? 'female' : 'male';

    const profileFields = {
      username,
      display_name: display_name?.trim() || username,
      profile_label,
      gender,
      city: city || undefined,
      auto_light_enabled: city ? true : undefined,
      profile_image: profile_image || undefined,
      child_birthdate: child_birthdate || undefined,
      child_due_date: child_due_date || undefined,
      user_email: user.email,
      onboarding_completed: true,
      subscription_status: isActive ? 'active' : 'trial',
      subscription_started_at: isActive ? now : undefined,
      trial_started_at: isActive ? undefined : now,
      marketing_consent: marketing_consent === true,
      marketing_consent_at: marketing_consent === true ? now : undefined,
      marketing_consent_prompted: true,
    };

    // Find og opdater eksisterende profil via service role (bypasser RLS)
    const existing = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    let profile;
    if (existing && existing.length > 0) {
      profile = await base44.asServiceRole.entities.UserProfile.update(existing[0].id, profileFields);
    } else {
      profile = await base44.asServiceRole.entities.UserProfile.create(profileFields);
    }

    // Opret Child hvis barnedata er angivet
    if (childMode === 'gravid' && child_due_date) {
      await base44.asServiceRole.entities.Child.create({
        user_email: user.email,
        name: 'Mit barn',
        due_date: child_due_date,
      });
    } else if (childMode === 'fodt' && (child_birthdate || child_due_date)) {
      await base44.asServiceRole.entities.Child.create({
        user_email: user.email,
        name: child_name?.trim() || 'Mit barn',
        birthdate: child_birthdate || undefined,
        due_date: child_due_date || undefined,
      });
    }

    // Opret GDPR consent-log
    await base44.asServiceRole.entities.ConsentLog.create({
      user_email: user.email,
      terms_version: '1.0',
      privacy_version: '1.0',
      accepted_at: now,
    });

    console.log(`Onboarding completed for ${user.email}`);
    return Response.json({ ok: true, profile });
  } catch (error) {
    console.error('completeOnboarding error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});