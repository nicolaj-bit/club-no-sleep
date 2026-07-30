import { isNativeIOS, isNativeAndroid } from '@/lib/platform';

/**
 * Åbner en adresse i enhedens native kort-app.
 *  - iOS (Capacitor native): maps://?q=... → Apple Maps
 *  - Android (Capacitor native): geo:0,0?q=... → kort-app
 *  - Web: Google Maps search i ny fane
 *
 * Bruger window.location.href til native URL-skemaer så STYRESYSTEMET
 * håndterer åbningen — ikke Capacitor Browser (in-app browser).
 */
export function openInMaps(address) {
  if (!address) return;
  const query = encodeURIComponent(address);

  if (isNativeIOS()) {
    window.location.href = `maps://?q=${query}`;
    return;
  }

  if (isNativeAndroid()) {
    window.location.href = `geo:0,0?q=${query}`;
    return;
  }

  // Web / PWA / fallback
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
}