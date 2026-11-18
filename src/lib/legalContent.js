// Juridiske tekster — handelsbetingelser, privatlivspolitik, FAQ og support.
//
// De ligger i databasen (entiteten LegalContent) med dansk og engelsk ved
// siden af hinanden. Flere skærme viser de samme dokumenter: Vilkår-siden,
// Privatliv-siden, vinduet på landingssiden, onboarding og indstillinger.
// Derfor står valget her ét sted i stedet for at blive gentaget hvert sted.
//
// Er den engelske udgave tom, viser vi den danske. En manglende oversættelse
// må aldrig blive til en tom side — slet ikke i et dokument, brugeren
// accepterer, før hun betaler.
//
// Den danske tekst er den gældende. Det står i den engelske udgave selv.

export function legalBody(entry, lang) {
  if (lang === 'en' && entry?.content_en) return entry.content_en;
  return entry?.content || '';
}

export function legalTitle(entry, lang) {
  if (lang === 'en' && entry?.title_en) return entry.title_en;
  return entry?.title || '';
}
