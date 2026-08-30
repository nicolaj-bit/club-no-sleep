import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// ============================================================================
// ensureNativeActionToken — kræver login.
// Returnerer brugerens native_action_token. Hvis feltet er tomt, genereres
// et nyt tilfældigt token (48 tegn), gemmes på profilen og returneres.
// ============================================================================

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint32Array(48);
  crypto.getRandomValues(values);
  let token = '';
  for (let i = 0; i < 48; i++) {
    token += chars[values[i] % chars.length];
  }
  return token;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    if (!profile) {
      return Response.json({ error: 'Profil ikke fundet' }, { status: 404 });
    }

    // Returnér eksisterende token hvis det findes
    if (profile.native_action_token) {
      return Response.json({ token: profile.native_action_token });
    }

    // Generér og gem nyt token
    const token = generateToken();
    await base44.asServiceRole.entities.UserProfile.update(profile.id, {
      native_action_token: token,
    });

    return Response.json({ token });
  } catch (error) {
    console.error('ensureNativeActionToken error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}