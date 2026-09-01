import React from 'react';
import { useRevenueCat } from '@/components/subscription/useRevenueCat';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Clock } from 'lucide-react';

export default function TrialStatusBadge({ userEmail }) {
  const { t } = useLanguage();
  const rc = useRevenueCat(userEmail || null);

  if (rc.loading || !rc.isNative || !rc.customerInfo) return null;

  const activeEntitlements = rc.customerInfo?.entitlements?.active;
  if (!activeEntitlements) return null;

  const entitlement = Object.values(activeEntitlements)[0];
  if (!entitlement || entitlement.periodType !== 'Trial') return null;

  const exp = entitlement.expirationDate;
  if (!exp) return null;
  const expMs = parseInt(exp, 10);
  if (isNaN(expMs)) return null;

  const daysRemaining = Math.ceil((expMs - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysRemaining <= 0) return null;

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border)' }}
    >
      <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
      <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {t.trialEndsInPrefix} {daysRemaining} {daysRemaining === 1 ? t.daySingular : t.dayPlural}
      </p>
    </div>
  );
}