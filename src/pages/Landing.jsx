import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Moon, BookOpen, Users, Calendar, Bell, Zap, Heart, ShoppingBag, Lightbulb } from 'lucide-react';
import LegalModal from '@/components/landing/LegalModal';

const FEATURES = [
  { icon: Moon, title: 'Søvnrådgivning', desc: 'AI-baserede råd tilpasset præcis dit barns alder og søvnmønstre.' },
  { icon: BookOpen, title: 'Videnscenter', desc: 'Ekspertviden om graviditet, baby og det første år.' },
  { icon: Lightbulb, title: 'Top søvn tips', desc: 'Praktiske råd til bedre søvn for hele familien.' },
  { icon: Users, title: 'Er vi mødre', desc: 'Mød mødre og fædre nær dig — også midt om natten.' },
  { icon: Heart, title: 'De sunde aftier', desc: 'Byg gode rutiner for bedre søvn og velvære.' },
  { icon: ShoppingBag, title: 'Tilbud', desc: 'Find de bedste produkter til baby og dig.' },
  { icon: Calendar, title: 'Kalender', desc: 'Hold styr på jordemoder, scanning og alle vigtige aftaler.' },
  { icon: Zap, title: 'Tigerspring', desc: 'Følg dit barns udviklingsspring og forstå de urolige perioder.' },
  { icon: Bell, title: 'Notifikationer', desc: 'Bliv mindet om vigtige milepæle og kommende aftaler.' },
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
    <div style={{ backgroundColor: '#F9F3EB', color: '#2B1F16', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <nav style={{ backgroundColor: 'rgba(249,243,235,0.95)', borderBottom: '1px solid #E8DDD0', backdropFilter: 'blur(12px)' }}
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8A882' }}>
            <Moon className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.2rem', fontWeight: 600, color: '#2B1F16' }}>
            clubnosleep
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isAuth ? (
            <button onClick={handleEnterApp}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#5B3F2B', color: '#fff' }}>
              Åbn app →
            </button>
          ) : (
            <>
              <button onClick={handleLogin} className="text-sm font-medium" style={{ color: '#5B3F2B' }}>
                Log ind
              </button>
              <button onClick={handleLogin}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#5B3F2B', color: '#fff' }}>
                Bliv medlem
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: '#F9F3EB', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="max-w-6xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-12">

          {/* Left text */}
          <div className="flex-1">
            <div className="text-2xl mb-4">🌙</div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.8rem', fontWeight: 600, lineHeight: 1.2, color: '#2B1F16', marginBottom: '1rem' }}>
              Til dig, der er vågen,<br />
              <em style={{ fontStyle: 'italic' }}>når resten af verden sover.</em>
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8A882' }}>
                <span style={{ color: '#fff', fontSize: '0.6rem' }}>→</span>
              </div>
            </div>

            <p style={{ color: '#5B3F2B', fontSize: '1rem', lineHeight: 1.7, maxWidth: 380, marginBottom: '1rem' }}>
              Du er ikke alene i de lange nætter. Der er en app, som holder dig med selskab, giver dig råd og forbinder dig med andre forældre i samme situation.
            </p>

            <p style={{ color: '#2B1F16', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', maxWidth: 380 }}>
              CLUBNOSLEEP — din app til de første år som forælder.<br />
              Til søvn, viden og Fællesskab.
            </p>

            <button onClick={handleLogin}
              className="px-7 py-3 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#8A6245', color: '#fff' }}>
              Bliv medlem
            </button>
          </div>

          {/* Right — phone mockups */}
          <div className="flex-shrink-0 relative" style={{ height: 340 }}>
            {/* Phone 1 — back left, dark */}
            <div className="absolute" style={{ left: 0, top: 20, width: 160, height: 300, borderRadius: 20, overflow: 'hidden', backgroundColor: '#3A2416', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', zIndex: 1 }}>
              <div className="p-4 h-full flex flex-col gap-2">
                <p style={{ color: '#DCC1B0', fontSize: '0.7rem', fontWeight: 600 }}>Godmorgen</p>
                <div className="rounded-lg p-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <p style={{ color: '#DCC1B0', fontSize: '0.55rem' }}>Godmorgen! ⭐</p>
                </div>
                {['Søvnrådgivning', 'Min søvnlog', 'Søvnrådgivning'].map((t, i) => (
                  <div key={i} className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <p style={{ color: '#DCC1B0', fontSize: '0.55rem' }}>{t}</p>
                  </div>
                ))}
                <div className="rounded-lg p-2 mt-1" style={{ backgroundColor: 'rgba(200,168,130,0.25)' }}>
                  <p style={{ color: '#DCC1B0', fontSize: '0.5rem' }}>CLUBNOSLEEP</p>
                  <p style={{ color: 'rgba(220,193,176,0.6)', fontSize: '0.42rem' }}>til søvn og fællesskab</p>
                </div>
                <div className="mt-auto flex justify-around py-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {['🏠','🔍','💬','👤'].map((ic, i) => (
                    <span key={i} style={{ fontSize: '0.7rem' }}>{ic}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone 2 — front center */}
            <div className="absolute" style={{ left: 130, top: 0, width: 170, height: 310, borderRadius: 22, overflow: 'hidden', backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB', boxShadow: '0 24px 70px rgba(0,0,0,0.18)', zIndex: 2 }}>
              <div className="p-3.5 h-full flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <p style={{ color: '#2B1F16', fontSize: '0.65rem', fontWeight: 700 }}>Min søvnlog</p>
                  <p style={{ color: '#C8A882', fontSize: '0.5rem' }}>Se alle</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[['🌙','Sengetid','22:26'],['⭐','Vågnet','22:15'],['☀️','Napper','25-20'],['💤','I dag','21']].map(([e,l,v], i) => (
                    <div key={i} className="rounded-xl p-2 flex flex-col items-center" style={{ backgroundColor: i < 2 ? '#3A2416' : '#F3E9E1' }}>
                      <span style={{ fontSize: '0.9rem' }}>{e}</span>
                      <p style={{ color: i < 2 ? '#DCC1B0' : '#7A665A', fontSize: '0.38rem', marginTop: 2 }}>{l}</p>
                      <p style={{ color: i < 2 ? '#fff' : '#2B1F16', fontSize: '0.55rem', fontWeight: 700 }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl overflow-hidden mt-1" style={{ backgroundColor: '#F3E9E1' }}>
                  <div className="px-3 py-2">
                    <p style={{ color: '#2B1F16', fontSize: '0.55rem', fontWeight: 600 }}>Søvnråd</p>
                  </div>
                  <div className="px-3 pb-3 flex gap-2">
                    <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=100&q=80" className="w-full h-full object-cover" alt="" />
                    </div>
                    <p style={{ color: '#7A665A', fontSize: '0.38rem', lineHeight: 1.5 }}>Blid musik kan hjælpe barnet til at falde i søvn hurtigere...</p>
                  </div>
                </div>
                <div className="mt-auto flex justify-around py-2" style={{ borderTop: '1px solid #EDE4DB' }}>
                  {['🏠','🔍','🤱','📅'].map((ic, i) => (
                    <span key={i} style={{ fontSize: '0.75rem' }}>{ic}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone 3 — back right, partial */}
            <div className="absolute" style={{ left: 276, top: 30, width: 155, height: 290, borderRadius: 20, overflow: 'hidden', backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB', boxShadow: '0 16px 50px rgba(0,0,0,0.14)', zIndex: 1 }}>
              <div className="p-3 h-full flex flex-col gap-2">
                <p style={{ color: '#2B1F16', fontSize: '0.65rem', fontWeight: 700 }}>Søvnråd</p>
                <div className="rounded-lg p-2.5" style={{ backgroundColor: '#F3E9E1' }}>
                  <p style={{ color: '#5B3F2B', fontSize: '0.45rem', lineHeight: 1.6 }}>AI-rådgiveren har tilpasset disse råd specielt til dit barn — de som hjælper de fleste forældre...</p>
                </div>
                <div className="rounded-lg p-2.5 mt-1" style={{ backgroundColor: '#F3E9E1' }}>
                  <p style={{ color: '#5B3F2B', fontSize: '0.42rem', fontWeight: 600, marginBottom: 3 }}>Søvnråd</p>
                  <p style={{ color: '#7A665A', fontSize: '0.38rem', lineHeight: 1.5 }}>Forældre der bruger denne rutine sover mere sammenhængende...</p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className="flex-1 text-center rounded-lg py-1.5" style={{ backgroundColor: n <= 3 ? '#3A2416' : '#F3E9E1', fontSize: '0.38rem', color: n <= 3 ? '#DCC1B0' : '#7A665A' }}>{n}</div>
                  ))}
                </div>
                <p style={{ color: '#C8A882', fontSize: '0.4rem', textAlign: 'center' }}>Se næste råd →</p>
                <div style={{ borderTop: '1px solid #EDE4DB' }} className="pt-2">
                  <p style={{ color: '#2B1F16', fontSize: '0.55rem', fontWeight: 600, marginBottom: 4 }}>Tilbud</p>
                  <p style={{ color: '#7A665A', fontSize: '0.38rem' }}>Første præmie produkt i søjl...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KOM MED I KLUBBEN ── */}
      <section style={{ backgroundColor: '#EDE0CC' }}>
        <div className="flex flex-col lg:flex-row" style={{ minHeight: 380 }}>
          {/* Left photo */}
          <div className="lg:w-5/12 flex-shrink-0" style={{ minHeight: 320 }}>
            <img
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80"
              alt="Mor med barnevogn"
              className="w-full h-full object-cover"
              style={{ minHeight: 320 }}
            />
          </div>
          {/* Right text */}
          <div className="flex-1 flex flex-col justify-center px-12 py-14">
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-5" style={{ border: '1.5px solid #8A6245' }}>
              <Heart className="w-4 h-4" style={{ color: '#8A6245' }} />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 600, color: '#2B1F16', lineHeight: 1.2, marginBottom: '1rem' }}>
              Kom med i klubben
            </h2>
            <p style={{ color: '#5B3F2B', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 360, marginBottom: '0.75rem' }}>
              Wier en klub af forældre der støtter khamden. Dul dine splevelser, få råd og med negen der forstår dig — dag som net.
            </p>
            <p style={{ color: '#5B3F2B', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 360, marginBottom: '1.5rem', opacity: 0.85 }}>
              Fordi det besate fatsasssab opslåt, når man duker ane rartige oplevelser — og sod at man flike er alone om dom.
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#8A5C30', fontWeight: 400 }}>
              #ærlighedsfordereleret<span style={{ fontStyle: 'italic' }}>Rarity</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── DETTE FINDER DU I APPEN ── */}
      <section style={{ backgroundColor: '#FFFDF9', padding: '5rem 0' }}>
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 600, color: '#2B1F16', marginBottom: '0.5rem' }}>
              Dette finder du i appen
            </h2>
            <div style={{ fontSize: '1.5rem' }}>🌸</div>
          </div>
          <div className="grid grid-cols-3 gap-x-10 gap-y-10">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex flex-col gap-2.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EDE0CC' }}>
                  <f.icon className="w-5 h-5" style={{ color: '#5B3F2B' }} />
                </div>
                <p style={{ color: '#2B1F16', fontSize: '0.9rem', fontWeight: 600 }}>{f.title}</p>
                <p style={{ color: '#7A665A', fontSize: '0.8rem', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DU SKAL IKKE STÅ ALENE ── */}
      <section style={{ backgroundColor: '#A07848', padding: '5rem 0' }}>
        <div className="max-w-5xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-16">
          {/* Left text */}
          <div className="flex-1">
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.5rem', fontWeight: 600, color: '#2B1F16', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Du skal ikke stå<br />med det hele alene
            </h2>
            <p style={{ color: '#5B3F2B', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: 320, marginBottom: '2rem' }}>
              Tal med andre forældre, dur dine oplavisiter og felg dit barns usviikling. Clubnewven er med dig — i de sarere ajablikko og de gede.
            </p>
            <button onClick={handleLogin}
              className="px-7 py-3 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: '#3A2416', color: '#F5EFE9' }}>
              Bliv medlem
            </button>
          </div>

          {/* Right — two white cards */}
          <div className="flex-shrink-0 flex gap-4 items-start">
            {/* Chat card */}
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ width: 180, backgroundColor: '#FFFDF9' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2B1F16' }}>Det fællesskab</p>
              </div>
              <div className="p-3 flex flex-col gap-3">
                {[
                  { name: 'Olivert', msg: 'Det vill så alt at bare...', sub: 'dig.', avatar: '👩' },
                  { name: 'Creati', msg: 'hvod frem at gir', avatar: '👩‍🦱' },
                ].map((m, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3E9E1', fontSize: '0.7rem' }}>
                      {m.avatar}
                    </div>
                    <div className="flex-1 rounded-xl px-2.5 py-2" style={{ backgroundColor: '#F3E9E1' }}>
                      <p style={{ fontSize: '0.5rem', fontWeight: 600, color: '#5B3F2B', marginBottom: 2 }}>{m.name}</p>
                      <p style={{ fontSize: '0.44rem', color: '#7A665A' }}>{m.msg}</p>
                      {m.sub && <p style={{ fontSize: '0.44rem', color: '#7A665A' }}>{m.sub}</p>}
                    </div>
                  </div>
                ))}
                <button className="w-full rounded-xl py-2 text-center mt-1"
                  style={{ backgroundColor: '#C8A882', fontSize: '0.5rem', color: '#fff', fontWeight: 600 }}>
                  Bliv medlem
                </button>
              </div>
            </div>

            {/* Calendar card */}
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ width: 160, backgroundColor: '#FFFDF9' }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #F0E8DF' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2B1F16' }}>Kalender</p>
              </div>
              <div className="p-3">
                <div className="mb-2">
                  <div className="grid grid-cols-7 gap-px mb-1">
                    {['M','T','O','T','F','L','S'].map((d, i) => (
                      <div key={i} className="text-center" style={{ fontSize: '0.35rem', color: '#9A7A6A', fontWeight: 600 }}>{d}</div>
                    ))}
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28].map(d => (
                      <div key={d} className="text-center rounded-sm py-0.5"
                        style={{
                          fontSize: '0.32rem',
                          color: d === 18 ? '#fff' : '#5B3F2B',
                          backgroundColor: d === 18 ? '#C8A882' : [9,24].includes(d) ? '#F3E9E1' : 'transparent',
                          fontWeight: d === 18 ? 700 : 400
                        }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl px-2.5 py-2 mt-1" style={{ backgroundColor: '#F3E9E1' }}>
                  <p style={{ fontSize: '0.44rem', fontWeight: 600, color: '#5B3F2B', marginBottom: 2 }}>Continease til alt</p>
                  <p style={{ fontSize: '0.38rem', color: '#9A7A6A' }}>Rigshospitalet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#2B1F16', color: '#DCC1B0', padding: '4rem 0' }}>
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8A882' }}>
                  <Moon className="w-3.5 h-3.5 text-white" />
                </div>
                <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 600, color: '#F5EFE9' }}>
                  clubnosleep
                </span>
              </div>
              <p style={{ color: '#8A6A5A', fontSize: '0.82rem', lineHeight: 1.7, maxWidth: 220 }}>
                Din trygge havn som ny forælder — søvn, fællesskab og viden samlet ét sted.
              </p>
            </div>

            {/* Juridisk */}
            <div>
              <p style={{ color: '#6A5A50', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Juridisk
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setLegalModal('terms')} className="text-left text-sm" style={{ color: '#C8A882' }}>
                  Handelsbetingelser
                </button>
                <button onClick={() => setLegalModal('privacy')} className="text-left text-sm" style={{ color: '#C8A882' }}>
                  Privatlivspolitik
                </button>
              </div>
            </div>

            {/* Hent appen */}
            <div>
              <p style={{ color: '#6A5A50', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Hent appen
              </p>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-sm" style={{ color: '#C8A882' }}>App Store</a>
                <a href="#" className="text-sm" style={{ color: '#C8A882' }}>Google Play</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #3A2A1A', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#6A5A50', fontSize: '0.78rem' }}>© 2025 Clubnosleep · Alle rettigheder forbeholdes</p>
          </div>
        </div>
      </footer>

      {legalModal === 'terms' && <LegalModal type="terms" title="Handelsbetingelser" onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacy' && <LegalModal type="privacy" title="Privatlivspolitik" onClose={() => setLegalModal(null)} />}
    </div>
  );
}