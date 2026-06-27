import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jwtVerify, createRemoteJWKSet } from 'npm:jose@5';

// Bundle ID for appen — bruges som "aud" i Apples identity token
const APPLE_BUNDLE_ID = Deno.env.get('APPLE_BUNDLE_ID') || 'com.base699f47a86e7e0a874d1159ed.app';

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { identityToken, fullName } = await req.json();

    if (!identityToken) {
      return Response.json({ error: 'Manglende identityToken' }, { status: 400 });
    }

    // Verificér Apples JWT mod Apples offentlige nøgler
    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: APPLE_BUNDLE_ID,
    });

    const email = payload.email;
    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Apple-token indeholder ingen email' }, { status: 400 });
    }

    // Find eksisterende bruger, eller opret en ny via service role
    const existing = await base44.asServiceRole.entities.User.filter({ email });
    let user = existing[0];

    if (!user) {
      user = await base44.asServiceRole.entities.User.create({
        email,
        full_name: fullName || email.split('@')[0],
      });
    }

    // Udstil en rigtig Base44-session for brugeren (samme niveau som login via email/password)
    const { access_token } = await base44.asServiceRole.sso.getAccessToken(user.id);

    return Response.json({ access_token });
  } catch (e) {
    console.error('[appleNativeLogin] error:', e);
    return Response.json({ error: e?.message || 'Apple login mislykkedes' }, { status: 401 });
  }
});
