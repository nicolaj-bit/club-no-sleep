import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Sparkles, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PREGNANCY_WEEKS } from '@/components/knowledge/pregnancyWeekData';
import { useLanguage } from '@/components/ui/LanguageContext';
import PageHeader from '@/components/ui/PageHeader';

function renderRichText(text, motherName, linkUrl) {
  const displayName = motherName || 'hun';
  let processed = text.replace(/\{\{motherName\}\}/g, displayName);

  if (!processed.includes('{{link}}')) {
    return processed;
  }

  const parts = processed.split('{{link}}');
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {part}
      {i < parts.length - 1 && linkUrl && (
        <Link to={`/BlogPost?id=${linkUrl}`} style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
          her
        </Link>
      )}
    </React.Fragment>
  ));
}

export default function PregnancyWeekDetail() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const week = parseInt(urlParams.get('week') || '12', 10);
  const data = PREGNANCY_WEEKS[week];

  const [motherName, setMotherName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        const profile = profiles[0];
        setMotherName(profile?.display_name || profile?.username || user?.full_name || 'hun');
      } catch {
        // ignore
      }
      setLoading(false);
    };
    load();
  }, []);

  const prevWeek = week > 4 ? week - 1 : null;
  const nextWeek = week < 42 ? week + 1 : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>{t.pwdNoDataForWeek} {week}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <PageHeader
        title={t.pwdHeaderLabel}
        backUrl="/PregnancyWeeks"
        rightAction={
          <div className="flex gap-1">
            {prevWeek && (
              <Link to={`/PregnancyWeekDetail?week=${prevWeek}`} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
            )}
            {nextWeek && (
              <Link to={`/PregnancyWeekDetail?week=${nextWeek}`} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
            )}
          </div>
        }
      />

      <div className="px-4 pt-5 space-y-5">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)', letterSpacing: '0.04em' }}>
            {data.title}
          </h1>
        </div>

        {/* Main text */}
        <div className="space-y-4">
          {data.mainText.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed article-content" style={{ color: 'var(--color-text-secondary)' }}>
              {para}
            </p>
          ))}
        </div>

        {/* Partner section */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Heart className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Til dig, der står ved siden af</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            {data.partnerText.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {renderRichText(para, motherName, null)}
              </p>
            ))}
          </div>
        </div>

        {/* Next step section */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-cappuccino)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Et lille næste skridt</span>
          </div>
          <div className="px-4 py-4 space-y-3">
            {data.nextStepText.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {renderRichText(para, motherName, data.linkUrl)}
              </p>
            ))}
          </div>
        </div>

        {/* Prev/Next navigation */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {prevWeek ? (
            <Link to={`/PregnancyWeekDetail?week=${prevWeek}`} className="rounded-2xl p-4 flex items-center gap-2 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.pwdPrevious}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{PREGNANCY_WEEKS[prevWeek]?.title || `Uge ${prevWeek}`}</p>
              </div>
            </Link>
          ) : <div />}
          {nextWeek ? (
            <Link to={`/PregnancyWeekDetail?week=${nextWeek}`} className="rounded-2xl p-4 flex items-center justify-end gap-2 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.pwdNext}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{PREGNANCY_WEEKS[nextWeek]?.title || `Uge ${nextWeek}`}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}