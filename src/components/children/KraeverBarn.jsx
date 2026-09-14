import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useActiveChild } from '@/components/ui/ActiveChildContext';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { useInviteAccess } from '@/components/auth/InviteAccessContext';
import { useLanguage } from '@/components/ui/LanguageContext';
import { Loader2 } from 'lucide-react';

/**
 * KraeverBarn — vises i stedet for sidens indhold, når den nødvendige dato
 * mangler. Spørgér om enten fødselsdato eller terminsdato, aldrig begge.
 * Inviterede brugere arver ejerens barn og ser aldrig dette.
 *
 * Når datoen er gemt (via saveChildDate backend), indlæses siden med det samme —
 * ingen omdirigering, ingen genindlæsning.
 *
 * Props:
 *   field  — 'birthdate' | 'due_date'
 *   reason — t.-nøgle for den forklarende linje (sidespecifik)
 */
export default function KraeverBarn({ field, reason, children }) {
  const { t } = useLanguage();
  const { isInvited } = useInviteAccess();
  const { activeChild, loading: childLoading, refetch } = useActiveChild();
  const { activeProfile, loading: profileLoading } = useActiveProfile();
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const profileField = field === 'due_date' ? 'child_due_date' : 'child_birthdate';
  const hasDate = activeChild?.[field] || activeProfile?.[profileField];

  // Inviterede brugere arver ejerens barn — vis aldrig spærren.
  if (isInvited) return children;

  if (childLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  if (hasDate) return children;

  const explanation = t[reason] || '';
  const label = field === 'due_date' ? t.kraeverBarnDueDateLabel : t.kraeverBarnBirthdateLabel;

  const handleSave = async () => {
    if (!date) {
      setError(t.kraeverBarnRequired);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await base44.functions.invoke('saveChildDate', {
        field,
        value: date,
        child_id: activeChild?.id,
      });
      await refetch();
    } catch (e) {
      setError(t.kraeverBarnError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-12 flex flex-col items-center text-center">
      <h2
        style={{
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: '1.6rem',
          color: 'var(--color-text-primary)',
          marginBottom: 10,
        }}
      >
        {label}
      </h2>
      <p
        style={{
          fontSize: '0.92rem',
          color: 'var(--color-text-muted)',
          maxWidth: 320,
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        {explanation}
      </p>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full max-w-xs px-4 py-3.5 rounded-xl text-base outline-none"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      />
      {error && (
        <p style={{ color: '#c0392b', fontSize: '0.8rem', marginTop: 8 }}>{error}</p>
      )}
      <button
        onClick={handleSave}
        disabled={saving || !date}
        className="w-full max-w-xs mt-5 py-3.5 rounded-2xl text-base font-semibold disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.kraeverBarnSave}
      </button>
    </div>
  );
}