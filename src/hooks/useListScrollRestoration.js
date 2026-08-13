import { useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigationType } from 'react-router-dom';

const FLAG_KEY = 'justOpenedArticle';

/**
 * Husk listens scroll-position og gendan den ved tilbage-navigation fra en artikel.
 *
 * Listerne i appen scroller på `window` (ingen indre scroll-container), så vi
 * læser/sætter `window.scrollY` / `window.scrollTo`.
 *
 * - Gemmer positionen løbende i en ref og flusher til sessionStorage ved unmount
 *   (før navigationen) samt på `pagehide` — så vi altid har positionen fra FØR
 *   et evt. scroll-reset udløses.
 * - Gendanner KUN ved POP (tilbage-nav) OG når der er sat et artikel-flag.
 *   Frisk navigation ind på listen starter i toppen.
 * - Gendannelsen poler (rAF) indtil dokumentet er højt nok til at kunne rulle til
 *   målet — ellers ville et sent re-render (fx ContentLock/subscription eller
 *   billeder der loader) ødelægge positionen og sætte den tilbage til 0.
 *
 * dataReady: sæt til true når listens data/indhold er klar.
 */
export function useListScrollRestoration(dataReady = true) {
  const navType = useNavigationType();
  const key = `listScroll:${window.location.pathname}`;
  const lastY = useRef(0);
  const restored = useRef(false);

  // Følg scroll løbende; gem seneste position ved unmount / pagehide.
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => { lastY.current = window.scrollY; };
    const flush = () => {
      try { sessionStorage.setItem(key, String(lastY.current)); } catch (_) {}
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [key]);

  // Gendan ved mount — venter på dataReady, poler derefter indtil siden er høj nok.
  useLayoutEffect(() => {
    if (restored.current) return;
    if (!dataReady) return;

    let flag = '0';
    try { flag = sessionStorage.getItem(FLAG_KEY) || '0'; } catch (_) {}
    try { sessionStorage.removeItem(FLAG_KEY); } catch (_) {}

    if (navType === 'POP' && flag === '1') {
      let saved = '0';
      try { saved = sessionStorage.getItem(key) || '0'; } catch (_) {}
      const target = parseInt(saved, 10) || 0;
      restored.current = true;

      if (target <= 0) {
        window.scrollTo(0, 0);
        return;
      }

      // Poler indtil dokumentet er højt nok til at rulle til mål (max ~1.5s).
      let n = 0;
      const step = () => {
        window.scrollTo(0, target);
        n += 1;
        if (window.scrollY >= target - 2 && window.scrollY <= target + 2) return;
        if (n > 90) return;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // Ekstra sikring hvis indhold loader sent (subscription/billeder).
      setTimeout(() => window.scrollTo(0, target), 500);
      setTimeout(() => window.scrollTo(0, target), 1100);
    } else {
      try { sessionStorage.removeItem(key); } catch (_) {}
      restored.current = true;
      window.scrollTo(0, 0);
    }
  }, [dataReady, key, navType]);
}

/** Sæt flag i en artikel-/læse-visning så listen bag ved tilbage-navigation gendanner position. */
export function markArticleVisit() {
  try { sessionStorage.setItem(FLAG_KEY, '1'); } catch (_) {}
}