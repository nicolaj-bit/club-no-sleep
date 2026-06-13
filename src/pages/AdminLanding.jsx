import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AdminLanding() {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [phoneA, setPhoneA] = useState('');
  const [phoneB, setPhoneB] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        if (u?.role !== 'admin') {
          toast.error('Du skal være admin');
          return;
        }
        setUser(u);

        // Load config
        const configs = await base44.entities.AppConfig.list();
        const landingConfig = configs.find(c => c.key === 'landing_phones');
        if (landingConfig) {
          setConfig(landingConfig);
          setPhoneA(landingConfig.data?.phone_a_url || '');
          setPhoneB(landingConfig.data?.phone_b_url || '');
        }
      } catch (e) {
        console.error(e);
        toast.error('Fejl ved loading');
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        key: 'landing_phones',
        phone_a_url: phoneA,
        phone_b_url: phoneB,
      };

      if (config) {
        await base44.entities.AppConfig.update(config.id, data);
      } else {
        await base44.entities.AppConfig.create(data);
      }

      toast.success('Billeder gemt');
    } catch (e) {
      console.error(e);
      toast.error('Fejl ved gemning');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>Landing telefoner</h1>
      <p>Rediger billede-URLer for de to iPhone mockups på forsiden</p>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Telefon A (venstre):
        </label>
        <input
          type="text"
          value={phoneA}
          onChange={(e) => setPhoneA(e.target.value)}
          placeholder="https://..."
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
        />
        {phoneA && <img src={phoneA} alt="Preview A" style={{ maxWidth: 200, marginBottom: '1rem' }} />}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Telefon B (højre):
        </label>
        <input
          type="text"
          value={phoneB}
          onChange={(e) => setPhoneB(e.target.value)}
          placeholder="https://..."
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
        />
        {phoneB && <img src={phoneB} alt="Preview B" style={{ maxWidth: 200, marginBottom: '1rem' }} />}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          backgroundColor: '#5B3F2B',
          color: '#fff',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {loading ? 'Gemmer...' : 'Gem billeder'}
      </button>
    </div>
  );
}