import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Moon, BookOpen, Users, Calendar, Bell, Zap, Heart, ShoppingBag, Lightbulb } from 'lucide-react';
import LegalModal from '@/components/landing/LegalModal';

const FEATURES = [
  { icon: Moon,        title: 'Søvnrådgivning',  desc: 'AI-baserede råd tilpasset præcis dit barns alder og søvnmønstre.' },
  { icon: BookOpen,    title: 'Videnscenter',     desc: 'Ekspertviden om graviditet, baby og det første år.' },
  { icon: Lightbulb,   title: 'Top søvn tips',    desc: 'Praktiske råd til bedre søvn for hele familien.' },
  { icon: Users,       title: 'Er vi mødre',      desc: 'Mød mødre og fædre nær dig — også midt om natten.' },
  { icon: Heart,       title: 'De sunde aftier',  desc: 'Byg gode rutiner for bedre søvn og velvære.' },
  { icon: ShoppingBag, title: 'Tilbud',           desc: 'Find de bedste produkter til baby og dig.' },
  { icon: Calendar,    title: 'Kalender',         desc: 'Hold styr på jordemoder, scanning og alle vigtige aftaler.' },
  { icon: Zap,         title: 'Tigerspring',      desc: 'Følg dit barns udviklingsspring og forstå de urolige perioder.' },
  { icon: Bell,        title: 'Notifikationer',   desc: 'Bliv mindet om vigtige milepæle og kommende aftaler.' },
];

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);
  const [legalModal, setLegalModal] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin('/app');
  const handleEnterApp = () => { window.location.href = '/app'; };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#2B1F16', backgroundColor: '#F5EDE0' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ backgroundColor: '#F5EDE0', borderBottom: '1px solid #DDD0BC', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon style={{ width: 15, height: 15, color: '#fff' }} />
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.15rem', fontWeight: 600, color: '#2B1F16' }}>
              clubnosleep
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isAuth ? (
              <button onClick={handleEnterApp}
                style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                Åbn app →
              </button>
            ) : (
              <>
                <button onClick={handleLogin}
                  style={{ background: 'none', border: 'none', color: '#5B3F2B', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>
                  Log ind
                </button>
                <button onClick={handleLogin}
                  style={{ backgroundColor: '#5B3F2B', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                  Bliv medlem
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: '#F5EDE0', padding: '5rem 2rem 5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap' }}>

          {/* Left */}
          <div style={{ flex: '1 1 380px', minWidth: 300 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '3rem', fontWeight: 500, lineHeight: 1.2, color: '#1E140A', marginBottom: '1.5rem', marginTop: 0 }}>
              Til dig, der er vågen,<br />
              når resten af verden sover.
            </h1>

            <div style={{ marginBottom: '1.5rem' }}>
              <Heart style={{ width: 18, height: 18, color: '#C8A882', fill: '#C8A882' }} />
            </div>

            <p style={{ color: '#5B3F2B', fontSize: '0.97rem', lineHeight: 1.8, maxWidth: 420, marginBottom: '1.1rem', marginTop: 0 }}>
              Der findes en hel særlig form for ensomhed i moderskabet. En ensomhed som kommer snigende om natten, når baby igen er vågen og resten af verden er stille; <strong>Natteensomhed.</strong>
            </p>
            <p style={{ color: '#5B3F2B', fontSize: '0.97rem', lineHeight: 1.8, maxWidth: 420, marginBottom: '2.5rem', marginTop: 0 }}>
              <strong>CLUB NO SLEEP</strong> er en dansk app skabt til netop disse øjeblikke. For ingen skal føle sig alene i moderskabet.
            </p>

            <button onClick={handleLogin}
              style={{ backgroundColor: '#7A5535', color: '#fff', border: 'none', borderRadius: 9, padding: '14px 34px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>
              Hent app
            </button>
          </div>

          {/* Right — two phone mockups side by side */}
          <div style={{ flex: '0 0 auto', display: 'flex', gap: 16, alignItems: 'flex-end' }}>

            {/* Phone 1 — Home screen (slightly taller, left) */}
            <div style={{ width: 190, height: 380, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.22)', border: '6px solid #2B1A10', backgroundColor: '#2B1A10', position: 'relative' }}>
              {/* notch */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 60, height: 18, backgroundColor: '#2B1A10', borderRadius: '0 0 12px 12px', zIndex: 10 }} />
              <div style={{ width: '100%', height: '100%', overflowY: 'hidden', overflowX: 'hidden' }}>
                {/* Home screen content */}
                <div style={{ backgroundColor: '#F5EDE0', height: '100%', padding: '22px 10px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#9A7A6A', fontSize: '0.38rem', margin: 0 }}>Mandag, 17. april</p>
                      <p style={{ color: '#1E140A', fontSize: '0.65rem', fontWeight: 700, margin: '1px 0 0' }}>Godmorgen, Sara</p>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#EDE0CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem' }}>🔔</div>
                  </div>
                  {/* Pregnancy card */}
                  <div style={{ backgroundColor: '#C8A882', borderRadius: 12, overflow: 'hidden', flex: '0 0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 72 }}>
                      <div style={{ flex: 1, padding: '8px 10px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.36rem', margin: '0 0 2px' }}>I dag er du i Uge</p>
                        <p style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, margin: 0 }}>7</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.32rem', margin: '2px 0 0' }}>og 3 dage med</p>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6, padding: '3px 6px', marginTop: 4, display: 'inline-block' }}>
                          <p style={{ color: '#fff', fontSize: '0.35rem', margin: 0 }}>Åben din uge-plan →</p>
                        </div>
                      </div>
                      <div style={{ width: 58, overflow: 'hidden', flexShrink: 0 }}>
                        <img src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=150&q=80" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </div>
                    </div>
                  </div>
                  {/* Feature cards grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    <div style={{ backgroundColor: '#3A2416', borderRadius: 10, padding: '8px 9px' }}>
                      <span style={{ fontSize: '0.8rem' }}>🌙</span>
                      <p style={{ color: '#C8A882', fontSize: '0.42rem', fontWeight: 600, margin: '3px 0 1px' }}>Søvn chat</p>
                      <p style={{ color: 'rgba(200,168,130,0.6)', fontSize: '0.34rem', margin: 0 }}>Lær mere »</p>
                    </div>
                    <div style={{ backgroundColor: '#EDE0CC', borderRadius: 10, padding: '8px 9px' }}>
                      <span style={{ fontSize: '0.8rem' }}>📅</span>
                      <p style={{ color: '#2B1A10', fontSize: '0.42rem', fontWeight: 600, margin: '3px 0 1px' }}>Ekspert paftaler</p>
                      <p style={{ color: '#9A7A6A', fontSize: '0.34rem', margin: 0 }}>Følge til igt →</p>
                    </div>
                  </div>
                  {/* Community row */}
                  <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: '7px 9px' }}>
                    <p style={{ color: '#9A7A6A', fontSize: '0.32rem', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>AKTIVE I DIN DIN</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {['👩','👩‍🦱','👩‍🦰'].map((av, i) => (
                        <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#EDE0CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', border: '1.5px solid #fff' }}>{av}</div>
                      ))}
                      <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.3rem', color: '#fff', fontWeight: 700, border: '1.5px solid #fff' }}>+3</div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: '7px 9px' }}>
                    <p style={{ color: '#9A7A6A', fontSize: '0.32rem', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>DE 10 TIDLIGERE TEGN</p>
                    <p style={{ color: '#5B3F2B', fontSize: '0.35rem', margin: 0 }}>• Lav</p>
                    <p style={{ color: '#7A665A', fontSize: '0.3rem', margin: '1px 0 0' }}>Du er ikke alene</p>
                  </div>
                  {/* Bottom nav */}
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-around', paddingTop: 6, borderTop: '1px solid #EDE4DB' }}>
                    {[['🏠','Hjem'],['📋','Søvnlog'],['➕',''],['💬','Fælles'],['👤','Profil']].map(([ic, lb], i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: i === 2 ? '1rem' : '0.65rem' }}>{ic}</span>
                        {lb && <span style={{ fontSize: '0.26rem', color: i === 0 ? '#C8A882' : '#9A7A6A' }}>{lb}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phone 2 — SleepLog (slightly shorter, right, elevated) */}
            <div style={{ width: 178, height: 356, borderRadius: 26, overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.18)', border: '5px solid #E8DDD0', backgroundColor: '#E8DDD0', position: 'relative', marginBottom: 12 }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 52, height: 14, backgroundColor: '#E8DDD0', borderRadius: '0 0 10px 10px', zIndex: 10 }} />
              <div style={{ backgroundColor: '#FFFDF9', height: '100%', padding: '20px 10px 8px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: '#1E140A', fontSize: '0.65rem', fontWeight: 700, margin: 0 }}>Søvndag</p>
                  <div style={{ fontSize: '0.55rem' }}>✏️</div>
                </div>
                <p style={{ color: '#9A7A6A', fontSize: '0.35rem', margin: 0 }}>Fredag 11. april</p>
                {/* Sleep time entries */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { time: '21:30 – 07:14', dur: '9:44 min', note: '', dark: false },
                    { time: '21:00 – 13:30', dur: '8:16min', note: 'Søvn', dark: false },
                    { time: '17:00 – 17:45', dur: '45 min', note: '', dark: true },
                    { time: '18:30 – 21:47', dur: '3:17', note: '', dark: false },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: row.dark ? '#3A2416' : '#F3E9E1', borderRadius: 8, padding: '5px 8px' }}>
                      <p style={{ color: row.dark ? '#C8A882' : '#5B3F2B', fontSize: '0.36rem', margin: 0, fontWeight: 500 }}>{row.time}</p>
                      <p style={{ color: row.dark ? '#C8A882' : '#9A7A6A', fontSize: '0.34rem', margin: 0 }}>{row.dur}</p>
                    </div>
                  ))}
                </div>
                <div style={{ backgroundColor: '#C8A882', borderRadius: 8, padding: '5px 8px', marginTop: 2 }}>
                  <p style={{ color: '#fff', fontSize: '0.36rem', fontWeight: 600, textAlign: 'center', margin: 0 }}>Se alle →</p>
                </div>
                {/* Bottom nav */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-around', paddingTop: 6, borderTop: '1px solid #EDE4DB' }}>
                  {[['🏠','Hjem'],['📋','Søvnlog'],['➕',''],['💬','Kalender'],['👤','Profil']].map(([ic, lb], i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: i === 2 ? '0.95rem' : '0.6rem' }}>{ic}</span>
                      {lb && <span style={{ fontSize: '0.26rem', color: i === 1 ? '#C8A882' : '#9A7A6A' }}>{lb}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── KOM MED I KLUBBEN ── */}
      <section style={{ backgroundColor: '#EAD9C0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Photo */}
          <div style={{ flex: '0 0 42%', minWidth: 280, minHeight: 400, overflow: 'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=700&q=80"
              alt="Mor med barnevogn"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          {/* Text */}
          <div style={{ flex: '1 1 300px', padding: '4.5rem 4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #8A6245', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Heart style={{ width: 17, height: 17, color: '#8A6245' }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.3rem', fontWeight: 600, color: '#1E140A', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Kom med i klubben
            </h2>
            <p style={{ color: '#5B3F2B', fontSize: '0.97rem', lineHeight: 1.8, maxWidth: 380, marginBottom: '0.9rem' }}>
              Wier en klub af forældre der støtter hinanden. Dul dine oplevelser, få råd og med nogen der forstår dig — dag som nat.
            </p>
            <p style={{ color: '#5B3F2B', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 380, marginBottom: '1.75rem', opacity: 0.8 }}>
              Fordi det bedste fællesskab opstår, når man deler ærlige oplevelser — og ved at man ikke er alene om dem.
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontStyle: 'italic', fontSize: '1.05rem', color: '#8A5C30' }}>
              #ærlighedsfordereleret<em>Rarity</em>
            </p>
          </div>
        </div>
      </section>

      {/* ── DETTE FINDER DU I APPEN ── */}
      <section style={{ backgroundColor: '#FFFDF9', padding: '5.5rem 2rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.2rem', fontWeight: 600, color: '#1E140A', marginBottom: '0.5rem' }}>
              Dette finder du i appen
            </h2>
            <div style={{ fontSize: '1.4rem' }}>🌸</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.75rem 3rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#EDE0CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <f.icon style={{ width: 20, height: 20, color: '#5B3F2B' }} />
                </div>
                <p style={{ color: '#1E140A', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{f.title}</p>
                <p style={{ color: '#7A665A', fontSize: '0.8rem', lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DU SKAL IKKE STÅ ALENE ── */}
      <section style={{ backgroundColor: '#9C7A48', padding: '5.5rem 2rem' }}>
        <div style={{ maxWidth: 1050, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 72, flexWrap: 'wrap' }}>

          {/* Left text */}
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.6rem', fontWeight: 600, color: '#1E140A', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Du skal ikke stå<br />med det hele alene
            </h2>
            <p style={{ color: '#4A2E14', fontSize: '0.97rem', lineHeight: 1.8, maxWidth: 330, marginBottom: '2.25rem' }}>
              Tal med andre forældre, del dine oplevelser og følg dit barns udvikling. Clubnosleep er med dig — i de svære øjeblikke og de gode.
            </p>
            <button onClick={handleLogin}
              style={{ backgroundColor: '#2B1A10', color: '#F5EFE9', border: 'none', borderRadius: 9, padding: '13px 30px', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer' }}>
              Bliv medlem
            </button>
          </div>

          {/* Right — cards */}
          <div style={{ flex: '0 0 auto', display: 'flex', gap: 16, alignItems: 'flex-start' }}>

            {/* Chat card */}
            <div style={{ width: 190, backgroundColor: '#FFFDF9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.22)' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.65rem', fontWeight: 700, margin: 0 }}>Det fællesskab</p>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Olivert', msg: 'Det vil så alt at bare...', sub: 'dig.', av: '👩' },
                  { name: 'Creati', msg: 'hvod frem at gir', av: '👩‍🦱' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#F3E9E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', flexShrink: 0 }}>
                      {m.av}
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#F3E9E1', borderRadius: 10, padding: '6px 9px' }}>
                      <p style={{ color: '#5B3F2B', fontSize: '0.5rem', fontWeight: 600, margin: '0 0 2px' }}>{m.name}</p>
                      <p style={{ color: '#7A665A', fontSize: '0.44rem', margin: 0 }}>{m.msg}</p>
                      {m.sub && <p style={{ color: '#7A665A', fontSize: '0.44rem', margin: 0 }}>{m.sub}</p>}
                    </div>
                  </div>
                ))}
                <button style={{ width: '100%', backgroundColor: '#C8A882', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 0', fontSize: '0.5rem', fontWeight: 700, cursor: 'pointer', marginTop: 2 }}>
                  Bliv medlem
                </button>
              </div>
            </div>

            {/* Calendar card */}
            <div style={{ width: 168, backgroundColor: '#FFFDF9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 50px rgba(0,0,0,0.18)' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ color: '#1E140A', fontSize: '0.65rem', fontWeight: 700, margin: 0 }}>Kalender</p>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 8 }}>
                  {['M','T','O','T','F','L','S'].map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: '0.33rem', color: '#9A7A6A', fontWeight: 700 }}>{d}</div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.32rem', borderRadius: 4, padding: '2px 0', backgroundColor: d === 18 ? '#C8A882' : [9,24].includes(d) ? '#F3E9E1' : 'transparent', color: d === 18 ? '#fff' : '#5B3F2B', fontWeight: d === 18 ? 700 : 400 }}>
                      {d}
                    </div>
                  ))}
                </div>
                <div style={{ backgroundColor: '#F3E9E1', borderRadius: 10, padding: '8px 10px' }}>
                  <p style={{ color: '#5B3F2B', fontSize: '0.45rem', fontWeight: 600, margin: '0 0 2px' }}>Continease til alt</p>
                  <p style={{ color: '#9A7A6A', fontSize: '0.38rem', margin: 0 }}>Rigshospitalet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#1E140A', padding: '4rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginBottom: '2.5rem' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon style={{ width: 13, height: 13, color: '#fff' }} />
                </div>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.05rem', fontWeight: 600, color: '#F5EFE9' }}>
                  clubnosleep
                </span>
              </div>
              <p style={{ color: '#7A5A44', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: 200, margin: 0 }}>
                Din trygge havn som ny forælder — søvn, fællesskab og viden samlet ét sted.
              </p>
            </div>

            {/* Juridisk */}
            <div>
              <p style={{ color: '#5A4030', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, marginTop: 0 }}>
                Juridisk
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => setLegalModal('terms')} style={{ background: 'none', border: 'none', color: '#C8A882', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  Handelsbetingelser
                </button>
                <button onClick={() => setLegalModal('privacy')} style={{ background: 'none', border: 'none', color: '#C8A882', fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  Privatlivspolitik
                </button>
              </div>
            </div>

            {/* Hent appen */}
            <div>
              <p style={{ color: '#5A4030', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, marginTop: 0 }}>
                Hent appen
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="#" style={{ color: '#C8A882', fontSize: '0.88rem', textDecoration: 'none' }}>App Store</a>
                <a href="#" style={{ color: '#C8A882', fontSize: '0.88rem', textDecoration: 'none' }}>Google Play</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #2E1C0E', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#5A4030', fontSize: '0.78rem', margin: 0 }}>© 2025 Clubnosleep · Alle rettigheder forbeholdes</p>
          </div>
        </div>
      </footer>

      {legalModal === 'terms' && <LegalModal type="terms" title="Handelsbetingelser" onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacy' && <LegalModal type="privacy" title="Privatlivspolitik" onClose={() => setLegalModal(null)} />}
    </div>
  );
}