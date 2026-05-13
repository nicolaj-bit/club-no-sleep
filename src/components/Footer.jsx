import React from 'react';
import { Link } from 'react-router-dom';

const COMPANY_INFO = {
  name: 'LALATOTO',
  address: 'Kulbyvej 16, 4270 Høng',
  phone: '+45 40 40 88 88',
  email: 'kundeservice@lalatoto.dk',
  website: 'lalatoto.dk',
  logo: 'https://www.lalatoto.dk/cdn/shop/files/LALATOTO_logotype_Brun_600x.png?v=1730971736',
};

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2A231F', color: '#B7A79A' }}>
      {/* Top section with company info */}
      <div style={{
        borderBottom: '1px solid #3A312B',
        padding: '64px 24px',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 48,
          marginBottom: 48
        }}>
          {/* Logo & Description */}
          <div>
            <img
              src={COMPANY_INFO.logo}
              alt={COMPANY_INFO.name}
              style={{
                height: 28,
                marginBottom: 16,
                filter: 'brightness(1.5) sepia(0.3) hue-rotate(15deg)',
              }}
            />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#8A7A6E', maxWidth: 220 }}>
              En app skabt til danske forældre — søvn, trivsel og fællesskab samlet ét sted.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5EFE9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kontakt</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <div>
                <p style={{ color: '#8A7A6E', margin: 0 }}>{COMPANY_INFO.address}</p>
              </div>
              <div>
                <p style={{ margin: 0 }}>
                  <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`} style={{ color: '#C29A73', textDecoration: 'none' }}>
                    {COMPANY_INFO.phone}
                  </a>
                </p>
              </div>
              <div>
                <p style={{ margin: 0 }}>
                  <a href={`mailto:${COMPANY_INFO.email}`} style={{ color: '#C29A73', textDecoration: 'none' }}>
                    {COMPANY_INFO.email}
                  </a>
                </p>
              </div>
              <div>
                <p style={{ margin: 0 }}>
                  <a href="https://www.lalatoto.dk" target="_blank" rel="noopener noreferrer" style={{ color: '#C29A73', textDecoration: 'none' }}>
                    {COMPANY_INFO.website}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Legal Links */}
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
              <a href="https://apps.apple.com/app/lalatoto/id6478508842" target="_blank" rel="noopener noreferrer" style={{ color: '#C29A73', textDecoration: 'none', fontSize: '0.85rem' }}>
                App Store
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.lalatoto.app" target="_blank" rel="noopener noreferrer" style={{ color: '#C29A73', textDecoration: 'none', fontSize: '0.85rem' }}>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div style={{
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#8A7A6E'
      }}>
        <p style={{ margin: 0, marginBottom: 8 }}>
          © {new Date().getFullYear()} LALATOTO ApS. Alle rettigheder forbeholdes.
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#5A4A40' }}>
          CVR: 43 86 12 59 • Skabt med ❤️ i Danmark
        </p>
      </div>
    </footer>
  );
}