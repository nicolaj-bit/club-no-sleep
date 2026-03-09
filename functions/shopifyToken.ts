import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client_id = Deno.env.get("SHOPIFY_CLIENT_ID");
    const client_secret = Deno.env.get("SHOPIFY_ADMIN_API_TOKEN"); // shpss_ secret
    const shop = Deno.env.get("SHOPIFY_STORE_DOMAIN");

    if (!client_id || !client_secret || !shop) {
      return Response.json({ error: 'Missing Shopify credentials' }, { status: 500 });
    }

    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id,
        client_secret,
        grant_type: 'client_credentials',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error_description || data.error || 'Token exchange failed' }, { status: res.status });
    }

    return Response.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      scope: data.scope,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});