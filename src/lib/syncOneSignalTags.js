import { Capacitor } from '@capacitor/core';
import { ensureOneSignalInitialized } from '@/utils/requestPushPermission';
import { base44 } from '@/api/base44Client';

/**
 * Syncs subscription status tags to OneSignal for push segmentation.
 * Only runs on native platforms. Never throws — all errors are caught silently.
 *
 * @param {boolean} subscribed - Whether the user has an active subscription/entitlement
 * @param {boolean} trialUsed - Whether the user has used their free trial
 */
export async function syncOneSignalTags(subscribed, trialUsed) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const ok = await ensureOneSignalInitialized();
    if (!ok) return;
    const mod = await import('@onesignal/capacitor-plugin');
    const OneSignal = mod.default ?? mod.OneSignal;
    await OneSignal.User.addTags({
      subscribed: subscribed ? 'true' : 'false',
      trial_used: trialUsed ? 'true' : 'false',
    });
  } catch (err) {
    console.error('[OneSignal] syncTags failed (non-blocking):', err?.message || err);
  }
}

/**
 * Fetches subscription status from the backend (UserProfile) and syncs to OneSignal.
 * Used at login and app start when RevenueCat data isn't available yet.
 */
export async function syncOneSignalTagsFromBackend() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return;
    const user = await base44.auth.me();
    if (!user) return;
    const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (!profiles.length) {
      await syncOneSignalTags(false, false);
      return;
    }
    const profile = profiles[0];
    const subscribed = profile.subscription_status === 'active' || profile.subscription_status === 'trial';
    const trialUsed = profile.subscription_status === 'active' || profile.subscription_status === 'expired';
    await syncOneSignalTags(subscribed, trialUsed);
  } catch (err) {
    console.error('[OneSignal] syncFromBackend failed (non-blocking):', err?.message || err);
  }
}