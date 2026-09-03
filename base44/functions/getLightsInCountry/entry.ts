import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// ============================================================================
// 'Et lys i mørket' — henter alle profiler med lys tændt (is_online: true)
// i brugerens land. Kaldes fra kortet som den eneste datakilde.
//
// Først oprydning: profiler med is_online: true og last_active ældre end 2 timer
// sættes til is_online: false (samme regel som toggleNightLight, så gamle lys
// ikke bliver stående bare fordi ingen har startet en søvnlog).
//
// Derefter hentes profiler med is_online: true, is_visible: true og gyldig
// latitude/longitude, filtreres til brugerens land ud fra COUNTRY_BOUNDS,
// og den kaldende bruger sorteres fra.
//
// Returnerer { lights: [...], count, country_code, europe_count }.
// ============================================================================

const STALE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 timer

// Landegrænser — samme som DenmarkMap.jsx bruger til fitBounds
const COUNTRY_BOUNDS = {
  DK: { south: 54.5, west: 8.0, north: 57.8, east: 15.2 },
  DE: { south: 47.2, west: 5.8, north: 55.1, east: 15.1 },
  SE: { south: 55.3, west: 11.0, north: 69.1, east: 24.2 },
  NO: { south: 57.9, west: 4.5, north: 71.2, east: 31.2 },
  FI: { south: 59.7, west: 20.5, north: 70.1, east: 31.6 },
  NL: { south: 50.7, west: 3.3, north: 53.6, east: 7.2 },
  BE: { south: 49.5, west: 2.5, north: 51.5, east: 6.4 },
  FR: { south: 41.3, west: -5.2, north: 51.1, east: 9.6 },
  ES: { south: 36.0, west: -9.3, north: 43.8, east: 3.3 },
  IT: { south: 36.6, west: 6.6, north: 47.1, east: 18.5 },
  PL: { south: 49.0, west: 14.1, north: 54.9, east: 24.2 },
  AT: { south: 46.4, west: 9.5, north: 49.0, east: 17.2 },
  CH: { south: 45.8, west: 5.9, north: 47.8, east: 10.5 },
  IE: { south: 51.4, west: -10.5, north: 55.4, east: -5.9 },
  GB: { south: 49.9, west: -8.2, north: 58.7, east: 1.8 },
  PT: { south: 36.9, west: -9.5, north: 42.2, east: -6.2 },
  CZ: { south: 48.5, west: 12.1, north: 51.1, east: 18.9 },
};

function isInBounds(lat, lng, b) {
  return lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const countryCode = body.country_code || 'DK';
    const bounds = COUNTRY_BOUNDS[countryCode] || COUNTRY_BOUNDS.DK;

    const now = new Date();

    // Oprydning: sluk lys ældre end 2 timer (samme regel som toggleNightLight)
    try {
      const staleThreshold = new Date(now.getTime() - STALE_THRESHOLD_MS).toISOString();
      await base44.asServiceRole.entities.UserProfile.updateMany(
        { is_online: true, last_active: { $lt: staleThreshold } },
        { $set: { is_online: false } }
      );
    } catch (e) {
      console.warn('getLightsInCountry cleanup failed:', e?.message || e);
    }

    // Hent alle profiler med lys tændt og synlige
    const onlineProfiles = await base44.asServiceRole.entities.UserProfile.filter({
      is_online: true,
      is_visible: true,
    });

    const valid = (onlineProfiles || []).filter(
      p => typeof p.latitude === 'number' && typeof p.longitude === 'number' && p.user_email !== user.email
    );

    // Filtrer til brugerens land
    const lights = valid
      .filter(p => isInBounds(p.latitude, p.longitude, bounds))
      .map(p => ({
        id: p.id,
        user_email: p.user_email,
        username: p.username,
        display_name: p.display_name,
        profile_image: p.profile_image,
        city: p.city,
        latitude: p.latitude,
        longitude: p.longitude,
      }));

    // Tæl vågne i resten af Europa (alle lande i COUNTRY_BOUNDS)
    const europeCount = valid.filter(p =>
      Object.values(COUNTRY_BOUNDS).some(b => isInBounds(p.latitude, p.longitude, b))
    ).length;

    return Response.json({
      lights,
      count: lights.length,
      country_code: countryCode,
      europe_count: europeCount,
    });
  } catch (error) {
    console.error('getLightsInCountry error:', error?.message || error);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}