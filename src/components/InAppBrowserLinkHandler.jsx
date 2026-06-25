import { useEffect } from 'react';
import { openExternalUrl } from '@/lib/openExternalUrl';

/**
 * Global click interceptor.
 *
 * Any click on an <a> element whose href is an external http(s) URL is
 * captured and opened in the in-app browser (SFSafariViewController /
 * Chrome Custom Tabs on native, new tab on web) instead of navigating
 * away from the app. Internal React Router links (relative hrefs) and
 * mailto/tel schemes are left untouched.
 *
 * Mount once near the app root so it covers every page.
 */
export default function InAppBrowserLinkHandler() {
  useEffect(() => {
    const handler = (event) => {
      const anchor = event.target.closest && event.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute && anchor.getAttribute('href');
      if (!href) return;
      // Only intercept external http(s) links
      if (!/^https?:\/\//i.test(href)) return;
      event.preventDefault();
      openExternalUrl(href);
    };

    // Capture phase so we run before React Router or other handlers
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  return null;
}