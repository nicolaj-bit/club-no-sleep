/**
 * Anmoder om push-notifikationstilladelse via OneSignal.
 * Virker både i web/PWA (OneSignalDeferred) og native Capacitor (window.OneSignal).
 */
export async function requestPushPermission() {
  try {
    if (window.Capacitor && window.OneSignal) {
      // Native iOS/Android
      await window.OneSignal.Notifications.requestPermission();
    } else if (window.OneSignalDeferred) {
      // Web/PWA
      window.OneSignalDeferred.push(async (OneSignal) => {
        await OneSignal.Notifications.requestPermission();
      });
    }
  } catch (e) {
    console.log('Push permission request failed:', e);
  }
}