import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LegalModal from '@/components/landing/LegalModal';
import IPhoneMockup from '@/components/landing/IPhoneMockup';
import FeaturesList from '@/components/landing/FeaturesList';

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#F5EDE0', overflowX: 'hidden', minHeight: '100dvh' }}>

      {/* ── NAVBAR ── */}
       <nav style={{ backgroundColor: '#F5EDE0', borderBottom: '1px solid #E2D4C0', position: 'sticky', top: 0, zIndex: 50, paddingTop: 'env(safe-area-inset-top)' }}>
         <div className="lnd-nav-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <span className="lnd-nav-title" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#2B1F16', letterSpacing: '0.04em' }}>CLUB NO SLEEP</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isAuth ?
            <button onClick={() => window.location.href = '/app'} style={btnDark}>Åbn app →</button> :
            <>
                <button className="lnd-nav-btn-text" onClick={handleLogin} style={{ background: 'none', border: 'none', color: '#5B3F2B', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>Log ind</button>
                <button onClick={handleLogin} style={btnDark}>Bliv medlem</button>
              </>
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
              Til dig, der er vågen,<br />
              når resten af verden sover.
            </h1>

            {/* Heart */}
            <div style={{ marginBottom: '1.4rem' }}>
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M9 15C9 15 1 9.5 1 4.5C1 2.5 2.5 1 4.5 1C6 1 7.5 2 9 3.5C10.5 2 12 1 13.5 1C15.5 1 17 2.5 17 4.5C17 9.5 9 15 9 15Z" fill="#C8A882" stroke="#C8A882" strokeWidth="0.5" />
              </svg>
            </div>

            <p className="lnd-hero1-p" style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.9, maxWidth: 420, margin: '0 0 0.6rem' }}>
              Der findes en hel særlig form for ensomhed i moderskabet. En ensomhed som kommer snigende om natten, når baby igen er vågen og resten af verden er stille; <strong>Natteensomhed.</strong>
            </p>
            <p className="lnd-hero1-p" style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.9, maxWidth: 420, margin: '0 0 2.8rem' }}>
              <strong>CLUB NO SLEEP</strong> er en dansk app skabt til netop disse øjeblikke. For ingen skal føle sig alene i moderskabet.
            </p>

            <div className="lnd-hero1-cta">
              <button className="lnd-hero1-btn" onClick={handleLogin} style={btnBrown}>Hent app</button>
            </div>
          </div>

          {/* Right — two iPhones with screenshots */}
           <div className="lnd-hero1-phones" style={{ flex: '0 0 auto', position: 'relative', width: 380, height: 500, flexShrink: 0 }}>
             <IPhoneMockup imageUrl="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/6ad3f328a_2025-06-08at191643-1(1).png" width={220} height={450} style={{ position: 'absolute', left: 0, top: 0, zIndex: 2 }} frameColor="#C8A882" />
             <IPhoneMockup imageUrl="https://media.base44.com/images/public/699f47a86e7e0a874d1159ed/4a23c7aba_Screenshot2025-06-08at193447.png" width={200} height={415} style={{ position: 'absolute', right: 0, top: 60, zIndex: 1 }} frameColor="#DDD0BC" />
           </div>
        </div>
      </section>

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
              Kom med i klubben
            </h2>
            <p style={{ color: '#3A2412', fontSize: '0.875rem', lineHeight: 1.82, margin: '0 0 1.2rem' }}>
              Vi har været der.<br />
              Der hvor nætterne er svære, dagene er lange og ingen helt forstår, hvad du
              står i. Hvor far sover på sofaen og mor sover siddende. Hvor frygten for
              natten allerede starter i løbet af eftermiddagen.<br />
              CLUB NO SLEEP er skabt til dig, som savner et sted at blive spejlet og finde
              andre, der er vågen sammen med dig.
            </p>
            <p style={{ color: '#3A2412', fontSize: '0.875rem', lineHeight: 1.82, margin: '0 0 1.8rem' }}>
              Kom med i klubben. For din egen skyld, og for alle de mødre som føler sig
              alene netop nu. Sammen kan vi mindske ensomhed i moderskabet.
            </p>
            <p className="lnd-klub-sig" style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.6rem', fontWeight: 400, color: '#3A2412', margin: 0, lineHeight: 1.3 }}>
              Kærligst og kram fra Sara &amp; Nicolaj
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
              Dette finder du i appen
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
              Du skal ikke stå<br />med det hele alene
            </h2>
            <p style={{ color: '#3E2810', fontSize: '0.88rem', lineHeight: 1.9, maxWidth: 300, margin: '0 0 2.4rem' }}>
              Én konto inkluderer altid en gratis bruger mere, så du kan vælge at dele alt fra søvnlog, kalender og tigerspring med din partner. Sammen bliver det ofte lettere.
            </p>
            <button className="lnd-partner-btn" onClick={handleLogin} style={{ backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Bliv medlem
            </button>
          </div>

          {/* Right — partner card + calendar */}
          <div className="lnd-partner-cards" style={{ flex: '0 0 auto', display: 'flex', gap: 18, alignItems: 'flex-start' }}>

            {/* Partner card */}
            <div className="lnd-partner-card" style={{ width: 210, backgroundColor: '#FFFDF9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 55px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>Del med partner</p>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Sara row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#D4BDA5', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80" alt="Sara" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ color: '#1E140A', fontSize: '0.62rem', fontWeight: 600, margin: 0 }}>Sara <span style={{ color: '#9A7A6A', fontWeight: 400 }}>(dig)</span></p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.56rem', color: '#fff', backgroundColor: '#C8A882', borderRadius: 5, padding: '2px 7px', fontWeight: 500 }}>Administrer</span>
                </div>
                {/* Nicolaj row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#D4BDA5', overflow: 'hidden', flexShrink: 0 }}>
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=80" alt="Nicolaj" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <p style={{ color: '#1E140A', fontSize: '0.62rem', fontWeight: 600, margin: 0 }}>Nicolaj <span style={{ color: '#9A7A6A', fontWeight: 400 }}>(partner)</span></p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.56rem', color: '#7A665A' }}>Aktiv</span>
                </div>
                {/* Divider */}
                <div style={{ borderTop: '1px solid #F0E8DF', paddingTop: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ color: '#5B3F2B', fontSize: '0.62rem', margin: 0 }}>Invitér partner</p>
                    <span style={{ color: '#C8A882', fontSize: '1.1rem', fontWeight: 300 }}>+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar card */}
            <div className="lnd-partner-card" style={{ width: 220, backgroundColor: '#FFFDF9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 55px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>Fælles kalender</p>
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
                    <p style={{ color: '#4A3525', fontSize: '0.52rem', margin: 0 }}>Osteopat kl. 10:00</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#8BA5C8', flexShrink: 0 }} />
                    <p style={{ color: '#4A3525', fontSize: '0.52rem', margin: 0 }}>Barselscafé kl. 14:00</p>
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
                Din trygge havn som ny forælder — søvn, fællesskab og viden samlet ét sted.
              </p>
            </div>
            <div>
              <p style={{ color: '#5A4030', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Juridisk</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <button onClick={() => setLegalModal('terms')} style={{ background: 'none', border: 'none', color: '#C8A882', fontSize: '0.86rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Handelsbetingelser</button>
                <button onClick={() => setLegalModal('privacy')} style={{ background: 'none', border: 'none', color: '#C8A882', fontSize: '0.86rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Privatlivspolitik</button>
              </div>
            </div>
            <div>
              <p style={{ color: '#5A4030', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Hent appen</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <a href="#" style={{ color: '#C8A882', fontSize: '0.86rem', textDecoration: 'none' }}>App Store</a>
                <a href="#" style={{ color: '#C8A882', fontSize: '0.86rem', textDecoration: 'none' }}>Google Play</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #2E1C0E', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#5A4030', fontSize: '0.76rem', margin: 0 }}>© 2025 Club No Sleep · Alle rettigheder forbeholdes</p>
          </div>
        </div>
      </footer>

      {legalModal === 'terms' && <LegalModal type="terms" title="Handelsbetingelser" onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacy' && <LegalModal type="privacy" title="Privatlivspolitik" onClose={() => setLegalModal(null)} />}

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

        /* ── "KOM MED I KLUBBEN" ── */
        .lnd-klub-inner { padding: 3rem 4rem 3rem 3.5rem !important; gap: 4.5rem !important; flex-direction: row !important; }
        .lnd-klub-img { width: 260px !important; height: 360px !important; display: block !important; }

        /* ── HERO 3 features grid ── */
        .lnd-features-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 3rem 3.5rem !important; }

        /* ── HERO 4 partner section ── */
        .lnd-partner-cards { display: flex !important; }

        @media (max-width: 900px) {
           .lnd-hero1-phones { display: none !important; }
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
           .lnd-nav-btn-text { display: none !important; }

           /* Hero 1 */
           .lnd-hero1-section { padding: 2.5rem 1.2rem 3rem !important; }
           .lnd-hero1-inner { flex-direction: column !important; gap: 1.5rem !important; align-items: flex-start !important; }
           .lnd-hero1-copy { min-width: unset !important; width: 100% !important; flex: 0 0 100% !important; }
           .lnd-hero1-phones { display: none !important; }
           .lnd-hero1-h1 { font-size: 1.85rem !important; line-height: 1.2 !important; margin-bottom: 1rem !important; }
           .lnd-hero1-p { font-size: 0.82rem !important; line-height: 1.7 !important; max-width: 100% !important; }
           .lnd-hero1-cta { width: 100% !important; text-align: left !important; }
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