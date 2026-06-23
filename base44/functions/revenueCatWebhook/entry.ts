import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * RevenueCat webhook — synkroniserer iOS IAP til UserProfile.subscription_status
 * Konfigurér i RevenueCat dashboard → Project Settings → Integrations → Webhooks
 * URL: <din app url>/api/functions/revenueCatWebhook
 * Authorization header: sæt REVENUECAT_WEBHOOK_SECRET i app secrets
 */
Deno.serve(async (req) => {
  try {
    console.log('[RevenueCat] webhook modtaget');

    // Validér webhook secret — accepter både rå token og "Bearer <token>"
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    console.log('[RevenueCat] auth header til stede:', !!authHeader, 'secret konfigureret:', !!webhookSecret);

    if (webhookSecret) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
      if (token !== webhookSecret) {
        console.error('[RevenueCat] auth mismatch — token længde:', token.length, 'secret længde:', webhookSecret.length);
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[RevenueCat] auth OK, læser body...');

    let bodyText;
    try {
      bodyText = await req.text();
    } catch (readErr) {
      console.error('[RevenueCat] body læse fejl:', readErr.message);
      return Response.json({ error: 'Cannot read body', detail: readErr.message }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (jsonErr) {
      console.error('[RevenueCat] JSON parse fejl:', jsonErr.message);
      return Response.json({ error: 'Invalid JSON body', detail: jsonErr.message }, { status: 400 });
    }
    console.log('[RevenueCat] body parsed, keys:', Object.keys(body || {}));

    // Opret base44 client UDEN Authorization header (SDK forventer "Bearer <token>")
    let base44;
    try {
      const cleanHeaders = new Headers(req.headers);
      cleanHeaders.delete('Authorization');
      cleanHeaders.delete('authorization');
      const cleanReq = new Request(req.url, {
        method: req.method,
        headers: cleanHeaders,
        body: bodyText,
      });
      base44 = createClientFromRequest(cleanReq);
    } catch (clientErr) {
      console.error('[RevenueCat] createClient fejl:', clientErr.message);
      return Response.json({ error: 'Client creation failed', detail: clientErr.message }, { status: 500 });
    }
    console.log('[RevenueCat] base44 client oprettet');

    const event = body.event;

    if (!event) {
      console.error('[RevenueCat] manglende event i body');
      return Response.json({ error: 'Manglende event' }, { status: 400 });
    }

    console.log(`[RevenueCat] event: ${event.type}, app_user_id: ${event.app_user_id}`);

    // Find bruger via app_user_id (vi sætter user.id eller email som RC userId)
    const appUserId = event.app_user_id;
    if (!appUserId) {
      return Response.json({ ok: true, skipped: 'no app_user_id' });
    }

    // Søg efter profil med user email eller id
    let profiles = [];
    try {
      profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: appUserId });
      console.log('[RevenueCat] profiler fundet:', profiles.length);
    } catch (filterErr) {
      console.error('[RevenueCat] filter fejl:', filterErr.message);
    }

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
    console.error('[RevenueCat] webhook fejl:', error.message, error.stack);
    return Response.json({ error: error.message, step: 'catch' }, { status: 500 });
  }
});