import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function AdminTermsPrivacy() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [terms, setTerms] = useState(null);
  const [privacy, setPrivacy] = useState(null);
  const [activeTab, setActiveTab] = useState('terms');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        if (u?.role !== 'admin') {
          toast.error(t.adminTermsPrivacyAdminOnly);
          return;
        }
        setUser(u);

        const [termsResults, privacyResults] = await Promise.all([
          base44.entities.LegalContent.filter({ type: 'terms' }),
          base44.entities.LegalContent.filter({ type: 'privacy' })
        ]);

        setTerms(termsResults[0] || { type: 'terms', title: 'Handelsbetingelser', content: '' });
        setPrivacy(privacyResults[0] || { type: 'privacy', title: 'Privatlivspolitik', content: '' });
      } catch (e) {
        toast.error(t.adminTermsPrivacyError);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!user || user.role !== 'admin') return;
    
    setSaving(true);
    try {
      const current = activeTab === 'terms' ? terms : privacy;
      
      if (current.id) {
        await base44.entities.LegalContent.update(current.id, {
          title: current.title,
          content: current.content
        });
      } else {
        await base44.entities.LegalContent.create(current);
      }
      
      toast.success(t.adminTermsPrivacySaved);
    } catch (e) {
      toast.error(t.adminTermsPrivacyError);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t.adminTermsPrivacyLoading}</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{t.adminTermsPrivacyAccess}</div>;
  }

  const current = activeTab === 'terms' ? terms : privacy;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', marginBottom: '2rem' }}>
        {t.adminTermsPrivacyTitle}
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('terms')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'terms' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'terms' ? 'var(--color-primary-foreground)' : 'var(--color-primary)',
            cursor: 'pointer',
            borderRadius: 4,
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          {t.adminTermsPrivacyTerms}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            backgroundColor: activeTab === 'privacy' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'privacy' ? 'var(--color-primary-foreground)' : 'var(--color-primary)',
            cursor: 'pointer',
            borderRadius: 4,
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          {t.adminTermsPrivacyPrivacy}
        </button>
      </div>

      {current && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2B1F16' }}>
              {t.adminTermsPrivacyTitleField}
            </label>
            <input
              type="text"
              value={current.title}
              onChange={(e) => {
                if (activeTab === 'terms') {
                  setTerms({ ...current, title: e.target.value });
                } else {
                  setPrivacy({ ...current, title: e.target.value });
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #EDE4DB',
                borderRadius: 4,
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Content editor */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#2B1F16' }}>
              {t.adminTermsPrivacyContent}
            </label>
            <ReactQuill
              value={current.content}
              onChange={(content) => {
                if (activeTab === 'terms') {
                  setTerms({ ...current, content });
                } else {
                  setPrivacy({ ...current, content });
                }
              }}
              theme="snow"
              style={{ height: 400, marginBottom: '2rem' }}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: saving ? '#ccc' : '#5B3F2B',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              marginTop: '1rem'
            }}
          >
            {saving ? t.adminTermsPrivacySaving : t.save}
          </button>
        </div>
      )}
    </div>
  );
}