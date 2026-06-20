import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

const STATUS_OPTIONS = ['trial', 'active', 'expired'];

const STATUS_LABELS = {
  trial: { label: 'Trial', bg: '#FFF3CD', color: '#856404' },
  active: { label: 'Aktiv', bg: '#D4EDDA', color: '#155724' },
  expired: { label: 'Udløbet', bg: '#F8D7DA', color: '#721C24' },
};

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') window.location.href = '/';
    });
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    const all = await base44.entities.UserProfile.list('-created_date', 200);
    // Deduplicate: keep only the first profile per email
    const seen = new Set();
    const unique = all.filter(p => {
      if (seen.has(p.user_email)) return false;
      seen.add(p.user_email);
      return true;
    });
    setProfiles(unique);
    setLoading(false);
  };

  const updateStatus = async (profile, newStatus) => {
    setUpdating(profile.id);
    try {
      // Update all profiles with same email
      const all = await base44.entities.UserProfile.filter({ user_email: profile.user_email });
      await Promise.all(all.map(p => base44.entities.UserProfile.update(p.id, { subscription_status: newStatus })));
      setProfiles(prev => prev.map(p => p.user_email === profile.user_email ? { ...p, subscription_status: newStatus } : p));
      toast.success(`${profile.user_email} → ${STATUS_LABELS[newStatus].label}`);
    } catch {
      toast.error('Fejl ved opdatering');
    }
    setUpdating(null);
  };

  const filtered = profiles.filter(p =>
    !search ||
    p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    p.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <PageHeader title="Brugere" />

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-4">
        {/* Søgefelt */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søg på email eller navn..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {loading ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>Indlæser...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>Ingen brugere fundet</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(profile => {
              const status = profile.subscription_status || 'trial';
              const badge = STATUS_LABELS[status] || STATUS_LABELS.trial;
              return (
                <div
                  key={profile.id}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {profile.display_name || profile.username || '—'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {profile.user_email}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Skift abonnementsstatus */}
                  <div className="flex gap-2 mt-3">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        disabled={updating === profile.id || status === opt}
                        onClick={() => updateStatus(profile, opt)}
                        className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-opacity disabled:opacity-40"
                        style={{
                          background: status === opt ? STATUS_LABELS[opt].bg : 'var(--color-bg-subtle)',
                          color: status === opt ? STATUS_LABELS[opt].color : 'var(--color-text-muted)',
                          border: `1px solid ${status === opt ? STATUS_LABELS[opt].color + '44' : 'transparent'}`,
                        }}
                      >
                        {STATUS_LABELS[opt].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}