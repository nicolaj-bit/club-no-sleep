import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find brugerens profil med subscription_id
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles[0];

    if (!profile?.subscription_id) {
      return Response.json({ error: 'Intet aktivt abonnement fundet' }, { status: 400 });
    }

    // Hent subscription fra Stripe
    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id);

    if (!subscription || subscription.status === 'canceled') {
      return Response.json({ error: 'Abonnementet er allerede opsagt' }, { status: 400 });
    }

    // Beregn opsigelsesdato: slutningen af indeværende faktureringsperiode
    // (kun løbende måned — ingen binding)
    const currentPeriodEnd = subscription.current_period_end; // unix timestamp
    const cancelAt = currentPeriodEnd; // udløber ved slutningen af løbende måned

    // Sæt abonnementet til at annullere på den beregnede dato
    await stripe.subscriptions.update(profile.subscription_id, {
      cancel_at: cancelAt,
    });

    // Opdater profilen med opsigelsesdato
    const cancelDate = new Date(cancelAt * 1000).toISOString();
    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      subscription_status: 'active', // stadig aktiv indtil cancel_at
      subscription_cancel_at: cancelDate,
    });

    console.log(`Subscription ${profile.subscription_id} scheduled for cancellation at ${cancelDate} for user ${user.email}`);

    return Response.json({
      success: true,
      cancel_at: cancelDate,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});