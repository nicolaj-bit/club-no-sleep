import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';

/**
 * Fælles flydende navigation for artikel-/læse-visninger.
 *
 * - hasHero: viser de runde knapper ovenpå hero-billedet (scroller væk med billedet).
 * - Når man er forbi hero (eller altid uden hero): knapperne lægger sig fast øverst,
 *   skjules ved scroll NED, vises ved scroll OP — med let blur-baggrund og safe-area.
 *
 * children: funktion der modtager `mode` ('hero' | 'pinned') og returnerer højre-knapper.
 */
export default function ArticleFloatingNav({ backUrl, hasHero = false, heroRef = null, children }) {
  const { isDark } = useTheme();
  const [pinned, setPinned] = useState(!hasHero);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(backUrl);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const atTop = currentY < 8;
      const scrollingUp = currentY < lastScrollY.current - 4;
      const scrollingDown = currentY > lastScrollY.current + 4;

      let isPastHero = !hasHero;
      if (hasHero && heroRef?.current) {
        const rect = heroRef.current.getBoundingClientRect();
        isPastHero = rect.bottom < 56;
      }

      if (hasHero) {
        if (!isPastHero) {
          setPinned(false); // hero-mode dækker
        } else if (scrollingUp) {
          setPinned(true);
        } else if (scrollingDown) {
          setPinned(false);
        }
      } else {
        if (atTop) setPinned(true);
        else if (scrollingUp) setPinned(true);
        else if (scrollingDown) setPinned(false);
      }

      lastScrollY.current = currentY;
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasHero, heroRef]);

  const heroBtnBg = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)';
  const heroIconColor = isDark ? '#fff' : '#000';

  return (
    <>
      {/* Hero-mode: ovenpå billedet, scroller med indholdet */}
      {hasHero && (
        <div
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 47px)' }}
        >
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ backgroundColor: heroBtnBg }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: heroIconColor }} />
          </button>
          <div className="flex gap-2">{children('hero', { btnBg: heroBtnBg, iconColor: heroIconColor })}</div>
        </div>
      )}

      {/* Pinned-mode: fastflydende øverst ved scroll-up */}
      <div
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 transition-transform duration-300"
        style={{
          transform: pinned ? 'translateY(0)' : 'translateY(-120%)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 47px)',
          paddingBottom: '10px',
          backgroundColor: isDark ? 'rgba(31,26,23,0.82)' : 'rgba(255,253,249,0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,31,22,0.06)' }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <div className="flex gap-2">
          {children('pinned', {
            btnBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(43,31,22,0.06)',
            iconColor: 'var(--color-text-primary)',
          })}
        </div>
      </div>
    </>
  );
}