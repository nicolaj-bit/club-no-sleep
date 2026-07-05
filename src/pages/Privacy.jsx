import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const results = await base44.entities.LegalContent.filter({ type: 'privacy' });
        if (results.length > 0) {
          setContent(results[0]);
        }
      } catch (e) {
        console.error('Error fetching privacy:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--color-accent-soft)', borderTopColor: 'var(--color-primary)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-nav-bg)', borderBottom: '1px solid var(--color-border)', padding: '1.5rem 1.5rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>
          <ChevronLeft size={24} />
          {t.privacyBack}
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem', fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--color-text-primary)', paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 400, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          {content?.title || t.privacyTitle}
        </h1>

        {content?.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: content.content }}
            style={{
              '& p': { marginBottom: '1rem' },
              '& h2': { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-text-primary)' },
              '& ul': { marginLeft: '1.5rem', marginBottom: '1rem' },
              '& li': { marginBottom: '0.5rem' }
            }}
          />
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>{t.privacyContent}</p>
        )}

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '3rem' }}>
          {t.privacyLastUpdated} {content?.updated_date ? new Date(content.updated_date).toLocaleDateString('da-DK') : '—'}
        </p>
      </div>
    </div>
  );
}