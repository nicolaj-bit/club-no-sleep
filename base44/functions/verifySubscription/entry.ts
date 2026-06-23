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

    console.log(`Verifying subscription for ${user.email}`);

    // Find user's profile
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles[0];

    if (!profile) {
      // Ny bruger — søg i Stripe om de har betalt med denne email
      const customers = await stripe.customers.list({ email: user.email, limit: 5 });
      for (const customer of customers.data) {
        const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 5 });
        if (subscriptions.data.length > 0) {
          const sub = subscriptions.data[0];
          console.log(`New user ${user.email} has paid — marking pending activation`);
          return Response.json({ active: true, status: 'active', new_user: true, subscription_id: sub.id });
        }
      }
      return Response.json({ active: false, reason: 'no_profile' });
    }

    // If profile is already active, check if it's a RevenueCat (IAP) or Stripe subscription
    if (profile.subscription_status === 'active') {
      // RevenueCat IAP subscriptions have product IDs (not Stripe 'sub_' prefix)
      const isStripeSub = profile.subscription_id && profile.subscription_id.startsWith('sub_');
      if (!isStripeSub) {
        // RevenueCat IAP — webhook has already verified; trust the active status
        console.log(`IAP subscription active for ${user.email} (RevenueCat product: ${profile.subscription_id})`);
        return Response.json({ active: true, status: 'active', source: 'revenuecat' });
      }
    }

    // If already marked active, verify it's still valid in Stripe
    if (profile.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(profile.subscription_id);
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        if (isActive) {
          // Ensure profile is marked active
          await base44.asServiceRole.entities.UserProfile.update(profile.id, {
            subscription_status: 'active',
          });
          console.log(`Subscription ${profile.subscription_id} is active for ${user.email}`);
          return Response.json({ active: true, status: subscription.status });
        } else {
          // Mark as expired
          await base44.asServiceRole.entities.UserProfile.update(profile.id, {
            subscription_status: 'expired',
          });
          console.log(`Subscription ${profile.subscription_id} is ${subscription.status} for ${user.email}`);
          return Response.json({ active: false, reason: subscription.status });
        }
      } catch (stripeErr) {
        console.error('Stripe lookup error:', stripeErr.message);
      }
    }

    // No subscription_id on profile — search Stripe by email
    const customers = await stripe.customers.list({ email: user.email, limit: 5 });

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 5,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        // Update profile with found subscription
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          subscription_status: 'active',
          subscription_id: sub.id,
          subscription_started_at: new Date(sub.start_date * 1000).toISOString(),
        });
        console.log(`Restored subscription ${sub.id} for ${user.email}`);
        return Response.json({ active: true, status: 'active', restored: true });
      }
    }

    console.log(`No active subscription found for ${user.email}`);
    return Response.json({ active: false, reason: 'no_subscription' });
  } catch (error) {
    console.error('verifySubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});