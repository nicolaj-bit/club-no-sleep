import { useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigationType } from 'react-router-dom';

const FLAG_KEY = 'justOpenedArticle';

/**
 * Husk listens scroll-position og gendan den ved tilbage-navigation fra en artikel.
 *
 * SCROLL-ELEMENT: Listerne i appen (Blog, Favorites, Knowledge) scroller på
 * `window`/document — der er ingen indre div med overflow-y. Så vi læser/sætter
 * `window.scrollY` og `window.scrollTo`.
 *
 * - Gemmer positionen LØBENDE mens man scroller (debounced onScroll → sessionStorage,
 *   nøgle pr. rute fx `listScroll:/Blog`), plus safety-flush på pagehide/unmount.
 *   Så fanges positionen uanset hvordan man navigerer væk.
 * - Gendanner KUN ved POP (tilbage-nav) når artikel-flaget er sat (frisk navigation
 *   starter i toppen).
 * - Gendannelsen bruger useLayoutEffect + rAF-polling indtil document.scrollHeight
 *   er stort nok til at kunne rulle til mål — håndterer asynkront load af
 *   data/ContentLock/billeder, som ellers nulstiller scroll til 0.
 *
 * dataReady: sæt true når listens indhold er klar.
 */
export function useListScrollRestoration(dataReady = true) {
  const navType = useNavigationType();
  const key = `listScroll:${window.location.pathname}`;
  const restored = useRef(false);

  // Løbende gem (debounced) + safety-flush.
  useEffect(() => {
    let t = null;
    const save = (y) => { try { sessionStorage.setItem(key, String(y)); } catch (_) {} };
    const onScroll = () => {
      const y = window.scrollY;
      if (t) clearTimeout(t);
      t = setTimeout(() => save(y), 120);
    };
    const flush = () => {
      if (t) clearTimeout(t);
      try { sessionStorage.setItem(key, String(window.scrollY)); } catch (_) {}
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [key]);

  // Gendan ved mount.
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

      // Poll indtil dokumentet er højt nok til at rulle til mål (max ~1.5s).
      let n = 0;
      const step = () => {
        window.scrollTo(0, target);
        n += 1;
        if (window.scrollY >= target - 2 && window.scrollY <= target + 2) return;
        if (n > 90) return;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // Ekstra sikring hvis indhold loader sent.
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