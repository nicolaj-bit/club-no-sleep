import { useEffect } from 'react';
import { openExternalUrl } from '@/lib/openExternalUrl';

/**
 * Global interceptor that routes ALL external links through the in-app
 * browser (SFSafariViewController / Chrome Custom Tabs on native, a new
 * tab on web/PWA) so the app session and login are preserved.
 *
 * Two mechanisms:
 *  1. Click interception — any click on an <a> with an http(s) href
 *     (covers shop, support, privacy, terms, FAQ, articles, landing pages,
 *     footer links, links inside rendered HTML/markdown, etc.).
 *  2. window.open patch — programmatic calls such as the shop "Buy now"
 *     button (ProductDetail) that use window.open(url, '_blank').
 *
 * Internal React Router links (relative hrefs) and mailto/tel schemes are
 * left untouched. Mount once near the app root so it covers every page.
 */
export default function InAppBrowserLinkHandler() {
  useEffect(() => {
    // 1) Intercept clicks on external <a> links (capture phase → runs first)
    const clickHandler = (event) => {
      const anchor = event.target.closest && event.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute && anchor.getAttribute('href');
      if (!href) return;
      if (!/^https?:\/\//i.test(href)) return; // only external http(s)
      event.preventDefault();
      openExternalUrl(href);
    };
    document.addEventListener('click', clickHandler, true);

    // 2) Patch window.open so programmatic external links open in-app too
    const nativeOpen = window.open;
    window.open = function (url, ...args) {
      if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
        openExternalUrl(url);
        return null;
      }
      return nativeOpen.call(this, url, ...args);
    };

    return () => {
      document.removeEventListener('click', clickHandler, true);
      window.open = nativeOpen;
    };
  }, []);

  return null;
}