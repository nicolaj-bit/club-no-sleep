import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Gemmer brugerens sprogvalg på profilen.
//
// Hvorfor en backend-funktion og ikke bare en entitetsopdatering fra frontend:
// brugere oprettet med email og adgangskode genkendes ikke som autentificerede
// af row-level security. En direkte skrivning ville fejle lydløst for præcis
// dem — og så ville de få danske push-beskeder, selv om de havde valgt engelsk.
//
// Sprogvalget lå før kun i browserens localStorage. Det kunne backend ikke se,
// så push, mails og AI-rådgiveren var altid på dansk.

const SUPPORTED = ['da', 'en'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const language = body?.language;

    if (!SUPPORTED.includes(language)) {
      return Response.json(
        { error: `Ukendt sprog. Vælg et af: ${SUPPORTED.join(', ')}` },
        { status: 400 }
      );
    }

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: user.email,
    });
    const profile = profiles[0];

    if (!profile) {
      // Brugeren har ikke oprettet profil endnu. Sproget ligger stadig i
      // browseren, og det bliver skrevet, så snart profilen findes.
      return Response.json({ saved: false, reason: 'no_profile' });
    }

    if (profile.language === language) {
      return Response.json({ saved: true, language, unchanged: true });
    }

    await base44.asServiceRole.entities.UserProfile.update(profile.id, { language });

    return Response.json({ saved: true, language });
  } catch (error) {
    console.error('setUserLanguage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
