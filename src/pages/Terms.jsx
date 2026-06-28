import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const results = await base44.entities.LegalContent.filter({ type: 'terms' });
        if (results.length > 0) {
          setContent(results[0]);
        }
      } catch (e) {
        console.error('Error fetching terms:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #DCC1B0', borderTopColor: '#5C3317', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF6F1', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFF8F3', borderBottom: '1px solid #EDE4DB', padding: '1.5rem 1.5rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#5B3F2B', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>
          <ChevronLeft size={24} />
          {t.termsBack}
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem', fontSize: '0.95rem', lineHeight: 1.8, color: '#2B1F16', paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 400, marginBottom: '1.5rem', color: '#2B1F16' }}>
          {content?.title || t.termsTitle}
        </h1>

        {content?.content ? (
          <div
            dangerouslySetInnerHTML={{ __html: content.content }}
            style={{
              '& p': { marginBottom: '1rem' },
              '& h2': { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 400, marginTop: '2rem', marginBottom: '1rem', color: '#3A2416' },
              '& ul': { marginLeft: '1.5rem', marginBottom: '1rem' },
              '& li': { marginBottom: '0.5rem' }
            }}
          />
        ) : (
          <p style={{ color: '#7A665A' }}>{t.termsContent}</p>
        )}

        <p style={{ fontSize: '0.85rem', color: '#7A665A', marginTop: '3rem' }}>
          {t.termsLastUpdated} {content?.updated_date ? new Date(content.updated_date).toLocaleDateString('da-DK') : '—'}
        </p>
      </div>
    </div>
  );
}