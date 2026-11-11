import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Abonnementer købes udelukkende i App Store og Google Play gennem RevenueCat.
// RevenueCats webhook skriver subscription_status på brugerens UserProfile, og
// denne funktion læser blot den status.
//
// Her var før et opslag hos Stripe. Det er fjernet med vilje: betalinger går
// kun gennem butikkerne, og appen må alligevel ikke sælge adgang uden om dem
// (Apple 3.1.1). Læg det ikke tilbage uden at tage den samtale først.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Brugere oprettet med email og adgangskode genkendes ikke som
    // autentificerede af row-level security, så profilen skal hentes med
    // asServiceRole. Ellers fejler opslaget lydløst for præcis dem.
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles[0];

    if (!profile) {
      return Response.json({ active: false, reason: 'no_profile' });
    }

    if (profile.subscription_status === 'active') {
      return Response.json({ active: true, status: 'active', source: 'revenuecat' });
    }

    return Response.json({
      active: false,
      reason: profile.subscription_status || 'no_subscription',
    });
  } catch (error) {
    console.error('verifySubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
