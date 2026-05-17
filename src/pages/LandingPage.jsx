import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { base44 } from '@/api/base44Client';

const APP_STORE_URL = 'https://apps.apple.com/app/lalatoto/id6478508842';
const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.lalatoto.app';

const DEFAULT_HERO = {
  badge_text: '📱 Din babys bedste start',
  headline: 'Søvn, trivsel &',
  headline_italic: 'fællesskab',
  headline_suffix: 'for hele familien',
  subtext: 'LALATOTO-appen hjælper dig med søvnlog, tigerspring, graviditetsdagbog og et trygt community — alt samlet ét sted.'
};

const DEFAULT_FEATURES = [
{ emoji: '🌙', title: 'Søvnlog', description: 'Log barnets søvn dag for dag. Se mønstre, natlige opvågninger og lur-statistik — og få AI-råd til bedre nætter.' },
{ emoji: '🐯', title: 'Tigerspring', description: 'Bliv guidet gennem alle 10 mentale udviklingsspring. Forstå dit barn bedre og ved hvornår det næste spring kommer.' },
{ emoji: '🤰', title: 'Graviditetsdagbog', description: 'Følg graviditeten uge for uge. Skriv dine tanker, noter symptomer og gem mavebilleder fra hele rejsen.' },
{ emoji: '📅', title: 'Kalender', description: 'Hold styr på jordemoder, scanning og lægebesøg. Få påmindelser dagen før og 30 min inden.' },
{ emoji: '💬', title: 'Community', description: 'Find mødre i nærheden der også er vågne om natten. Et trygt rum kun for mødre — fri for natteensomhed.' },
{ emoji: '🤖', title: 'AI-søvnekspert', description: 'Få personlige svar baseret på jeres søvndata. Vores AI er trænet i babysøvn, amning og barnets udvikling.' }];


const DEFAULT_BENEFITS = [
{ stat: '10+', label: 'Funktioner i én app', sub: 'Søvn, viden, community, shop og mere' },
{ stat: '100%', label: 'Dansk indhold', sub: 'Alt er oversat og tilpasset danske familier' },
{ stat: '🤍', label: 'Skabt af forældre', sub: 'Vi har prøvet det på vores egne børn' },
{ stat: '24/7', label: 'AI-ekspert klar', sub: 'Svar på dine spørgsmål når som helst' }];


const DEFAULT_REVIEWS = [
{ name: 'Maria S.', role: 'Mor til 8 måneder', text: 'Endelig én app der forstår hvad man har brug for som ny mor. Søvnloggen og tigerspring-funktionen er guld værd!', stars: 5 },
{ name: 'Camilla H.', role: 'Mor til 2 år', text: 'Jeg bruger appen hver dag. AI-eksperten har hjulpet mig mere end nogen søvnkonsulent nogensinde har.', stars: 5 },
{ name: 'Line & Thomas', role: 'Forældre til 4 mdr.', text: 'Det er rart at have en app der samler alt — kalender, søvn og viden. Anbefales varmt!', stars: 5 },
{ name: 'Sofie K.', role: 'Gravid i uge 28', text: 'Graviditetsdagbogen er SÅ fin. Jeg skrives i den ugentligt og gemmer alle mine mavebilleder.', stars: 5 },
{ name: 'Nadia B.', role: 'Mor til 6 måneder', text: 'Community-funktionen er det bedste. Det er dejligt at vide man ikke er alene om de lange nætter 💙', stars: 5 },
{ name: 'Mette L.', role: 'Mor til 1 år', text: 'Fantastisk app! Tigerspring-advarsler hjalp mig forstå min søn meget bedre i de svære uger.', stars: 5 }];


const DEFAULT_CTA = {
  headline: 'Klar til bedre nætter?',
  subtext: 'Hent LALATOTO gratis og bliv en del af fællesskabet af forældre der vælger ro, viden og omsorg.'
};

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = () => setY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return y;
}

const DEFAULT_NAV = [
{ label: 'Funktioner', type: 'scroll', target: 'features', is_cta: false },
{ label: 'Fordele', type: 'scroll', target: 'benefits', is_cta: false },
{ label: 'Anmeldelser', type: 'scroll', target: 'reviews', is_cta: false },
{ label: 'Hent appen', type: 'link', target: APP_STORE_URL, is_cta: true }];


export default function LandingPage() {
  const scrollY = useScrollY();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState(DEFAULT_NAV);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [benefits, setBenefits] = useState(DEFAULT_BENEFITS);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [cta, setCta] = useState(DEFAULT_CTA);

  useEffect(() => {
    base44.entities.NavMenuContent.list('order').then((records) => {
      if (records && records.length > 0) setNavItems(records.filter((r) => r.is_active !== false));
    }).catch(() => {});

    base44.entities.LandingHero.list().then((r) => {if (r[0]) setHero({ ...DEFAULT_HERO, ...r[0] });}).catch(() => {});

    base44.entities.LandingFeature.list('order').then((r) => {
      if (r && r.length > 0) setFeatures(r.filter((f) => f.is_active !== false));
    }).catch(() => {});

    base44.entities.LandingBenefit.list('order').then((r) => {
      if (r && r.length > 0) setBenefits(r.filter((b) => b.is_active !== false));
    }).catch(() => {});

    base44.entities.LandingReview.list('order').then((r) => {
      if (r && r.length > 0) setReviews(r.filter((rv) => rv.is_active !== false));
    }).catch(() => {});

    base44.entities.LandingCTA.list().then((r) => {if (r[0]) setCta({ ...DEFAULT_CTA, ...r[0] });}).catch(() => {});
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const featuresHeadline = features[0]?.section_headline || 'Designet til dig';
  const featuresSubline = features[0]?.section_subline || 'Alt i én app';
  const benefitsHeadline = benefits[0]?.section_headline || 'Alt det en forælder egentlig har brug for';
  const benefitsSubline = benefits[0]?.section_subline || 'Hvorfor LALATOTO?';
  const reviewsHeadline = reviews[0]?.section_headline || 'Elsket af tusinder';
  const reviewsSubline = reviews[0]?.section_subline || 'Hvad siger familierne?';

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', backgroundColor: '#FAF6F1', color: '#2B1F16', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: scrollY > 40 ? 'rgba(250,246,241,0.95)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(16px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid #EDE4DB' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64
      }}>
        <img src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4d581f250_Ikon.png" alt="LALATOTO" style={{ height: 28, objectFit: 'contain' }} />
        <div className="hidden md:flex items-center gap-8">
          {navItems.filter((i) => !i.is_cta).map((item) =>
          item.type === 'scroll' ?
          <button key={item.target} onClick={() => scrollTo(item.target)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#5B3F2B', fontWeight: 500 }}>{item.label}</button> :
          <a key={item.target} href={item.target} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.875rem', color: '#5B3F2B', fontWeight: 500, textDecoration: 'none' }}>{item.label}</a>
          )}
          {navItems.filter((i) => i.is_cta).map((item) =>
          <a key={item.target} href={item.target} target="_blank" rel="noopener noreferrer"
          style={{ backgroundColor: '#5B3F2B', color: '#FAF6F1', borderRadius: 100, padding: '10px 22px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              {item.label}
            </a>
          )}
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen((m) => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <div style={{ width: 22, height: 2, background: '#5B3F2B', marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: '#5B3F2B', marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 22, height: 2, background: '#5B3F2B', borderRadius: 2 }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen &&
      <div style={{ position: 'fixed', inset: 0, zIndex: 99, backgroundColor: '#FAF6F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          {navItems.filter((i) => !i.is_cta).map((item) =>
        item.type === 'scroll' ?
        <button key={item.target} onClick={() => scrollTo(item.target)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>{item.label}</button> :
        <a key={item.target} href={item.target} onClick={() => setMenuOpen(false)} style={{ fontSize: '1.5rem', fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16', textDecoration: 'none' }}>{item.label}</a>
        )}
          {navItems.filter((i) => i.is_cta).map((item) =>
        <a key={item.target} href={item.target} target="_blank" rel="noopener noreferrer"
        style={{ backgroundColor: '#5B3F2B', color: '#FAF6F1', borderRadius: 100, padding: '14px 36px', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', marginTop: 8 }}>
              {item.label}
            </a>
        )}
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A8478', fontSize: '0.875rem', marginTop: 16 }}>Luk ✕</button>
        </div>
      }

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100svh',
        background: 'linear-gradient(160deg, #FAF6F1 0%, #F0E6D8 60%, #E8D5C0 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,154,115,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,63,43,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(91,63,43,0.08)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5B3F2B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{hero.badge_text}</span>
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', fontWeight: 400, lineHeight: 1.05, color: '#2B1F16', marginBottom: 24, maxWidth: 700 }}>
          {hero.headline}<br />
          <span style={{ color: '#C29A73', fontStyle: 'italic' }}>{hero.headline_italic}</span><br />
          {hero.headline_suffix}
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#7A665A', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
          {hero.subtext}
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#1C1C1E', borderRadius: 16, padding: '12px 24px', cursor: 'pointer', minWidth: 180 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', lineHeight: 1 }}>Download på</div>
                <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>App Store</div>
              </div>
            </div>
          </a>
          <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#1C1C1E', borderRadius: 16, padding: '12px 24px', cursor: 'pointer', minWidth: 180 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.3.16.64.22.99.15l12.5-7.07-2.83-2.83-10.66 9.75zm-1.15-19.3C1.72 4.8 1.5 5.18 1.5 5.65v12.7c0 .47.22.85.53 1.08l.1.07 7.12-7.12v-.17L2.13 4.39l-.1.07zm16.47 8.66L15.74 11l-3.02 3.02 2.76 2.76 3.02-1.73c.86-.5.86-1.43 0-1.93zM4.17.24L16.67 7.3l-2.83 2.83L3.18.38C3.53.31 3.87.09 4.17.24z" /></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', lineHeight: 1 }}>Hent den på</div>
                <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, lineHeight: 1.3 }}>Google Play</div>
              </div>
            </div>
          </a>
        </div>

        {/* App mockup */}
        <div style={{ position: 'relative', maxWidth: 300, width: '100%' }}>
          {hero.media_url ?
          hero.media_url.match(/\.(mp4|webm|mov)$/i) ?
          <video src={hero.media_url} autoPlay muted loop playsInline style={{ width: '100%', borderRadius: 32, filter: 'drop-shadow(0 30px 60px rgba(91,63,43,0.25))' }} /> :
          <img src={hero.media_url} alt="LALATOTO app" style={{ width: '100%', filter: 'drop-shadow(0 30px 60px rgba(91,63,43,0.25))', borderRadius: 32 }} /> :

          <div style={{ width: 220, margin: '0 auto', backgroundColor: '#2B1F16', borderRadius: 40, padding: '12px 12px 24px', boxShadow: '0 40px 80px rgba(43,31,22,0.3)' }}>
              <div style={{ backgroundColor: '#FAF6F1', borderRadius: 30, overflow: 'hidden', minHeight: 380 }}>
                <div style={{ background: 'linear-gradient(135deg, #C8A882, #8A5A30)', padding: '32px 16px 20px', textAlign: 'center' }}>
                  <img src="https://www.lalatoto.dk/cdn/shop/files/LALATOTO_logotype_Brun_600x.png?v=1730971736" alt="LALATOTO" style={{ height: 20, filter: 'brightness(10)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginTop: 8 }}>God dag, mor 🤍</p>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['🌙 Søvnlog', '🐯 Tigerspring', '📅 Kalender', '💬 Community'].map((item) =>
                <div key={item} style={{ backgroundColor: '#F3E9E1', borderRadius: 12, padding: '10px 14px', fontSize: '0.8rem', fontWeight: 500, color: '#5B3F2B' }}>{item}</div>
                )}
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C29A73', marginBottom: 12 }}>{featuresSubline}</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#2B1F16', lineHeight: 1.1 }}>
            {featuresHeadline}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {features.map(({ emoji, title, description }, i) =>
          <div key={i} style={{ backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB', borderRadius: 24, padding: '32px 28px', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)';e.currentTarget.style.boxShadow = '0 16px 40px rgba(91,63,43,0.12)';}}
          onMouseLeave={(e) => {e.currentTarget.style.transform = 'none';e.currentTarget.style.boxShadow = 'none';}}>
            
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{emoji}</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: '#2B1F16', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#7A665A', lineHeight: 1.7 }}>{description}</p>
            </div>
          )}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits" style={{ backgroundColor: '#2B1F16', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C29A73', marginBottom: 12 }}>{benefitsSubline}</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#F5EFE9', lineHeight: 1.1, marginBottom: 48 }}>
            {benefitsHeadline}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'left' }}>
            {benefits.map(({ stat, label, sub }, i) =>
            <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24 }}>
                <div style={{ fontSize: '2.5rem', fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#C29A73', fontWeight: 400, marginBottom: 8 }}>{stat}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F5EFE9', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: '0.85rem', color: '#B7A79A', lineHeight: 1.5 }}>{sub}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C29A73', marginBottom: 12 }}>{reviewsSubline}</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, color: '#2B1F16', lineHeight: 1.1 }}>
            {reviewsHeadline}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {reviews.map(({ name, role, text, stars }, i) =>
          <div key={i} style={{ backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB', borderRadius: 24, padding: '28px 24px' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(stars || 5)].map((_, j) => <span key={j} style={{ color: '#C29A73', fontSize: '0.9rem' }}>★</span>)}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#5B3F2B', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{text}"</p>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2B1F16' }}>{name}</p>
                <p style={{ fontSize: '0.8rem', color: '#9A8478' }}>{role}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #C8A882 0%, #8A5A30 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 400, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
          {cta.headline}
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          {cta.subtext}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: '14px 28px', cursor: 'pointer', minWidth: 180 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1C1C1E"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#9A8478', fontSize: '0.65rem', lineHeight: 1 }}>Download på</div>
                <div style={{ color: '#1C1C1E', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>App Store</div>
              </div>
            </div>
          </a>
          <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: '14px 28px', cursor: 'pointer', minWidth: 180 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1C1C1E"><path d="M3.18 23.76c.3.16.64.22.99.15l12.5-7.07-2.83-2.83-10.66 9.75zm-1.15-19.3C1.72 4.8 1.5 5.18 1.5 5.65v12.7c0 .47.22.85.53 1.08l.1.07 7.12-7.12v-.17L2.13 4.39l-.1.07zm16.47 8.66L15.74 11l-3.02 3.02 2.76 2.76 3.02-1.73c.86-.5.86-1.43 0-1.93zM4.17.24L16.67 7.3l-2.83 2.83L3.18.38C3.53.31 3.87.09 4.17.24z" /></svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#9A8478', fontSize: '0.65rem', lineHeight: 1 }}>Hent den på</div>
                <div style={{ color: '#1C1C1E', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>Google Play</div>
              </div>
            </div>
          </a>
        </div>
      </section>

      <Footer />
    </div>);

}