import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * RevenueCat webhook — synkroniserer iOS IAP til UserProfile.subscription_status
 * Konfigurér i RevenueCat dashboard → Project Settings → Integrations → Webhooks
 * URL: <din app url>/api/functions/revenueCatWebhook
 * Authorization header: sæt REVENUECAT_WEBHOOK_SECRET i app secrets
 */
Deno.serve(async (req) => {
  try {
    // Validér webhook secret
    const authHeader = req.headers.get('Authorization') || '';
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

    if (webhookSecret && authHeader !== webhookSecret) {
      console.error('RevenueCat webhook: ugyldig authorization header');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const event = body.event;

    if (!event) {
      return Response.json({ error: 'Manglende event' }, { status: 400 });
    }

    console.log(`[RevenueCat] event: ${event.type}, app_user_id: ${event.app_user_id}`);

    const base44 = createClientFromRequest(req);

    // Find bruger via app_user_id (vi sætter user.id eller email som RC userId)
    const appUserId = event.app_user_id;
    if (!appUserId) {
      return Response.json({ ok: true, skipped: 'no app_user_id' });
    }

    // Søg efter profil med user email eller id
    let profiles = [];
    try {
      profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: appUserId });
    } catch {}

    if (!profiles.length) {
      console.log(`[RevenueCat] ingen profil fundet for ${appUserId}`);
      return Response.json({ ok: true, skipped: 'no profile' });
    }

    const profile = profiles[0];

    // Håndtér event types
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION': {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          subscription_status: 'active',
          subscription_id: event.product_id || event.original_transaction_id || '',
          subscription_started_at: new Date().toISOString(),
        });
        console.log(`[RevenueCat] aktiverede abonnement for ${appUserId}`);
        break;
      }

      case 'CANCELLATION':
      case 'EXPIRATION': {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          subscription_status: 'expired',
        });
        console.log(`[RevenueCat] afsluttede abonnement for ${appUserId}`);
        break;
      }

      case 'BILLING_ISSUE': {
        console.log(`[RevenueCat] betalingsproblem for ${appUserId}`);
        // Beholder nuværende status — RevenueCat giver grace period
        break;
      }

      default:
        console.log(`[RevenueCat] ukendt event type: ${event.type} — ignorerer`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[RevenueCat] webhook fejl:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});