// Sprogvalget uden for React.
//
// Et par moduler kører uden for komponenttræet — notifikationen til
// låseskærmen og den, der gemmer et milepælsbillede. De kan ikke bruge
// useLanguage(), så de læser valget samme sted, som LanguageContext gemmer
// det. LanguageContext skriver også profilens sprog tilbage hertil ved
// opstart, så de to kilder er enige.

export function currentLanguage() {
  try {
    return localStorage.getItem('app-language') === 'en' ? 'en' : 'da';
  } catch (_) {
    // Privat vindue eller blokeret lager — så er dansk det rigtige gæt.
    return 'da';
  }
}

/** Vælger teksten på brugerens sprog. */
export function pickText(da, en) {
  return currentLanguage() === 'en' ? en : da;
}
