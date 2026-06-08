import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Moon, BookOpen, Users, Calendar, Bell, Zap, Heart, ShoppingBag, Lightbulb, MessageCircle, Star } from 'lucide-react';
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
    <div style={{ backgroundColor: '#EFE4D4', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: 'rgba(239,228,212,0.92)', borderBottom: '1px solid #DDD0C0', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)' }}>
            <Moon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#3A2A1A' }}>
            clubnosleep
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAuth ? (
            <button onClick={handleEnterApp}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)', color: '#fff' }}>
              Åbn app →
            </button>
          ) : (
            <>
              <button onClick={handleLogin}
                className="hidden sm:block text-sm font-medium px-4 py-2 rounded-xl"
                style={{ color: '#5B3F2B' }}>
                Log ind
              </button>
              <button onClick={handleLogin}
                className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)', color: '#fff' }}>
                Bliv medlem
              </button>
            </>
          )}
        </div>
      </nav>

      {/* CARD CONTAINER */}
      <div className="max-w-2xl mx-auto my-8 px-4">
        <div className="rounded-3xl overflow-hidden shadow-xl" style={{ backgroundColor: '#FFFCF8' }}>

          {/* ── 1. HERO ── */}
          <section className="px-8 pt-10 pb-8" style={{ backgroundColor: '#FFFCF8' }}>
            <div className="flex items-start gap-6">
              {/* Left */}
              <div className="flex-1 min-w-0">
                <div className="text-lg mb-3">🌙</div>
                <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.9rem', fontWeight: 600, lineHeight: 1.25, color: '#2B1F16' }}>
                  Til dig, der er vågen,<br />
                  <em style={{ color: '#5B3F2B' }}>når resten af verden sover.</em>
                </h1>
                <div className="flex items-center gap-1.5 mt-3 mb-1">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C8A882' }}>
                    <Star className="w-2 h-2 text-white fill-white" />
                  </div>
                </div>
                <p className="text-sm leading-relaxed mt-2" style={{ color: '#7A665A', maxWidth: 280 }}>
                  Du er ikke alene i de lange nætter. Der er en app, som holder dig med selskab, giver dig råd og forbinder dig med andre forældre i samme situation.
                </p>
                <p className="text-xs font-semibold mt-3 mb-4" style={{ color: '#5B3F2B', letterSpacing: '0.05em' }}>
                  <span style={{ color: '#8A6245' }}>CLUBNOSLEEP</span> — din app til de første år som forælder. Til søvn, viden og fællesskab.
                </p>
                <button onClick={handleLogin}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)', color: '#fff' }}>
                  Bliv medlem
                </button>
              </div>

              {/* Right — phone mockup */}
              <div className="flex-shrink-0 flex gap-2 items-end">
                {/* Phone 1 */}
                <div className="rounded-2xl overflow-hidden shadow-lg" style={{ width: 90, height: 160, background: 'linear-gradient(160deg, #4A3020 0%, #7A5235 100%)' }}>
                  <div className="flex flex-col gap-1.5 p-3 h-full">
                    <div className="rounded-lg p-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                      <p className="text-white text-xs font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.5rem' }}>clubnosleep</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.38rem' }}>Godmorgen ☀️</p>
                    </div>
                    {['Søvnråd', 'Tigerspring', 'Fællesskab'].map((t, i) => (
                      <div key={i} className="rounded-md px-2 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#DCC1B0', fontSize: '0.38rem' }}>{t}</p>
                      </div>
                    ))}
                    <div className="mt-auto rounded-lg p-1.5 flex items-center gap-1" style={{ backgroundColor: 'rgba(200,168,130,0.3)' }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C8A882' }} />
                      <div>
                        <p style={{ color: '#DCC1B0', fontSize: '0.35rem' }}>Ny besked</p>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.3rem' }}>Sara delte...</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Phone 2 */}
                <div className="rounded-2xl overflow-hidden shadow-lg" style={{ width: 90, height: 140, background: '#FFFCF8', border: '1px solid #EDE4DB' }}>
                  <div className="p-2.5 h-full flex flex-col gap-1.5">
                    <p style={{ color: '#2B1F16', fontSize: '0.45rem', fontWeight: 600 }}>Min søvnlog</p>
                    <div className="grid grid-cols-2 gap-1">
                      {[['🌙','Sengetid','20:30'],['⭐','Sov','21:15'],['☀️','Vågnet','06:45'],['💤','Total','9t']].map(([e,l,v], i) => (
                        <div key={i} className="rounded-md p-1.5" style={{ backgroundColor: '#F3E9E1' }}>
                          <p style={{ fontSize: '0.5rem' }}>{e}</p>
                          <p style={{ color: '#7A665A', fontSize: '0.3rem' }}>{l}</p>
                          <p style={{ color: '#5B3F2B', fontSize: '0.35rem', fontWeight: 600 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. KOM MED I KLUBBEN ── */}
          <section className="flex" style={{ backgroundColor: '#E8CEAE', minHeight: 220 }}>
            {/* Left photo */}
            <div className="w-5/12 flex-shrink-0" style={{ minHeight: 220 }}>
              <img
                src="https://images.unsplash.com/photo-1602928309370-35b74ef2c3ef?w=400&q=80"
                alt="Mor med barnevogn"
                className="w-full h-full object-cover"
                style={{ minHeight: 220 }}
              />
            </div>
            {/* Right text */}
            <div className="flex-1 p-7 flex flex-col justify-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(91,63,43,0.15)' }}>
                <Heart className="w-3 h-3" style={{ color: '#5B3F2B' }} />
              </div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 600, color: '#2B1F16', lineHeight: 1.2 }}>
                Kom med i klubben
              </h2>
              <p className="text-xs leading-relaxed mt-3" style={{ color: '#5B3F2B', maxWidth: 260 }}>
                Vi er en klub af forældre der støtter hinanden. Del dine oplevelser, få råd og mød nogen der forstår dig — dag som nat.
              </p>
              <p className="text-xs leading-relaxed mt-2" style={{ color: '#5B3F2B', maxWidth: 260, opacity: 0.85 }}>
                Fordi det bedste fællesskab opstår, når man deler sine ærlige oplevelser — og ved at man ikke er alene om dem.
              </p>
              <p className="mt-5" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1rem', color: '#7A4F2B', fontWeight: 400 }}>
                #ærlighedsfordereleretRarity
              </p>
            </div>
          </section>

          {/* ── 3. FEATURES ── */}
          <section className="px-8 py-10" style={{ backgroundColor: '#FFFCF8' }}>
            <div className="text-center mb-6">
              <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 600, color: '#2B1F16' }}>
                Dette finder du i appen
              </h2>
              <div className="text-base mt-1">🌸</div>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-5">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #DCC1B0, #C8A882)' }}>
                    <f.icon className="w-4 h-4" style={{ color: '#5B3F2B' }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: '#2B1F16' }}>{f.title}</p>
                  <p style={{ color: '#7A665A', fontSize: '0.68rem', lineHeight: 1.4 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. DU SKAL IKKE STÅ ALENE ── */}
          <section className="px-8 py-10" style={{ backgroundColor: '#DEB98A' }}>
            <div className="flex gap-6 items-center">
              {/* Left text */}
              <div className="flex-1 min-w-0">
                <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6rem', fontWeight: 600, color: '#2B1F16', lineHeight: 1.2 }}>
                  Du skal ikke stå<br />med det hele alene
                </h2>
                <p className="text-xs leading-relaxed mt-3" style={{ color: '#5B3F2B', maxWidth: 220 }}>
                  Tal med andre forældre, del dine oplevelser og følg dit barns udvikling. Clubnosleep er med dig — i de svære øjeblikke og de gode.
                </p>
                <button onClick={handleLogin}
                  className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#5B3F2B', color: '#F5EFE9' }}>
                  Bliv medlem
                </button>
              </div>

              {/* Right — app mockups */}
              <div className="flex-shrink-0 flex gap-2 items-start">
                {/* Chat mockup */}
                <div className="rounded-2xl overflow-hidden shadow-md" style={{ width: 110, backgroundColor: '#FFFCF8', border: '1px solid #EDE4DB' }}>
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid #EDE4DB' }}>
                    <p style={{ fontSize: '0.45rem', fontWeight: 600, color: '#2B1F16' }}>Dét fællesskab</p>
                  </div>
                  <div className="p-2.5 flex flex-col gap-2">
                    {[
                      { name: 'Sara M.', msg: 'Har prøvet dette råd...', time: '09:14', avatar: '👩' },
                      { name: 'Maria K.', msg: 'Det virkede for os!', time: '09:22', avatar: '👩‍🦱' },
                    ].map((m, i) => (
                      <div key={i} className="flex gap-1.5 items-start">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs"
                          style={{ backgroundColor: '#F3E9E1' }}>
                          <span style={{ fontSize: '0.55rem' }}>{m.avatar}</span>
                        </div>
                        <div className="flex-1 rounded-lg px-2 py-1" style={{ backgroundColor: '#F3E9E1' }}>
                          <p style={{ fontSize: '0.35rem', fontWeight: 600, color: '#5B3F2B' }}>{m.name}</p>
                          <p style={{ fontSize: '0.32rem', color: '#7A665A' }}>{m.msg}</p>
                        </div>
                      </div>
                    ))}
                    <button className="w-full rounded-lg py-1 mt-1 text-center"
                      style={{ backgroundColor: '#C8A882', fontSize: '0.38rem', color: '#fff' }}>
                      Skriv besked
                    </button>
                  </div>
                </div>

                {/* Calendar mockup */}
                <div className="rounded-2xl overflow-hidden shadow-md" style={{ width: 100, backgroundColor: '#FFFCF8', border: '1px solid #EDE4DB' }}>
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid #EDE4DB' }}>
                    <p style={{ fontSize: '0.45rem', fontWeight: 600, color: '#2B1F16' }}>Kalender</p>
                  </div>
                  <div className="p-2.5">
                    <div className="grid grid-cols-7 gap-0.5 mb-2">
                      {['M','T','O','T','F','L','S'].map((d, i) => (
                        <div key={i} className="text-center" style={{ fontSize: '0.3rem', color: '#9A7A6A' }}>{d}</div>
                      ))}
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                        <div key={d} className="text-center rounded-sm py-0.5"
                          style={{
                            fontSize: '0.3rem',
                            color: d === 12 ? '#fff' : '#5B3F2B',
                            backgroundColor: d === 12 ? '#C8A882' : d === 8 || d === 19 ? '#F3E9E1' : 'transparent',
                            fontWeight: d === 12 ? 700 : 400
                          }}>
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg px-2 py-1" style={{ backgroundColor: '#F3E9E1' }}>
                      <p style={{ fontSize: '0.32rem', fontWeight: 600, color: '#5B3F2B' }}>Scanning kl. 10:30</p>
                      <p style={{ fontSize: '0.28rem', color: '#9A7A6A' }}>Rigshospitalet</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* FOOTER — uændret */}
      <footer style={{ backgroundColor: '#2B1F16', color: '#DCC1B0' }} className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)' }}>
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#F5EFE9' }}>
                  clubnosleep
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#9A7A6A' }}>
                Din trygge havn som ny forælder — søvn, fællesskab og viden samlet ét sted.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8A6A5A' }}>Juridisk</p>
              <button onClick={() => setLegalModal('terms')} className="text-sm text-left transition-colors hover:text-white" style={{ color: '#C8A882' }}>
                Handelsbetingelser
              </button>
              <button onClick={() => setLegalModal('privacy')} className="text-sm text-left transition-colors hover:text-white" style={{ color: '#C8A882' }}>
                Privatlivspolitik
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8A6A5A' }}>Hent appen</p>
              {['App Store', 'Google Play'].map((label, i) => (
                <a key={i} href="#" className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#C8A882' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #3A2A1A' }} className="pt-6 text-center">
            <p className="text-xs" style={{ color: '#6A5A50' }}>© 2025 Clubnosleep · Alle rettigheder forbeholdes</p>
          </div>
        </div>
      </footer>

      {legalModal === 'terms' && <LegalModal type="terms" title="Handelsbetingelser" onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacy' && <LegalModal type="privacy" title="Privatlivspolitik" onClose={() => setLegalModal(null)} />}
    </div>
  );
}