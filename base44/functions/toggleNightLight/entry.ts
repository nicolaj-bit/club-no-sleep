import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// ============================================================================
// 'Et lys i mørket' — tænder/slukker brugerens lys (is_online) baseret på
// søvnlog-sessionens tilstand.
//
//   action: 'on'    → is_online = true,  last_active = now
//   action: 'off'   → is_online = false, last_active = now
//   action: 'status'→ ændrer intet (kun læs)
//
//   auto_light_enabled (valgfri boolean): gemmer samtykke på profilen.
//     true  = brugeren har sagt ja til automatisk lys
//     false = brugeren har sagt nej
//     (ikke angivet = ikke spurgt endnu)
//
// Al data skrives via asServiceRole (samme mønster som søvnloggen).
// Lazy cleanup: slukker lys der har været tændt > 2 timer uden aktivitet.
// Returnerer altid { is_online, online_count, auto_light_enabled }.
// FEJL I DENNE FUNKTION MÅ ALDRIG PÅVIRKE SØVNLOGGEN — alt er try/catch'd.
// ============================================================================

const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 timer

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, auto_light_enabled } = body;

    // Find brugerens profil via asServiceRole (virker for email/password-brugere)
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles?.[0];
    if (!profile) return Response.json({ error: 'Profil ikke fundet' }, { status: 404 });

    const now = new Date();

    // Lazy cleanup: sluk lys ældre end 2 timer
    try {
      const staleThreshold = new Date(now.getTime() - STALE_THRESHOLD_MS).toISOString();
      await base44.asServiceRole.entities.UserProfile.updateMany(
        { is_online: true, last_active: { $lt: staleThreshold } },
        { $set: { is_online: false } }
      );
    } catch (e) {
      console.warn('toggleNightLight cleanup failed:', e?.message || e);
    }

    // Byg opdateringer
    const updates = {};
    if (typeof auto_light_enabled === 'boolean') {
      updates.auto_light_enabled = auto_light_enabled;
    }
    if (action === 'on') {
      updates.is_online = true;
      updates.last_active = now.toISOString();
    } else if (action === 'off') {
      updates.is_online = false;
      updates.last_active = now.toISOString();
    }
    if (Object.keys(updates).length > 0) {
      try {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, updates);
      } catch (e) {
        console.warn('toggleNightLight update failed:', e?.message || e);
      }
    }

    // Tæl andre brugere med lys tændt
    let onlineCount = 0;
    try {
      const allOnline = await base44.asServiceRole.entities.UserProfile.filter({ is_online: true });
      onlineCount = (allOnline || []).filter(p => p.user_email !== user.email).length;
    } catch (e) {
      console.warn('toggleNightLight count failed:', e?.message || e);
    }

    const isOnline = action === 'on' ? true : (action === 'off' ? false : (updates.is_online ?? profile.is_online) === true);
    const consentValue = typeof auto_light_enabled === 'boolean' ? auto_light_enabled : profile.auto_light_enabled;

    return Response.json({
      ok: true,
      is_online: isOnline,
      online_count: onlineCount,
      auto_light_enabled: consentValue,
    });
  } catch (error) {
    console.error('toggleNightLight error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}