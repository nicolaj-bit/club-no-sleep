import { useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

const FLAG_KEY = 'justOpenedArticle';

/**
 * Husk listens scroll-position når man navigerer ind i en artikel,
 * og gendan den ved tilbage-navigation. Ved frisk navigation startes i toppen.
 *
 * dataReady: sæt til true når listens data er klar (for at gendanne efter render).
 */
export function useListScrollRestoration(dataReady = true) {
  const navType = useNavigationType();
  const pathname = window.location.pathname;
  const key = `listScroll:${pathname}`;
  const restored = useRef(false);

  // Gem scroll-position løbende mens listen er aktiv
  useEffect(() => {
    let t = null;
    const onScroll = () => {
      if (t) return;
      t = setTimeout(() => {
        try { sessionStorage.setItem(key, String(window.scrollY)); } catch (_) {}
        t = null;
      }, 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      try { sessionStorage.setItem(key, String(window.scrollY)); } catch (_) {}
    };
  }, [key]);

  // Gendan ved mount (kun ved tilbage-navigation fra en artikel)
  useEffect(() => {
    if (restored.current) return;
    if (!dataReady) return;

    let flag = '0';
    try { flag = sessionStorage.getItem(FLAG_KEY) || '0'; } catch (_) {}
    try { sessionStorage.removeItem(FLAG_KEY); } catch (_) {}

    if (navType === 'POP' && flag === '1') {
      let saved = '0';
      try { saved = sessionStorage.getItem(key) || '0'; } catch (_) {}
      const y = parseInt(saved, 10) || 0;
      restored.current = true;
      const apply = () => window.scrollTo(0, y);
      requestAnimationFrame(apply);
      setTimeout(apply, 60);
      setTimeout(apply, 220);
      setTimeout(apply, 450);
    } else {
      try { sessionStorage.removeItem(key); } catch (_) {}
      window.scrollTo(0, 0);
      restored.current = true;
    }
  }, [dataReady, key, navType]);
}

/** Sæt flag i en artikel-/læse-visning så listen bag ved tilbage-navigation gendanner position. */
export function markArticleVisit() {
  try { sessionStorage.setItem(FLAG_KEY, '1'); } catch (_) {}
}