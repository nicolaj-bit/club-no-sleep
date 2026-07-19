import React from 'react';
import { useActiveProfile } from '@/components/ui/ActiveProfileContext';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

export default function ReactivateSubscriptionBanner() {
  const { activeProfile, loading } = useActiveProfile();
  const navigate = useNavigate();

  if (loading || !activeProfile) return null;
  if (activeProfile.subscription_status !== 'expired') return null;

  const handleClick = () => {
    navigate('/Checkout');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 rounded-2xl px-4 py-3.5 active:opacity-80 transition-opacity w-full text-left"
      style={{
        background: 'linear-gradient(135deg, var(--color-accent), var(--color-brown-light))',
        boxShadow: '0 2px 12px rgba(160,120,80,0.25)',
      }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
        <RefreshCw className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white leading-tight">Genaktiver dit abonnement</p>
        <p className="text-xs text-white/75 mt-0.5">Få fuld adgang igen →</p>
      </div>
    </button>
  );
}