import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PREGNANCY_WEEKS } from '@/components/knowledge/pregnancyWeekData';
import { renderPregnancyText } from '@/components/knowledge/PregnancyTextRenderer';

export default function PregnancyWeekDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const week = parseInt(urlParams.get('week') || '12', 10);
  const data = PREGNANCY_WEEKS[week];

  const [motherName, setMotherName] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        if (profiles[0]) {
          setMotherName(profiles[0].display_name || profiles[0].username || '');
        }
      } catch {}
    };
    loadProfile();
  }, []);

  const prevWeek = week > 4 ? week - 1 : null;
  const nextWeek = week < 42 ? week + 1 : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Ingen data for uge {week}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/PregnancyWeeks" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
            <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            🤰 Graviditet
          </span>
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
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">
        <div>
          <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: 'var(--color-text-primary)', letterSpacing: '0.04em' }}>
            {data.label}
          </h1>
        </div>

        {/* Body section */}
        {data.body.length > 0 && (
          <div className="space-y-3">
            {data.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {renderPregnancyText(para, motherName)}
              </p>
            ))}
          </div>
        )}

        {/* Partner section */}
        {data.partner.length > 0 && (
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <Users className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Til dig, der står ved siden af</span>
            </div>
            <div className="px-4 py-4 space-y-3">
              {data.partner.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {renderPregnancyText(para, motherName)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Next step section */}
        {data.next_step.length > 0 && (
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--color-cappuccino)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Et lille næste skridt</span>
            </div>
            <div className="px-4 py-4 space-y-3">
              {data.next_step.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed italic" style={{ color: 'var(--color-text-secondary)' }}>
                  {renderPregnancyText(para, motherName)}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          {prevWeek ? (
            <Link to={`/PregnancyWeekDetail?week=${prevWeek}`} className="rounded-2xl p-4 flex items-center gap-2 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Forrige</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{PREGNANCY_WEEKS[prevWeek]?.label || `Uge ${prevWeek}`}</p>
              </div>
            </Link>
          ) : <div />}
          {nextWeek ? (
            <Link to={`/PregnancyWeekDetail?week=${nextWeek}`} className="rounded-2xl p-4 flex items-center justify-end gap-2 border" style={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}>
              <div className="text-right">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Næste</p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{PREGNANCY_WEEKS[nextWeek]?.label || `Uge ${nextWeek}`}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}