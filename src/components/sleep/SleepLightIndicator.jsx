import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Diskret, varm indikator der vises i søvnloggen mens lyset er tændt.
// Klikbar → hopper til 'Et lys i mørket' (Community).
export default function SleepLightIndicator({ onlineCount }) {
  const othersText = onlineCount > 0
    ? `${onlineCount} ${onlineCount === 1 ? 'anden er' : 'andre er'} vågne lige nu`
    : 'Du er ikke alene vågen nu';

  return (
    <Link
      to={createPageUrl('Community')}
      className="block mb-4 rounded-2xl p-3.5 transition-all active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, var(--color-accent-warm), var(--color-bg-subtle))',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg leading-none">🕯</span>
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Dit lys er tændt
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {othersText}
          </p>
        </div>
      </div>
    </Link>
  );
}