import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { SUBSCRIPTION_ADMIN_EMAILS } from '../../shared/adminEmails.js';

/**
 * RevenueCat webhook — synkroniserer IAP (iOS App Store OG Google Play) til UserProfile.subscription_status
 * Webhooken er platform-neutral: events fra både App Store og Play Store håndteres
 * ud fra event.type og entitlement, ikke ud fra platform/store.
 * Konfigurér i RevenueCat dashboard → Project Settings → Integrations → Webhooks
 * URL: <din app url>/api/functions/revenueCatWebhook
 * Authorization header: sæt REVENUECAT_WEBHOOK_SECRET i app secrets
 */
/**
 * Sender admin-notifikation ved vigtige abonnementshændelser.
 * Kalderen pakker kaldet i try/catch — mailen må aldrig fejle webhooken.
 */
async function sendAdminNotification(base44, event) {
  // RENEWAL springes over — ellers 1 mail pr. medlem pr. måned
  if (event.type === 'RENEWAL') return;

  const isSandbox = event.environment === 'SANDBOX';
  const testPrefix = isSandbox ? '[TEST] ' : '';

  let subject = '';
  let kind = '';

  if (event.type === 'INITIAL_PURCHASE') {
    if (event.period_type === 'TRIAL') {
      kind = 'trial';
      subject = `${testPrefix}🕯 Ny prøveperiode startet — Club No Sleep`;
    } else {
      kind = 'purchase';
      subject = `${testPrefix}🎉 Nyt betalende medlem — Club No Sleep`;
    }
  } else if (event.type === 'CANCELLATION') {
    kind = 'cancellation';
    subject = `${testPrefix}Et medlem har opsagt — Club No Sleep`;
  } else if (event.type === 'EXPIRATION') {
    kind = 'expiration';
    subject = `${testPrefix}Et medlemskab er udløbt — Club No Sleep`;
  } else {
    return; // Ikke en relevant hændelse
  }

  const storeName = event.store === 'PLAY_STORE'
    ? 'Google Play'
    : event.store === 'APP_STORE'
      ? 'App Store'
      : event.store || 'Ukendt';

  const userId = event.app_user_id || 'Ukendt';
  const productId = event.product_id || 'Ukendt';
  const now = new Date().toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
  const purchasedAt = event.purchased_at_ms
    ? new Date(event.purchased_at_ms).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' })
    : null;

  let priceLine = '';
  if (event.price !== undefined && event.price !== null) {
    priceLine = `<p><strong>Beløb:</strong> ${event.price} ${event.currency || ''}</p>`;
  }

  let body = `
<h2>${subject}</h2>
<hr />
<p><strong>Bruger:</strong> ${userId}</p>
<p><strong>Platform:</strong> ${storeName}</p>
<p><strong>Produkt:</strong> ${productId}</p>
${priceLine}
<p><strong>Tidspunkt:</strong> ${now}</p>
`;

  if (kind === 'trial' && event.expiration_at_ms) {
    const trialEnd = new Date(event.expiration_at_ms).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
    body += `<hr /><p><strong>Prøveperiode udløber:</strong> ${trialEnd}</p>`;
    body += `<p>Efter udløb konverteres prøveperioden til et betalende abonnement.</p>`;
  }

  if ((kind === 'cancellation' || kind === 'expiration') && event.expiration_at_ms) {
    const accessEnd = new Date(event.expiration_at_ms).toLocaleString('da-DK', { timeZone: 'Europe/Copenhagen' });
    body += `<hr /><p><strong>Adgang ophører:</strong> ${accessEnd}</p>`;
    if (purchasedAt) {
      body += `<p><strong>Medlem siden:</strong> ${purchasedAt}</p>`;
    }
  }

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: SUBSCRIPTION_ADMIN_EMAILS.join(', '),
    from_name: 'Club No Sleep Abonnement',
    subject,
    body,
  });

  console.log(`[RevenueCat] admin mail sendt: ${subject}`);
}

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

    // Send admin-notifikation — uafhængig af profil-opslag, må aldrig fejle webhooken
    try {
      await sendAdminNotification(base44, event);
    } catch (mailErr) {
      console.error('[RevenueCat] admin mail fejl:', mailErr.message);
    }

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
        const update: Record<string, unknown> = {
          subscription_status: 'active',
          subscription_id: event.product_id || event.original_transaction_id || '',
          subscription_started_at: new Date().toISOString(),
          subscription_will_renew: true,
        };
        // period_type: 'trial' under prøveperiode, ellers 'normal' — kun ved køb/fornylse
        if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
          update.subscription_period_type = event.period_type === 'TRIAL' ? 'trial' : 'normal';
        }
        if (event.expiration_at_ms) {
          update.subscription_expires_at = new Date(event.expiration_at_ms).toISOString();
        }
        await base44.asServiceRole.entities.UserProfile.update(profile.id, update);
        console.log(`[RevenueCat] aktiverede abonnement for ${appUserId}`);
        break;
      }

      case 'CANCELLATION': {
        // CANCELLATION = auto-fornyelse slået fra; adgangen består perioden ud.
        // Rører IKKE subscription_status — kun subscription_will_renew.
        const cancelUpdate: Record<string, unknown> = {
          subscription_will_renew: false,
        };
        if (event.expiration_at_ms) {
          cancelUpdate.subscription_expires_at = new Date(event.expiration_at_ms).toISOString();
        }
        await base44.asServiceRole.entities.UserProfile.update(profile.id, cancelUpdate);
        console.log(`[RevenueCat] opsigelse registreret (adgang består) for ${appUserId}`);
        break;
      }

      case 'EXPIRATION': {
        // EXPIRATION = adgangen er reelt ophørt.
        const expireUpdate: Record<string, unknown> = {
          subscription_status: 'expired',
          subscription_will_renew: false,
        };
        if (event.expiration_at_ms) {
          expireUpdate.subscription_expires_at = new Date(event.expiration_at_ms).toISOString();
        }
        await base44.asServiceRole.entities.UserProfile.update(profile.id, expireUpdate);
        console.log(`[RevenueCat] abonnement udløbet for ${appUserId}`);
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