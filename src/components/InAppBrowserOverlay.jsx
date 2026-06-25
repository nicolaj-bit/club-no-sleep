import { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Lock } from 'lucide-react';
import { openInNewTab } from '@/lib/openExternalUrl';

/**
 * Full-screen in-app browser overlay for web/PWA.
 *
 * Listens for 'open-in-app-browser' events dispatched by openExternalUrl and
 * shows the URL in an iframe with a clear close button — so the user stays
 * inside the app and the login session is preserved. A "open in browser"
 * button lets the user escape to a real tab for sites that block being
 * framed (e.g. Shopify).
 *
 * On native, openExternalUrl uses the Capacitor Browser plugin instead, so
 * this overlay is only used on web (or as a native fallback).
 */
export default function InAppBrowserOverlay() {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      const u = e.detail?.url;
      if (!u) return;
      setUrl(u);
      setLoading(true);
    };
    window.addEventListener('open-in-app-browser', handler);
    return () => window.removeEventListener('open-in-app-browser', handler);
  }, []);

  if (!url) return null;

  const close = () => {
    setUrl(null);
    setLoading(true);
  };

  let host = url;
  try {
    host = new URL(url).hostname;
  } catch {}

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b safe-top"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={close}
          aria-label="Luk"
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 active:opacity-60"
          style={{ backgroundColor: 'var(--color-bg-subtle)' }}
        >
          <X className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
        </button>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 px-1">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            {host}
          </p>
        </div>

        <button
          onClick={() => {
            openInNewTab(url);
            close();
          }}
          className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium flex-shrink-0 active:opacity-60"
          style={{
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-text-primary)',
          }}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Åbn i browser</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#A0785A' }} />
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          referrerPolicy="no-referrer"
          allow="clipboard-write; encrypted-media; geolocation; fullscreen"
          title="In-app browser"
        />
      </div>
    </div>
  );
}