import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const DEFAULTS = {
  name: 'LALATOTO',
  tagline: 'En app skabt til danske forældre — søvn, trivsel og fællesskab samlet ét sted.',
  address: 'Kulbyvej 16, 4270 Høng',
  phone: '+45 40 40 88 88',
  email: 'kundeservice@lalatoto.dk',
  website: 'lalatoto.dk',
  cvr: '43 86 12 59',
  app_store_url: 'https://apps.apple.com/app/lalatoto/id6478508842',
  google_play_url: 'https://play.google.com/store/apps/details?id=com.lalatoto.app',
  logo_url: 'https://www.lalatoto.dk/cdn/shop/files/LALATOTO_logotype_Brun_600x.png?v=1730971736',
};

export default function Footer({ previewData }) {
  const [info, setInfo] = useState(DEFAULTS);

  useEffect(() => {
    if (previewData) return; // skip fetch if preview mode
    base44.entities.FooterContent.list().then((records) => {
      if (records && records.length > 0) {
        setInfo({ ...DEFAULTS, ...records[0] });
      }
    }).catch(() => {});
  }, [previewData]);

  const d = previewData ? { ...DEFAULTS, ...previewData } : info;

  return (
    <footer style={{ backgroundColor: '#2A231F', color: '#B7A79A' }}>
      {/* Top section */}
      <div style={{
        borderBottom: '1px solid #3A312B',
        padding: '64px 24px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 48,
          marginBottom: 48
        }}>
          {/* Logo & Tagline */}
          <div>
            <img
              src={d.logo_url}
              alt={d.name}
              style={{ height: 28, marginBottom: 16, filter: 'brightness(1.5) sepia(0.3) hue-rotate(15deg)' }}
            />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#8A7A6E', maxWidth: 220 }}>
              {d.tagline}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5EFE9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kontakt</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <p style={{ color: '#8A7A6E', margin: 0 }}>{d.address}</p>
              <a href={`tel:${d.phone.replace(/\s/g, '')}`} style={{ color: '#C29A73', textDecoration: 'none' }}>{d.phone}</a>
              <a href={`mailto:${d.email}`} style={{ color: '#C29A73', textDecoration: 'none' }}>{d.email}</a>
              <a href={`https://${d.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#C29A73', textDecoration: 'none' }}>{d.website}</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5EFE9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Juridisk</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <Link to="/terms" style={{ color: '#C29A73', textDecoration: 'none' }}>Handelsbetingelser</Link>
              <Link to="/privacy" style={{ color: '#C29A73', textDecoration: 'none' }}>Privatlivspolitik</Link>
              <a href="#" style={{ color: '#8A7A6E', textDecoration: 'none', cursor: 'not-allowed' }} title="Kommer snart">Cookiepolitik</a>
            </div>
          </div>

          {/* App Links */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5EFE9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Download appen</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {d.app_store_url && (
                <a href={d.app_store_url} target="_blank" rel="noopener noreferrer" style={{ color: '#C29A73', textDecoration: 'none', fontSize: '0.85rem' }}>App Store</a>
              )}
              {d.google_play_url && (
                <a href={d.google_play_url} target="_blank" rel="noopener noreferrer" style={{ color: '#C29A73', textDecoration: 'none', fontSize: '0.85rem' }}>Google Play</a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.8rem', color: '#8A7A6E' }}>
        <p style={{ margin: 0, marginBottom: 8 }}>
          © {new Date().getFullYear()} {d.name} ApS. Alle rettigheder forbeholdes.
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#5A4A40' }}>
          {d.cvr && `CVR: ${d.cvr} • `}Skabt med ❤️ i Danmark
        </p>
      </div>
    </footer>
  );
}