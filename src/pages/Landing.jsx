import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import LegalModal from '@/components/landing/LegalModal';

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: '#F5EDE0', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ backgroundColor: '#F5EDE0', borderBottom: '1px solid #E2D4C0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#2B1F16', letterSpacing: '0.04em' }}>CLUB NO SLEEP</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isAuth ? (
              <button onClick={() => window.location.href = '/app'} style={btnDark}>Åbn app →</button>
            ) : (
              <>
                <button onClick={handleLogin} style={{ background: 'none', border: 'none', color: '#5B3F2B', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>Log ind</button>
                <button onClick={handleLogin} style={btnDark}>Bliv medlem</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          HERO 1 — "Til dig, der er vågen"
      ════════════════════════════════ */}
      <section style={{ backgroundColor: '#F5EDE0', padding: '6rem 2.5rem 5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap' }}>

          {/* Left copy */}
          <div style={{ flex: '1 1 340px', minWidth: 260 }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              color: '#1E140A',
              margin: '0 0 1.6rem',
            }}>
              Til dig, der er vågen,<br />
              når resten af verden sover.
            </h1>

            {/* Heart */}
            <div style={{ marginBottom: '1.4rem' }}>
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M9 15C9 15 1 9.5 1 4.5C1 2.5 2.5 1 4.5 1C6 1 7.5 2 9 3.5C10.5 2 12 1 13.5 1C15.5 1 17 2.5 17 4.5C17 9.5 9 15 9 15Z" fill="#C8A882" stroke="#C8A882" strokeWidth="0.5"/>
              </svg>
            </div>

            <p style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.9, maxWidth: 420, margin: '0 0 0.6rem' }}>
              Der findes en hel særlig form for ensomhed i moderskabet. En ensomhed som kommer snigende om natten, når baby igen er vågen og resten af verden er stille; <strong>Natteensomhed.</strong>
            </p>
            <p style={{ color: '#4A3525', fontSize: '0.93rem', lineHeight: 1.9, maxWidth: 420, margin: '0 0 2.8rem' }}>
              <strong>CLUB NO SLEEP</strong> er en dansk app skabt til netop disse øjeblikke. For ingen skal føle sig alene i moderskabet.
            </p>

            <button onClick={handleLogin} style={btnBrown}>Hent app</button>
          </div>

          {/* Right — two phones */}
          <div style={{ flex: '0 0 auto', position: 'relative', width: 340, height: 460, flexShrink: 0 }}>

            {/* Phone A — Home (front-left, larger) */}
            <div style={{
              position: 'absolute', left: 0, top: 0,
              width: 200, height: 418,
              borderRadius: 32, overflow: 'hidden',
              boxShadow: '0 28px 72px rgba(0,0,0,0.24)',
              border: '2px solid rgba(255,255,255,0.6)',
              background: 'linear-gradient(145deg, #D4B896 0%, #C4A07A 100%)',
              zIndex: 2,
            }}>
              {/* Phone shell top */}
              <div style={{ height: 28, backgroundColor: '#C8A07A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                {/* Dynamic island */}
                <div style={{ width: 72, height: 14, backgroundColor: '#1A0E06', borderRadius: 20 }} />
              </div>
              {/* Screen content */}
              <div style={{ backgroundColor: '#FBF6EF', flex: 1, height: 'calc(100% - 28px - 20px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Status line */}
                <div style={{ padding: '10px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#9A7A6A', fontSize: '0.5rem', margin: 0 }}>Mandag, 17. april</p>
                    <p style={{ color: '#1E140A', fontSize: '0.78rem', fontWeight: 700, margin: '2px 0 0' }}>Godmorgen, Sara</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8.5C5 8.5 1 5.5 1 3C1 1.9 1.9 1 3 1C3.8 1 4.5 1.5 5 2.1C5.5 1.5 6.2 1 7 1C8.1 1 9 1.9 9 3C9 5.5 5 8.5 5 8.5Z" fill="#C8A882"/></svg>
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><rect x="0" y="4" width="2" height="4" rx="1" fill="#1E140A"/><rect x="3" y="2.5" width="2" height="5.5" rx="1" fill="#1E140A"/><rect x="6" y="1" width="2" height="7" rx="1" fill="#1E140A"/><rect x="9" y="0" width="2" height="8" rx="1" fill="#1E140A"/></svg>
                  </div>
                </div>

                {/* Pregnancy card */}
                <div style={{ margin: '4px 10px', backgroundColor: '#EBD9C6', borderRadius: 14, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#7A5A44', fontSize: '0.44rem', margin: 0 }}>I dag er du</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                      <p style={{ color: '#1E140A', fontSize: '1.6rem', fontWeight: 700, margin: 0, lineHeight: 1 }}>7</p>
                      <p style={{ color: '#1E140A', fontSize: '0.5rem', fontWeight: 600, margin: 0 }}>uger</p>
                    </div>
                    <p style={{ color: '#9A7A6A', fontSize: '0.42rem', margin: '2px 0 0' }}>og 3 dage med</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3.5" stroke="#9A7A6A" strokeWidth="0.8"/><path d="M4 2.5V4.5L5 5.5" stroke="#9A7A6A" strokeWidth="0.8" strokeLinecap="round"/></svg>
                      <p style={{ color: '#9A7A6A', fontSize: '0.38rem', margin: 0 }}>Dato: 17/6 ikke tilgge</p>
                    </div>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', backgroundColor: '#D4BDA5', flexShrink: 0 }}>
                    <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=120&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>

                {/* Two dark/light cards */}
                <div style={{ margin: '5px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ backgroundColor: '#3A2416', borderRadius: 12, padding: '10px 11px' }}>
                    <p style={{ fontSize: '0.9rem', margin: '0 0 3px' }}>😴</p>
                    <p style={{ color: '#C8A882', fontSize: '0.48rem', fontWeight: 600, margin: '0 0 2px' }}>Søvn i nat</p>
                    <p style={{ color: 'rgba(200,168,130,0.5)', fontSize: '0.38rem', margin: 0 }}>Log søvn +</p>
                  </div>
                  <div style={{ backgroundColor: '#EBD9C6', borderRadius: 12, padding: '10px 11px' }}>
                    <p style={{ fontSize: '0.9rem', margin: '0 0 3px' }}>👶</p>
                    <p style={{ color: '#2B1A10', fontSize: '0.48rem', fontWeight: 600, margin: '0 0 2px' }}>Næste påske</p>
                    <p style={{ color: '#9A7A6A', fontSize: '0.38rem', margin: 0 }}>Følge 14. uge</p>
                  </div>
                </div>

                {/* Community card */}
                <div style={{ margin: '5px 10px', backgroundColor: '#fff', borderRadius: 12, padding: '9px 11px', border: '1px solid #F0E8DF' }}>
                  <p style={{ color: '#9A7A6A', fontSize: '0.38rem', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>AKTIVE I DIN OMEGN (1)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&q=80','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&q=80'].map((src,i)=>(
                      <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', overflow:'hidden', border:'1.5px solid #fff', marginLeft: i>0?-5:0, zIndex:3-i, position:'relative' }}>
                        <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      </div>
                    ))}
                    <p style={{ color: '#5B3F2B', fontSize: '0.4rem', margin: '0 0 0 6px', fontWeight: 600 }}>+3</p>
                    <p style={{ color: '#C8A882', fontSize: '0.38rem', margin: '0 0 0 auto' }}>Læs →</p>
                  </div>
                  <p style={{ color: '#9A7A6A', fontSize: '0.38rem', margin: '4px 0 0' }}>Du er ikke alene</p>
                </div>
              </div>
              {/* Home bar */}
              <div style={{ height: 20, backgroundColor: '#FBF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 50, height: 4, backgroundColor: '#D4B8A0', borderRadius: 3 }} />
              </div>
            </div>

            {/* Phone B — SleepLog (behind-right, offset down) */}
            <div style={{
              position: 'absolute', right: 0, top: 50,
              width: 185, height: 390,
              borderRadius: 30, overflow: 'hidden',
              boxShadow: '0 20px 55px rgba(0,0,0,0.18)',
              border: '2px solid rgba(255,255,255,0.5)',
              background: 'linear-gradient(145deg, #E0D0BC 0%, #CFC0AA 100%)',
              zIndex: 1,
            }}>
              {/* Phone shell top */}
              <div style={{ height: 26, backgroundColor: '#D4C0A8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 64, height: 13, backgroundColor: '#1A0E06', borderRadius: 18 }} />
              </div>
              {/* Screen */}
              <div style={{ backgroundColor: '#FFFDF9', height: 'calc(100% - 26px - 18px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: '#9A7A6A', fontSize: '0.42rem', margin: 0 }}>←</p>
                  <p style={{ color: '#1E140A', fontSize: '0.75rem', fontWeight: 700, margin: 0 }}>Søvndag</p>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5L10 5.5M7 2L10 5.5L7 9" stroke="#9A7A6A" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 14px 8px', display: 'flex', gap: 14 }}>
                  {['Dag','Uge','Måned'].map((t,i)=>(
                    <span key={t} style={{ fontSize: '0.46rem', color: i===0?'#1E140A':'#9A7A6A', fontWeight: i===0?600:400, borderBottom: i===0?'1.5px solid #C8A882':'none', paddingBottom: 2 }}>{t}</span>
                  ))}
                </div>

                <p style={{ color: '#9A7A6A', fontSize: '0.42rem', margin: '0 14px 6px', fontStyle: 'italic' }}>Tirsdag, 11. april</p>

                {[
                  { time: '21:30 – 11:15', dur: '1t 55 min' },
                  { time: '12:40 – 13:20', dur: '40 min' },
                  { time: '13:30 – 15:00', dur: '30 min' },
                  { time: '17:30 – 19:30', dur: '25 min' },
                  { time: '17:45 – 20:10', dur: '20 min' },
                  { time: '19:45 – 20:10', dur: '10 min', highlight: true },
                ].map((row,i)=>(
                  <div key={i} style={{ margin: '2px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor: row.highlight?'#C8A882':'#F3EDE5', borderRadius: 8, padding: '6px 10px' }}>
                    <p style={{ color: row.highlight?'#fff':'#5B3F2B', fontSize: '0.42rem', margin: 0, fontWeight: 500 }}>{row.time}</p>
                    <p style={{ color: row.highlight?'#fff':'#9A7A6A', fontSize: '0.4rem', margin: 0 }}>{row.dur}</p>
                  </div>
                ))}
              </div>
              {/* Home bar */}
              <div style={{ height: 18, backgroundColor: '#FFFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 44, height: 4, backgroundColor: '#D4B8A0', borderRadius: 3 }} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          HERO 3 — "Kom med i klubben"
      ════════════════════════════════ */}
      <section style={{ backgroundColor: '#EDE0CC' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 460 }}>

          {/* Photo — left, square-ish */}
          <div style={{ flex: '0 0 38%', minWidth: 240, minHeight: 420, position: 'relative', overflow: 'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85"
              alt="Kvinde med Club No Sleep taske og barnevogn"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>

          {/* Decorative circle top-right */}
          <div style={{ flex: '1 1 300px', padding: '4.5rem 5rem 4.5rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            {/* Big circle decoration */}
            <div style={{ position: 'absolute', right: -120, bottom: -120, width: 340, height: 340, borderRadius: '50%', backgroundColor: 'rgba(180,140,100,0.18)' }} />

            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 500, color: '#1E140A', lineHeight: 1.2, margin: '0 0 1.4rem' }}>
              Kom med i klubben
            </h2>

            <p style={{ color: '#3E2810', fontSize: '0.9rem', lineHeight: 1.95, maxWidth: 420, margin: '0 0 1.4rem' }}>
              Vi har været der.<br />
              Der hvor nætterne er svære, dagene er lange og ingen helt forstår, hvad du står i. Hvor far sover på sofaen og mor sover siddende. Hvor frygten for natten allerede starter i løbet af eftermiddagen.<br />
              CLUB NO SLEEP er skabt til dig, som savner et sted at blive spejlet og finde andre, der er vågen sammen med dig.
            </p>

            <p style={{ color: '#3E2810', fontSize: '0.9rem', lineHeight: 1.95, maxWidth: 420, margin: '0 0 2rem' }}>
              Kom med i klubben. For din egen skyld, og for alle de mødre som føler sig alene netop nu. Sammen kan vi mindske ensomhed i moderskabet.
            </p>

            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '1.45rem', color: '#5B3F2B', margin: 0, lineHeight: 1.3 }}>
              Kærligst og kram fra Sara &amp; Nicolaj
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          HERO 2 — "Dette finder du i appen"
      ════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFDF9', padding: '6rem 2.5rem 7rem' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 3.5vw, 2.7rem)', fontWeight: 400, color: '#1E140A', margin: '0 0 1rem' }}>
              Dette finder du i appen
            </h2>
            <svg width="18" height="16" viewBox="0 0 18 16" fill="none" style={{ display: 'inline-block' }}>
              <path d="M9 15C9 15 1 9.5 1 4.5C1 2.5 2.5 1 4.5 1C6 1 7.5 2 9 3.5C10.5 2 12 1 13.5 1C15.5 1 17 2.5 17 4.5C17 9.5 9 15 9 15Z" fill="#C8A882" stroke="#C8A882" strokeWidth="0.5"/>
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem 4rem' }}>

            {[
              {
                img: '🤰',
                title: 'Graviditeten uge for uge',
                desc: 'Modtag ugentlige opdateringer om baby, kroppen og alt hvad der ellers følger med graviditeten inklusiv et lille skriv til din partner samt kærlige forslag til "et lille næste skridt".',
              },
              {
                img: '🎯',
                title: 'Milepæle',
                desc: 'Bliv mindet om din babys milepæle og forevig de store øjeblikke med fine stickers og datoer, lige til at hente ned på din telefon.',
              },
              {
                img: '🐯',
                title: 'Tigerspring',
                desc: 'Få besked når din baby nærmer sig et udviklingsspring. Bliv klogere på dit barns udvikling og læs hvordan du bedst muligt hjælper dit barn, når verden bliver større.',
              },
              {
                img: '🌙',
                title: 'Et lys i mørket',
                desc: 'Se hvor mange andre mødre som er vågne om natten, præcis ligesom dig. Så føles stilheden lidt mindre ensom.',
              },
              {
                img: '☕',
                title: 'Babyvenlige caféer',
                desc: 'Find hyggelige kaffesteder anbefalet af andre mødre, hvor der er plads til barnevogn, babylyde og krummer på gulvet.',
              },
              {
                img: '📅',
                title: 'Kalender',
                desc: 'Hold styr på jordemodertider, lægebesøg, aktiviteter og andre vigtige datoer, og del kalenderen (og ansvaret) med en partner.',
              },
              {
                img: '✏️',
                title: 'Søvnlog',
                desc: 'Registrér babys nattesøvn, dagslure og opvågninger og modtag feedback fra AI søvnvejleder.',
              },
              {
                img: '💬',
                title: 'Fællesskab',
                desc: 'Ræk ud til en mor, der sidder vågen, præcis ligesom dig. Måske begynder et venskab netop der, hvor natten ellers føles mest stille.',
              },
              {
                img: '✅',
                title: 'Din app dine valg',
                desc: 'Tilpas din hjemmeskærm, vælg selv om du ønsker at invitere en partner (gratis), del kun det, du ønsker, og vælg det farvetema, der føles bedst for dig.',
              },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: '#EBD9C6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0 }}>
                  {f.img}
                </div>
                <div>
                  <p style={{ color: '#1E140A', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 6px' }}>{f.title}</p>
                  <p style={{ color: '#7A665A', fontSize: '0.78rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          HERO 4 — "Du skal ikke stå med det hele alene"
      ════════════════════════════════ */}
      <section style={{ backgroundColor: '#D9C4A0', padding: '5rem 2.5rem' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>

          {/* Left copy */}
          <div style={{ flex: '1 1 280px', maxWidth: 360 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.1rem, 3.5vw, 3rem)', fontWeight: 400, color: '#1E140A', lineHeight: 1.18, margin: '0 0 1.3rem' }}>
              Du skal ikke stå<br />med det hele alene
            </h2>
            <p style={{ color: '#3E2810', fontSize: '0.88rem', lineHeight: 1.9, maxWidth: 300, margin: '0 0 2.4rem' }}>
              Én konto inkluderer altid en gratis bruger mere, så du kan vælge at dele alt fra søvnlog, kalender og tigerspring med din partner. Sammen bliver det ofte lettere.
            </p>
            <button onClick={handleLogin} style={{ backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Bliv medlem
            </button>
          </div>

          {/* Right — partner card + calendar */}
          <div style={{ flex: '0 0 auto', display: 'flex', gap: 18, alignItems: 'flex-start' }}>

            {/* Partner card */}
            <div style={{ width: 210, backgroundColor: '#FFFDF9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 55px rgba(0,0,0,0.18)' }}>
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
            <div style={{ width: 220, backgroundColor: '#FFFDF9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 18px 55px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.72rem', fontWeight: 700, margin: 0 }}>Fælles kalender</p>
                <span style={{ color: '#C8A882', fontSize: '0.8rem' }}>›</span>
              </div>
              <div style={{ padding: '12px 16px' }}>
                <p style={{ color: '#9A7A6A', fontSize: '0.6rem', margin: '0 0 8px', fontWeight: 500 }}>April 2025</p>
                {/* Calendar grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 10 }}>
                  {['M','T','O','T','F','L','S'].map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: '0.38rem', color: '#9A7A6A', fontWeight: 700, paddingBottom: 2 }}>{d}</div>
                  ))}
                  {/* Blanks for Tuesday start */}
                  <div />
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(d => (
                    <div key={d} style={{
                      textAlign: 'center', fontSize: '0.38rem',
                      borderRadius: '50%', width: 14, height: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto',
                      backgroundColor: d === 4 ? 'transparent' : d === 9 ? '#C8A882' : d === 27 ? '#3A2416' : 'transparent',
                      border: d === 4 ? '1.5px solid #C8A882' : 'none',
                      color: d === 9 || d === 27 ? '#fff' : '#4A3525',
                      fontWeight: [4, 9, 27].includes(d) ? 700 : 400,
                    }}>{d}</div>
                  ))}
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
      <footer style={{ backgroundColor: '#1E140A', padding: '3.5rem 2.5rem 2rem' }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');
        @media (max-width: 768px) {
          .landing-features-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .landing-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ── Style helpers ── */
const btnDark = {
  backgroundColor: '#3A2416', color: '#F5EFE9', border: 'none',
  borderRadius: 8, padding: '9px 20px', fontSize: '0.87rem',
  fontWeight: 600, cursor: 'pointer',
};
const btnBrown = {
  backgroundColor: '#7A5535', color: '#fff', border: 'none',
  borderRadius: 10, padding: '14px 34px', fontSize: '0.92rem',
  fontWeight: 600, cursor: 'pointer',
};
const tiny = (color) => ({ color, fontSize: '0.34rem', margin: 0 });

function PhoneNotch({ color }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: 56, height: 16, backgroundColor: color,
      borderRadius: '0 0 12px 12px', zIndex: 10,
    }} />
  );
}

function MiniNav({ active }) {
  const items = [['🏠', 'Hjem'], ['📋', 'Dagbog'], ['➕', ''], ['👥', 'Fællesskab'], ['👤', 'Profil']];
  return (
    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-around', padding: '6px 0 4px', borderTop: '1px solid #EDE4DB', backgroundColor: '#FFFDF9' }}>
      {items.map(([ic, lb], i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <span style={{ fontSize: i === 2 ? '0.95rem' : '0.62rem' }}>{ic}</span>
          {lb && <span style={{ fontSize: '0.25rem', color: i === active ? '#C8A882' : '#9A7A6A' }}>{lb}</span>}
        </div>
      ))}
    </div>
  );
}