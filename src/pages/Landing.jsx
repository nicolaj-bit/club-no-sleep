import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { base44 } from '@/api/base44Client';
import { openExternalUrl } from '@/lib/openExternalUrl';
import LegalModal from '@/components/landing/LegalModal';
import IPhoneMockup from '@/components/landing/IPhoneMockup';
import FeaturesList from '@/components/landing/FeaturesList';
import { useLanguage } from '@/components/ui/LanguageContext';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/00wdR9eRue256hG11J3cc00';

export default function Landing() {
  const isNativeApp = (() => {
    try { return Capacitor.isNativePlatform(); } catch { return false; }
  })();

  const { t } = useLanguage();
  const [isAuth, setIsAuth] = useState(false);
  const [phoneUrls, setPhoneUrls] = useState({ a: '', b: '' });
  const [hero1Image, setHero1Image] = useState('');
  const [landingHero, setLandingHero] = useState(null);

  const handleBecomeMember = () => {
    if (window.self !== window.top) {
      alert(t.landingPreviewPaymentAlert);
      return;
    }
    openExternalUrl(STRIPE_CHECKOUT_URL);
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});

    // Load phone image URLs from config
    const loadPhoneUrls = async () => {
      try {
        const configs = await base44.entities.AppConfig.list();
        const landingConfig = Array.isArray(configs) && configs.find((c) => c.key === 'landing_phones');
        if (landingConfig) {
          setPhoneUrls({
            a: landingConfig.phone_a_url || 'https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/6ad3f328a_2025-06-08at191643-1(1).png',
            b: landingConfig.phone_b_url || 'https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4a23c7aba_Screenshot2025-06-08at193447.png'
          });
        }

        const hero1Config = Array.isArray(configs) && configs.find((c) => c.key === 'landing_hero1_image');
        if (hero1Config?.hero1_image_url) {
          setHero1Image(hero1Config.hero1_image_url);
        }

        const heroes = await base44.entities.LandingHero.list();
        if (Array.isArray(heroes) && heroes.length > 0) {
          setLandingHero(heroes[0]);
        }
      } catch (e) {
        setPhoneUrls({
          a: 'https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/6ad3f328a_2025-06-08at191643-1(1).png',
          b: 'https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4a23c7aba_Screenshot2025-06-08at193447.png'
        });
      }
    };
    loadPhoneUrls();
  }, []);

  const handleLogin = async () => {
    const { showInAppLogin } = await import('@/lib/showInAppLogin');
    showInAppLogin('/app');
  };

  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  const downloadUrl = isAndroid
    ? 'https://play.google.com/store/apps/details?id=com.base699f47a86e7e0a874d1159ed.app'
    : 'https://apps.apple.com/dk/app/id6764388095';

  const scrollToMembership = () => {
    document.getElementById('medlemskab')?.scrollIntoView({ behavior: 'smooth' });
  };

  const storeBtnStyle = {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none', borderRadius: 10,
    padding: '10px 12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', minHeight: 48
  };

  const appStoreBtn = (
    <a key="appstore" href="https://apps.apple.com/dk/app/id6764388095" target="_blank" rel="noopener noreferrer" style={storeBtnStyle}>
      <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-44.3-64.7-82.6-170.4-82.6-271.1 0-169.6 110.7-259.3 219.7-259.3 75.4 0 138.4 45.5 186 45.5 45.5 0 116.9-48.1 200.9-48.1 32.5 0 116.3 3.2 171.8 73.9zm-215.6-104.3c31.2-37 52.3-88.7 52.3-140.3 0-7.1-.6-14.3-1.9-20.1-49.4 1.9-108.2 33.1-143.7 75.4-27.6 31.9-53.5 83.6-53.5 136.2 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.3 0 98.5-29.9 131.3-70.4z" />
      </svg>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: '0.6rem', opacity: 0.7, lineHeight: 1 }}>{t.landingDownloadNow}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2 }}>{t.landingAppStoreLabel}</div>
      </div>
    </a>
  );

  const googlePlayBtn = (
    <a key="googleplay" href="https://play.google.com/store/apps/details?id=com.base699f47a86e7e0a874d1159ed.app" target="_blank" rel="noopener noreferrer" style={storeBtnStyle}>
      <svg width="18" height="18" viewBox="0 0 512 512">
        <path d="M48 64.4v383.2c0 13.8 7.2 26.4 18.8 33.4l244.4-225L66.8 31C55.2 38 48 50.6 48 64.4z" fill="#4285F4"/>
        <path d="M385.4 174.2l-60.1 60.1 60.1 60.1 62.5-36c19.8-11.5 19.8-40.5 0-52l-62.5-36.2z" fill="#34A853"/>
        <path d="M66.8 481c5.8 3.5 12.6 5.5 19.8 5.5 4.7 0 9.4-.9 13.8-2.6l287.6-112c19.8-7.7 19.8-34.1 0-41.8L100.4 293.5c-4.4-1.7-9.1-2.6-13.8-2.6-7.2 0-14 2-19.8 5.5L66.8 481z" fill="#FBBC04"/>
        <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z" fill="#EA4335"/>
      </svg>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: '0.6rem', opacity: 0.7, lineHeight: 1 }}>{t.landingDownloadNow}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2 }}>{t.landingGooglePlayLabel}</div>
      </div>
    </a>
  );

  // Apple-regler: Landingssiden og dens download-paywall vises aldrig i native app.
  if (isNativeApp) return null;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#F5EDE0', overflowX: 'hidden', minHeight: '100dvh' }}>

      {/* ── NAVBAR ── */}
       <nav style={{ backgroundColor: '#F5EDE0', borderBottom: '1px solid #E2D4C0', position: 'sticky', top: 0, zIndex: 50, paddingTop: 'env(safe-area-inset-top)' }}>
         <div className="lnd-nav-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <span className="lnd-nav-title" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#2B1F16', letterSpacing: '0.04em' }}>CLUB NO SLEEP</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuth ?
            <button onClick={() => window.location.href = '/app'} style={btnOutline}>{t.landingOpenApp}</button> :
            <button onClick={scrollToMembership} style={btnDark}>{t.landingBecomeMember}</button>
            }
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
              HERO 1 — "Til dig, der er vågen"
           ════════════════════════════════ */}
      <section className="lnd-hero1-section" style={{ backgroundColor: '#F5EDE0', padding: '6rem 2.5rem 5rem' }}>
        <div className="lnd-hero1-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap' }}>

          {/* Left copy */}
          <div className="lnd-hero1-copy" style={{ flex: '1 1 340px', minWidth: 260 }}>
            <h1 className="lnd-hero1-h1" style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#1E140A',
              margin: '0 0 1.6rem'
            }}>
              {t.landingHero1Title1}<br />
              {t.landingHero1Title2}
            </h1>

            {/* Divider with heart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.4rem' }}>
              <span style={{ height: 1, width: 50, backgroundColor: '#D4B89A' }} />
              <svg width="14" height="12" viewBox="0 0 18 16" fill="none">
                <path d="M9 15C9 15 1 9.5 1 4.5C1 2.5 2.5 1 4.5 1C6 1 7.5 2 9 3.5C10.5 2 12 1 13.5 1C15.5 1 17 2.5 17 4.5C17 9.5 9 15 9 15Z" fill="#C8A882" stroke="#C8A882" strokeWidth="0.5" />
              </svg>
              <span style={{ height: 1, width: 50, backgroundColor: '#D4B89A' }} />
            </div>

            <p className="lnd-hero1-p" style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.9, maxWidth: 420, margin: '0 0 0.6rem' }}>
              {t.landingHero1P1} <strong>{t.landingHero1P1Bold}</strong>
            </p>
            <p className="lnd-hero1-p" style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.9, maxWidth: 420, margin: '0 0 2.8rem' }}>
              <strong>{t.landingHero1P2Bold}</strong> {t.landingHero1P2}
            </p>

            <div className="lnd-hero1-cta" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {isAndroid ? [googlePlayBtn, appStoreBtn] : [appStoreBtn, googlePlayBtn]}
              </div>
              <button onClick={scrollToMembership} style={{ background: 'none', border: 'none', color: '#7A665A', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', padding: '6px 0', textDecoration: 'underline', textUnderlineOffset: '3px', textDecorationColor: '#D4B89A' }}>
                {t.landingBecomeMember} →
              </button>
              {(landingHero?.badge_text || t.landingHeroBadge)?.trim() ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    backgroundColor: '#C8A882',
                    color: '#2B1A0F',
                    borderRadius: 999,
                    padding: '7px 18px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    display: 'inline-block'
                  }}>
                    {landingHero?.badge_text || t.landingHeroBadge}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Desktop phone mockup */}
          {phoneUrls.a && (
            <div className="lnd-hero1-phone-desktop" style={{ flexShrink: 0, width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={phoneUrls.a} alt="Club No Sleep app" style={{ width: '100%', maxWidth: 280, height: 'auto', borderRadius: 28, boxShadow: '0 25px 70px -15px rgba(58,36,22,0.35)' }} />
            </div>
          )}

          {/* Mobile hero image — kun synlig på mobil, vælges via AdminLanding */}
          {hero1Image && (
            <div className="lnd-hero1-mobile-img" style={{ width: '100%', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 50px -12px rgba(58,36,22,0.25)', marginTop: '0.5rem' }}>
              <img src={hero1Image} alt="Club No Sleep" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════
              MEDLEMSKAB — Paywall (sidens klimaks)
              MÅ KUN vises på web-landingssiden — aldrig i native app.
           ════════════════════════════════ */}
      <section id="medlemskab" style={{ backgroundColor: '#EDE0D0', padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          <div style={{
            backgroundColor: '#FFFDF9',
            borderRadius: 28,
            padding: '3rem 2.4rem 2.4rem',
            boxShadow: '0 20px 60px -20px rgba(58,36,22,0.15)',
            border: '1px solid rgba(200,168,130,0.2)',
            textAlign: 'center'
          }}>
            {/* Heading */}
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 400, color: '#1E140A', margin: '0 0 0.6rem', lineHeight: 1.2 }}>
              {t.landingPaywallTitle}
            </h2>
            {/* Subtitle */}
            <p style={{ color: '#7A665A', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 2rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              {t.landingPaywallSubtitle}
            </p>
            {/* Trial pill — lys guld, mørk tekst, centreret over prisen */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.1rem' }}>
              <span style={{
                backgroundColor: '#C8A882',
                color: '#2B1A0F',
                borderRadius: 999,
                padding: '7px 18px',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                display: 'inline-block'
              }}>
                {t.landingTryFreePill}
              </span>
            </div>

            {/* Price — 7 dage gratis stort, derefter-pris almindelig */}
            <div style={{ marginBottom: '0.9rem' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.6rem', fontWeight: 500, color: '#3A2416', lineHeight: 1.1, margin: 0 }}>
                {t.landingTrialBig}
              </p>
              <p style={{ color: '#7A665A', fontSize: '0.95rem', margin: '0.4rem 0 0' }}>
                {t.landingThenPrice}
              </p>
            </div>

            {/* Auto-renew — stores' krav ved nævnelse af prøveperiode */}
            <p style={{ color: '#9A7A6A', fontSize: '0.7rem', lineHeight: 1.55, margin: '0 0 2.2rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              {t.landingAutoRenewTerms}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #EDE4DB, transparent)', margin: '0 0 1.8rem' }} />

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.2rem', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              {[t.landingPaywallFeature1, t.landingPaywallFeature2, t.landingPaywallFeature3, t.landingPaywallFeature4, t.landingPaywallFeature5].map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#3A2412', fontSize: '0.86rem', lineHeight: 1.5 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #C8A882, #B08D72)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA — download, ikke betaling */}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" style={{
              display: 'block',
              width: '100%',
              background: 'linear-gradient(135deg, #C8A882 0%, #B08D72 100%)',
              color: '#2B1A0F',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              textDecoration: 'none',
              boxShadow: '0 8px 20px -6px rgba(200,168,130,0.5)',
              textAlign: 'center'
            }}>
              {t.landingPaywallCta}
            </a>
          </div>

          {/* Legal links */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: '1.6rem' }}>
            <a href="/Terms" style={{ color: '#9A7A6A', fontSize: '0.78rem', textDecoration: 'none' }}>{t.landingTerms}</a>
            <span style={{ color: '#D4B89A' }}>·</span>
            <a href="/Privacy" style={{ color: '#9A7A6A', fontSize: '0.78rem', textDecoration: 'none' }}>{t.landingPrivacy}</a>
          </div>
        </div>
      </section>

      {/* Gamle paywall-sektion fjernet — ny paywall findes længere nede som #medlemskab */}

      {/* ════════════════════════════════
              "Kom med i klubben"
           ════════════════════════════════ */}
      <section style={{ backgroundColor: '#D9C9AE', position: 'relative', overflow: 'hidden' }}>
        {/* Big decorative circle — bottom right, partially clipped */}
        <div style={{
          position: 'absolute', right: -110, bottom: -110,
          width: 380, height: 380, borderRadius: '50%',
          backgroundColor: 'rgba(190,155,105,0.28)', pointerEvents: 'none', zIndex: 0
        }} />

        <div className="lnd-klub-inner" style={{ display: 'flex', alignItems: 'center', padding: '3rem 4rem 3rem 3.5rem', gap: '4.5rem', position: 'relative', zIndex: 1 }}>

          {/* LEFT — photo */}
          <div className="lnd-klub-img" style={{ flexShrink: 0, width: 260, height: 360, borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
            <img src="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/eca32e989_Skrmbillede2026-06-08161849.png"
            alt="Kvinde med Club No Sleep taske og barnevogn"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          </div>

          {/* RIGHT — copy */}
          <div style={{ flex: 1, maxWidth: 520 }}>
            <h2 className="lnd-klub-h2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.55rem', fontWeight: 400, color: '#1E140A', lineHeight: 1.15, margin: '0 0 1.3rem' }}>
              {t.landingKlubTitle}
            </h2>
            <p style={{ color: '#3A2412', fontSize: '0.875rem', lineHeight: 1.82, margin: '0 0 1.2rem' }}>
              {t.landingKlubP1}<br />
              {t.landingKlubP1b}<br />
              {t.landingKlubP1c}
            </p>
            <p style={{ color: '#3A2412', fontSize: '0.875rem', lineHeight: 1.82, margin: '0 0 1.8rem' }}>
              {t.landingKlubP2}
            </p>
            <p className="lnd-klub-sig" style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.6rem', fontWeight: 400, color: '#3A2412', margin: 0, lineHeight: 1.3 }}>
              {t.landingKlubSig}
            </p>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════
              HERO 3 — "Dette finder du i appen"
           ════════════════════════════════ */}
      <section className="lnd-features-section" style={{ backgroundColor: '#FFFDF9', padding: '5.5rem 3rem 6.5rem' }}>
        <div style={{ maxWidth: 1020, margin: '0 auto' }}>

          {/* Headline + heart */}
          <div style={{ textAlign: 'center', marginBottom: '3.8rem' }}>
            <h2 className="lnd-features-h2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.1rem, 3.8vw, 2.9rem)', fontWeight: 400, color: '#1E140A', margin: '0 0 0.9rem' }}>
              {t.landingFeaturesTitle}
            </h2>
            <svg width="20" height="18" viewBox="0 0 20 18" fill="none" style={{ display: 'inline-block' }}>
              <path d="M10 17C10 17 1 10.5 1 5C1 2.8 2.8 1 5 1C6.8 1 8.5 2.2 10 4C11.5 2.2 13.2 1 15 1C17.2 1 19 2.8 19 5C19 10.5 10 17 10 17Z" fill="#D4B89A" stroke="#D4B89A" strokeWidth="0.5" />
            </svg>
          </div>

          <FeaturesList />

        </div>
      </section>

      {/* ════════════════════════════════
              HERO 4 — "Du skal ikke stå med det hele alene"
           ════════════════════════════════ */}
      <section className="lnd-partner-section" style={{ backgroundColor: '#D9C4A0', padding: '5rem 2.5rem' }}>
        <div className="lnd-partner-inner" style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>

          {/* Left copy */}
          <div className="lnd-partner-copy" style={{ flex: '1 1 280px', maxWidth: 360 }}>
            <h2 className="lnd-partner-h2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.1rem, 3.5vw, 3rem)', fontWeight: 400, color: '#1E140A', lineHeight: 1.18, margin: '0 0 1.3rem' }}>
              {t.landingPartnerTitle1}<br />{t.landingPartnerTitle2}
            </h2>
            <p style={{ color: '#3E2810', fontSize: '0.88rem', lineHeight: 1.9, maxWidth: 300, margin: '0 0 2.4rem' }}>
              {t.landingPartnerP}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="https://apps.apple.com/dk/app/id6764388095" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 814 1000" fill="currentColor">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-44.3-64.7-82.6-170.4-82.6-271.1 0-169.6 110.7-259.3 219.7-259.3 75.4 0 138.4 45.5 186 45.5 45.5 0 116.9-48.1 200.9-48.1 32.5 0 116.3 3.2 171.8 73.9zm-215.6-104.3c31.2-37 52.3-88.7 52.3-140.3 0-7.1-.6-14.3-1.9-20.1-49.4 1.9-108.2 33.1-143.7 75.4-27.6 31.9-53.5 83.6-53.5 136.2 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.3 0 98.5-29.9 131.3-70.4z" />
                  </svg>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{t.landingAppStoreLabel}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t.landingDownloadNow}</div>
                  </div>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.base699f47a86e7e0a874d1159ed.app" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                  <svg width="22" height="22" viewBox="0 0 512 512">
                    <path d="M48 64.4v383.2c0 13.8 7.2 26.4 18.8 33.4l244.4-225L66.8 31C55.2 38 48 50.6 48 64.4z" fill="#4285F4"/>
                    <path d="M385.4 174.2l-60.1 60.1 60.1 60.1 62.5-36c19.8-11.5 19.8-40.5 0-52l-62.5-36.2z" fill="#34A853"/>
                    <path d="M66.8 481c5.8 3.5 12.6 5.5 19.8 5.5 4.7 0 9.4-.9 13.8-2.6l287.6-112c19.8-7.7 19.8-34.1 0-41.8L100.4 293.5c-4.4-1.7-9.1-2.6-13.8-2.6-7.2 0-14 2-19.8 5.5L66.8 481z" fill="#FBBC04"/>
                    <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z" fill="#EA4335"/>
                  </svg>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{t.landingGooglePlayLabel}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t.landingDownloadNow}</div>
                  </div>
                </a>
              </div>
              <button className="lnd-partner-btn" onClick={scrollToMembership} style={{ backgroundColor: 'transparent', color: '#3E2810', border: '1.5px solid #3E2810', borderRadius: 10, padding: '12px 32px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                {t.landingBecomeMember} →
              </button>
            </div>
          </div>

          {/* Right — partner card + calendar */}
          <div className="lnd-partner-cards" style={{ flex: '0 0 auto', display: 'flex', gap: 18, alignItems: 'flex-start' }}>

            {/* Partner card */}
            <div className="lnd-partner-card" style={{ width: 210, backgroundColor: '#FFFDF9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 55px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>{t.landingSharePartner}</p>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Sara row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#D4BDA5', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80" alt="Sara" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ color: '#1E140A', fontSize: '0.62rem', fontWeight: 600, margin: 0 }}>Sara <span style={{ color: '#9A7A6A', fontWeight: 400 }}>{t.landingYou}</span></p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.56rem', color: '#fff', backgroundColor: '#C8A882', borderRadius: 5, padding: '2px 7px', fontWeight: 500 }}>{t.landingManage}</span>
                </div>
                {/* Nicolaj row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#D4BDA5', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=80" alt="Nicolaj" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ color: '#1E140A', fontSize: '0.62rem', fontWeight: 600, margin: 0 }}>Nicolaj <span style={{ color: '#9A7A6A', fontWeight: 400 }}>{t.landingPartner}</span></p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.56rem', color: '#7A665A' }}>{t.landingActive}</span>
                </div>
                {/* Divider */}
                <div style={{ borderTop: '1px solid #F0E8DF', paddingTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: '#5B3F2B', fontSize: '0.62rem', margin: 0 }}>{t.landingInvitePartner}</p>
                    <span style={{ color: '#C8A882', fontSize: '1.1rem', fontWeight: 300 }}>+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar card */}
            <div className="lnd-partner-card" style={{ width: 220, backgroundColor: '#FFFDF9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 55px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>{t.landingSharedCalendar}</p>
                <span style={{ color: '#C8A882', fontSize: '0.8rem' }}>›</span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <p style={{ color: '#9A7A6A', fontSize: '0.6rem', margin: '0 0 8px', fontWeight: 500 }}>April 2025</p>
                {/* Calendar grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 10 }}>
                  {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) =>
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.38rem', color: '#9A7A6A', fontWeight: 700, paddingBottom: 2 }}>{d}</div>
                  )}
                  {/* Blanks for Tuesday start */}
                  <div />
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((d) =>
                  <div key={d} style={{
                    textAlign: 'center', fontSize: '0.38rem',
                    borderRadius: '50%', width: 14, height: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                    backgroundColor: d === 4 ? 'transparent' : d === 9 ? '#C8A882' : d === 27 ? '#3A2416' : 'transparent',
                    border: d === 4 ? '1.5px solid #C8A882' : 'none',
                    color: d === 9 || d === 27 ? '#fff' : '#4A3525',
                    fontWeight: [4, 9, 27].includes(d) ? 700 : 400
                  }}>{d}</div>
                  )}
                </div>
                {/* Events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C8A882', flexShrink: 0 }} />
                    <p style={{ color: '#4A3525', fontSize: '0.52rem', margin: 0 }}>{t.landingOsteopathEvent}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8BA5C8', flexShrink: 0 }} />
                    <p style={{ color: '#4A3525', fontSize: '0.52rem', margin: 0 }}>{t.landingCafeEvent}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
       <footer className="lnd-footer" style={{ backgroundColor: '#1E140A', padding: '3.5rem 2.5rem 2rem', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 600, color: '#F5EFE9', letterSpacing: '0.04em', margin: '0 0 10px' }}>CLUB NO SLEEP</p>
              <p style={{ color: '#7A5A44', fontSize: '0.8rem', lineHeight: 1.7, maxWidth: 200, margin: 0 }}>
                {t.landingFooterTagline}
              </p>
            </div>
            <div>
              <p style={{ color: '#5A4030', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>{t.landingLegal}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="/Terms" style={{ color: '#C8A882', fontSize: '0.86rem', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'none' }}>{t.landingTerms}</a>
                <a href="/Privacy" style={{ color: '#C8A882', fontSize: '0.86rem', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'none' }}>{t.landingPrivacy}</a>
              </div>
            </div>
            <div>
              <p style={{ color: '#5A4030', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>{t.landingGetTheApp}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="https://apps.apple.com/dk/app/id6764388095" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3A2416', color: '#F5EFE9', borderRadius: 8, padding: '9px 12px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.2c-44.3-64.7-82.6-170.4-82.6-271.1 0-169.6 110.7-259.3 219.7-259.3 75.4 0 138.4 45.5 186 45.5 45.5 0 116.9-48.1 200.9-48.1 32.5 0 116.3 3.2 171.8 73.9zm-215.6-104.3c31.2-37 52.3-88.7 52.3-140.3 0-7.1-.6-14.3-1.9-20.1-49.4 1.9-108.2 33.1-143.7 75.4-27.6 31.9-53.5 83.6-53.5 136.2 0 7.7 1.3 15.5 1.9 17.9 3.2.6 8.4 1.3 13.6 1.3 44.3 0 98.5-29.9 131.3-70.4z" />
                  </svg>
                  App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.base699f47a86e7e0a874d1159ed.app" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3A2416', color: '#F5EFE9', borderRadius: 8, padding: '9px 12px', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600 }}>
                  <svg width="16" height="16" viewBox="0 0 512 512">
                    <path d="M48 64.4v383.2c0 13.8 7.2 26.4 18.8 33.4l244.4-225L66.8 31C55.2 38 48 50.6 48 64.4z" fill="#4285F4"/>
                    <path d="M385.4 174.2l-60.1 60.1 60.1 60.1 62.5-36c19.8-11.5 19.8-40.5 0-52l-62.5-36.2z" fill="#34A853"/>
                    <path d="M66.8 481c5.8 3.5 12.6 5.5 19.8 5.5 4.7 0 9.4-.9 13.8-2.6l287.6-112c19.8-7.7 19.8-34.1 0-41.8L100.4 293.5c-4.4-1.7-9.1-2.6-13.8-2.6-7.2 0-14 2-19.8 5.5L66.8 481z" fill="#FBBC04"/>
                    <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z" fill="#EA4335"/>
                  </svg>
                  Google Play
                </a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2E1C0E', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#5A4030', fontSize: '0.76rem', margin: 0 }}>{t.landingCopyright}</p>
          </div>
        </div>
      </footer>



      {/* Responsive */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Dancing+Script:wght@400;500&display=swap');

        /* ── NAVBAR ── */
        .lnd-nav-inner { padding: 0 2.5rem !important; }

        /* ── HERO 1 ── */
        .lnd-hero1-section { padding: 6rem 2.5rem 5rem !important; }
        .lnd-hero1-inner { gap: 80px !important; }
        .lnd-hero1-phones { width: 380px !important; height: 500px !important; }
        .lnd-phone-a { width: 220px !important; height: 450px !important; }
        .lnd-phone-b { width: 200px !important; height: 415px !important; }
        .lnd-hero1-mobile-img { display: none !important; }
        .lnd-hero1-phone-desktop { display: flex !important; }

        /* ── "KOM MED I KLUBBEN" ── */
        .lnd-klub-inner { padding: 3rem 4rem 3rem 3.5rem !important; gap: 4.5rem !important; flex-direction: row !important; }
        .lnd-klub-img { width: 260px !important; height: 360px !important; display: block !important; }

        /* ── HERO 3 features grid ── */
        .lnd-features-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 3rem 3.5rem !important; }

        /* ── HERO 4 partner section ── */
        .lnd-partner-cards { display: flex !important; }

        @media (max-width: 900px) {
           .lnd-hero1-phones { display: none !important; }
           .lnd-hero1-mobile-img { display: block !important; }
           .lnd-hero1-phone-desktop { display: none !important; }
           .lnd-hero1-section { padding: 4rem 1.5rem 4rem !important; }
           .lnd-hero1-inner { align-items: flex-start !important; }
           .lnd-hero1-copy { flex: 0 0 100% !important; }
           .lnd-features-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 2rem 2rem !important; }
           .lnd-klub-inner { flex-direction: column !important; padding: 2.5rem 1.5rem !important; gap: 2rem !important; align-items: flex-start !important; }
           .lnd-klub-img { width: 100% !important; height: 280px !important; }
           .lnd-partner-inner { flex-direction: column !important; align-items: flex-start !important; }
           .lnd-partner-copy { max-width: 100% !important; flex: 0 0 100% !important; }
           .lnd-partner-cards { flex-direction: row !important; flex-wrap: wrap !important; width: 100% !important; }
        }

        @media (max-width: 600px) {
           /* Navbar */
           .lnd-nav-inner { padding: 0 1.2rem !important; height: 56px !important; }
           .lnd-nav-title { font-size: 0.95rem !important; }
           .lnd-nav-btn-text { font-size: 0.8rem !important; }

           /* Hero 1 */
           .lnd-hero1-section { padding: 2.5rem 1.2rem 3rem !important; }
           .lnd-hero1-inner { flex-direction: column !important; gap: 1.5rem !important; align-items: flex-start !important; }
           .lnd-hero1-copy { min-width: unset !important; width: 100% !important; flex: 0 0 100% !important; }
           .lnd-hero1-phones { display: none !important; }
           .lnd-hero1-h1 { font-size: 1.85rem !important; line-height: 1.2 !important; margin-bottom: 1rem !important; }
           .lnd-hero1-p { font-size: 0.82rem !important; line-height: 1.7 !important; max-width: 100% !important; }
           .lnd-hero1-cta { width: 100% !important; text-align: left !important; flex-direction: column !important; }
           .lnd-hero1-cta > div:first-child { flex-direction: row !important; }
           .lnd-hero1-cta a { flex: 1 1 0 !important; width: auto !important; }
           .lnd-hero1-btn { width: 100% !important; padding: 14px !important; font-size: 0.95rem !important; border-radius: 12px !important; }

          /* Klub */
          .lnd-klub-inner { flex-direction: column !important; padding: 1.8rem 1.2rem !important; gap: 1.2rem !important; align-items: flex-start !important; }
          .lnd-klub-img { width: 100% !important; height: 220px !important; border-radius: 12px !important; }
          .lnd-klub-h2 { font-size: 1.75rem !important; line-height: 1.2 !important; }
          .lnd-klub-sig { font-size: 1.15rem !important; }

          /* Features */
          .lnd-features-section { padding: 2.8rem 1.2rem 3.2rem !important; }
          .lnd-features-h2 { font-size: 1.75rem !important; line-height: 1.2 !important; }
          .lnd-features-grid { grid-template-columns: 1fr !important; gap: 1.4rem !important; }
          .lnd-feature-circle { width: 52px !important; height: 52px !important; flex-shrink: 0 !important; }
          .lnd-feature-circle svg { width: 24px !important; height: 24px !important; }

          /* Partner section */
           .lnd-partner-section { padding: 2.5rem 1.2rem !important; }
           .lnd-partner-inner { flex-direction: column !important; gap: 1.6rem !important; align-items: flex-start !important; }
           .lnd-partner-copy { max-width: 100% !important; flex: 0 0 100% !important; }
           .lnd-partner-copy p { max-width: 100% !important; }
           .lnd-partner-h2 { font-size: 1.75rem !important; line-height: 1.2 !important; }
           .lnd-partner-btn { width: 100% !important; padding: 14px !important; border-radius: 12px !important; font-size: 0.95rem !important; }
           .lnd-partner-cards { flex-direction: column !important; gap: 10px !important; width: 100% !important; flex: 0 0 100% !important; }
           .lnd-partner-card { width: 100% !important; }

          /* Footer */
          .lnd-footer { padding: 2rem 1.2rem !important; }
          }
      `}</style>
    </div>);

}

/* ── Style helpers ── */
const btnDark = {
  backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none',
  borderRadius: 8, padding: '9px 20px', fontSize: '0.87rem',
  fontWeight: 600, cursor: 'pointer'
};
const btnBrown = {
  backgroundColor: '#7A5535', color: '#fff', border: 'none',
  borderRadius: 10, padding: '14px 34px', fontSize: '0.92rem',
  fontWeight: 600, cursor: 'pointer'
};
const btnOutline = {
  backgroundColor: 'transparent', color: '#3A2416', border: '1.5px solid #3A2416',
  borderRadius: 8, padding: '8px 18px', fontSize: '0.87rem',
  fontWeight: 600, cursor: 'pointer'
};
const tiny = (color) => ({ color, fontSize: '0.34rem', margin: 0 });

function PhoneNotch({ color }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 56, height: 16, backgroundColor: color,
      borderRadius: '0 0 12px 12px', zIndex: 10
    }} />);

}

function MiniNav({ active }) {
  const items = [['🏠', 'Hjem'], ['📋', 'Dagbog'], ['➕', ''], ['👥', 'Fællesskab'], ['👤', 'Profil']];
  return (
    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-around', padding: '6px 0 4px', borderTop: '1px solid #EDE4DB', backgroundColor: '#FFFDF9' }}>
      {items.map(([ic, lb], i) =>
      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: i === 2 ? '0.95rem' : '0.62rem' }}>{ic}</span>
          {lb && <span style={{ fontSize: '0.25rem', color: i === active ? '#C8A882' : '#9A7A6A' }}>{lb}</span>}
        </div>
      )}
    </div>);

}