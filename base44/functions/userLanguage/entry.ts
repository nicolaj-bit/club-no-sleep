import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Brugerens sprogvalg: hentes uden argument, gemmes med { language }.
//
// Hvorfor en backend-funktion og ikke bare en entitetsopdatering fra frontend:
// brugere oprettet med email og adgangskode genkendes ikke som autentificerede
// af row-level security. En direkte skrivning ville fejle lydløst for præcis
// dem — og så ville de få danske push-beskeder, selv om de havde valgt engelsk.
//
// Sprogvalget lå før kun i browserens localStorage. Det kunne backend ikke se,
// så push, mails og AI-rådgiveren var altid på dansk, uanset hvad brugeren
// havde valgt. Og valget fulgte ikke med til en ny telefon.

const SUPPORTED = ['da', 'en'];
const DEFAULT_LANGUAGE = 'da';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requested = body?.language;

    // Brugere oprettet med email og adgangskode kræver asServiceRole, ellers
    // finder opslaget ingenting.
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: user.email,
    });
    const profile = profiles[0];

    // Uden argument: hent det gemte sprog.
    if (requested === undefined || requested === null) {
      return Response.json({
        language: profile?.language || DEFAULT_LANGUAGE,
        stored: Boolean(profile?.language),
      });
    }

    if (!SUPPORTED.includes(requested)) {
      return Response.json(
        { error: `Ukendt sprog. Vælg et af: ${SUPPORTED.join(', ')}` },
        { status: 400 }
      );
    }

    if (!profile) {
      // Profilen er ikke oprettet endnu. Sproget ligger stadig i browseren og
      // bliver skrevet, næste gang brugeren skifter sprog.
      return Response.json({ saved: false, reason: 'no_profile', language: requested });
    }

    if (profile.language !== requested) {
      await base44.asServiceRole.entities.UserProfile.update(profile.id, {
        language: requested,
      });
    }

    return Response.json({ saved: true, language: requested });
  } catch (error) {
    console.error('userLanguage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
