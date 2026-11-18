// Sprog i backend.
//
// Brugerens sprogvalg lå før kun i browserens localStorage, og det kunne
// backend ikke se. Derfor var push-beskeder, mails og AI-rådgiverens svar
// altid på dansk, uanset hvad brugeren havde valgt i appen.
//
// Nu står valget på UserProfile.language, skrevet af funktionen userLanguage.
// Dette modul er det ene sted, backend slår det op og vælger tekst.
//
// Brug:
//   const lang = await getUserLanguage(base44, user.email);
//   const titel = pick(lang, { da: 'Barnet er vågent', en: 'Baby is awake' });

export const SUPPORTED_LANGUAGES = ['da', 'en'];
export const DEFAULT_LANGUAGE = 'da';

/** Gør et vilkårligt input til et sprog, vi understøtter. */
export function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
}

/**
 * Slår en brugers sprog op ud fra email.
 *
 * Bruger asServiceRole, fordi brugere oprettet med email og adgangskode ikke
 * genkendes som autentificerede af row-level security — et almindeligt opslag
 * ville give nul rækker for præcis dem og dermed altid falde tilbage til dansk.
 *
 * Fejler opslaget, svarer den dansk i stedet for at kaste: en besked på det
 * forkerte sprog er bedre end ingen besked.
 */
export async function getUserLanguage(base44, email) {
  if (!email) return DEFAULT_LANGUAGE;
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: email,
    });
    return normalizeLanguage(profiles?.[0]?.language);
  } catch (e) {
    console.log('[i18n] kunne ikke hente sprog for', email, e?.message);
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Henter sproget for flere brugere på én gang, som et opslag email → sprog.
 * Bruges af de job, der sender til mange modtagere, så de ikke laver ét
 * databaseopslag per besked.
 */
export async function getUserLanguages(base44, emails) {
  const unique = [...new Set((emails || []).filter(Boolean))];
  const map = new Map();
  if (unique.length === 0) return map;
  try {
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({
      user_email: { $in: unique },
    });
    for (const p of profiles || []) {
      map.set(p.user_email, normalizeLanguage(p.language));
    }
  } catch (e) {
    console.log('[i18n] kunne ikke hente sprog for flere brugere:', e?.message);
  }
  for (const email of unique) {
    if (!map.has(email)) map.set(email, DEFAULT_LANGUAGE);
  }
  return map;
}

/**
 * Vælger teksten på brugerens sprog.
 * Mangler sproget i objektet, falder den tilbage til dansk.
 */
export function pick(lang, texts) {
  if (!texts) return '';
  const l = normalizeLanguage(lang);
  return texts[l] ?? texts[DEFAULT_LANGUAGE] ?? '';
}
