// KRITISK — MÅ IKKE ÆNDRES: al login skal ske i appen (App Store Guideline 4)
// Der må ALDRIG åbnes web-login i appen.
// Denne funktion fjerner demo_mode, gemmer evt. nextPath, og genindlæser appen
// så NativeAuthGate opdager manglende auth og viser den indbyggede login/opret-skærm.
export function showInAppLogin(nextPath) {
  try {
    localStorage.removeItem('demo_mode');
  } catch (e) {
    console.warn('[showInAppLogin] Kunne ikke fjerne demo_mode:', e);
  }

  if (nextPath) {
    try {
      localStorage.setItem('post_login_redirect', nextPath);
    } catch (e) {
      console.warn('[showInAppLogin] Kunne ikke gemme post_login_redirect:', e);
    }
  }

  window.location.href = '/app';
}