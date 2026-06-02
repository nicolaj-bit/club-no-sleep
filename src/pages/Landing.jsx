import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Moon, ArrowRight, Star } from 'lucide-react';
import LegalModal from '@/components/landing/LegalModal';

const FEATURES = [
  { emoji: '🌙', icon: Moon, title: 'Søvnrådgivning', desc: 'AI-baserede råd tilpasset præcis dit barns alder og søvnmønstre.' },
  { emoji: '🐯', title: 'Tigerspring', desc: 'Følg dit barns udviklingsspring og forstå de urolige perioder.' },
  { emoji: '📅', title: 'Kalender', desc: 'Hold styr på jordemoder, scanning og alle vigtige aftaler.' },
  { emoji: '👩‍👧', title: 'Fællesskab', desc: 'Mød mødre og fædre nær dig — også midt om natten.' },
  { emoji: '📖', title: 'Videnscenter', desc: 'Ekspertviden om graviditet, baby og det første år.' },
  { emoji: '🔔', title: 'Notifikationer', desc: 'Bliv mindet om vigtige milepæle og kommende aftaler.' },
];

const REVIEWS = [
  { name: 'Sofie M.', role: 'Mor til 6 måneder', text: 'Endelig en app der forstår, hvad det vil sige at være ny mor. Uundværlig!', stars: 5 },
  { name: 'Mette K.', role: 'Mor til 1 år', text: 'Søvnrådene har reddet os. Vores datter sover nu hele natten.', stars: 5 },
  { name: 'Thomas R.', role: 'Far til 4 måneder', text: 'Som far er det rart at have ét sted med al relevant info.', stars: 5 },
];

const STATS = [
  { value: '10.000+', label: 'Forældre i fællesskabet' },
  { value: '4.9★', label: 'App Store rating' },
  { value: '24/7', label: 'AI-søvnekspert online' },
];

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy'

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin('/app');
  const handleEnterApp = () => { window.location.href = '/app'; };

  return (
    <div style={{ backgroundColor: '#FAF6F1', color: '#2B1F16', fontFamily: 'Inter, sans-serif', minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: 'rgba(250,246,241,0.92)', borderBottom: '1px solid #EDE4DB', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
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
                className="hidden sm:block text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-20 pb-28 max-w-5xl mx-auto">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #DCC1B0, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #C8A882, transparent 70%)' }} />

        <div className="relative flex flex-col lg:flex-row items-center gap-12">
          {/* Left text */}
          <motion.div className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
              style={{ backgroundColor: '#F3E9E1', color: '#8A6245', border: '1px solid #DCC1B0' }}>
              🌙 Din trygge havn som ny forælder
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
              Søvn, fællesskab{' '}
              <span style={{ fontStyle: 'italic', color: '#B08D72' }}>& tryghed</span>{' '}
              som forælder
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: '#7A665A', maxWidth: 480 }}>
              Clubnosleep samler alt det vigtige — søvnrådgivning, tigerspring, kalender og et fællesskab af forældre der forstår dig.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button onClick={handleLogin}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold shadow-lg transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)', color: '#fff' }}>
                Bliv medlem <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={handleLogin}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-colors"
                style={{ backgroundColor: '#fff', color: '#5B3F2B', border: '1px solid #EDE4DB' }}>
                Log ind
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
              {STATS.map((s, i) => (
                <div key={i}>
                  <p className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#3A2A1A' }}>{s.value}</p>
                  <p className="text-xs" style={{ color: '#9A7A6A' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — phone mockup */}
          <motion.div className="flex-shrink-0"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 rounded-[3rem] blur-3xl opacity-40 scale-90"
                style={{ background: 'linear-gradient(160deg, #DCC1B0, #C8A882)' }} />
              {/* Phone */}
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl"
                style={{ width: 260, height: 520, background: 'linear-gradient(160deg, #3A2A1A 0%, #5B3F2B 50%, #8A6245 100%)' }}>
                {/* Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black opacity-80" />
                {/* Screen content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 pt-12">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                    <Moon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-bold text-2xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>clubnosleep</p>
                  <p className="text-white text-xs text-center opacity-60">Din app for nye forældre</p>
                  {/* Fake cards */}
                  <div className="w-full space-y-2 mt-4">
                    {['🌙 Søvnråd', '🐯 Tigerspring', '📅 Kalender'].map((item, i) => (
                      <div key={i} className="rounded-xl px-4 py-2.5 text-xs text-white"
                        style={{ background: 'rgba(255,255,255,0.12)' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20" style={{ backgroundColor: '#F3E9E1' }}>
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-3"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
              Alt hvad du har brug for
            </h2>
            <p className="text-sm" style={{ color: '#7A665A' }}>Bygget specielt til mødre og fædre i det første år</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 flex flex-col gap-3 transition-shadow hover:shadow-md"
                style={{ backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB' }}>
                <span className="text-3xl">{f.emoji}</span>
                <p className="font-semibold" style={{ color: '#2B1F16' }}>{f.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#7A665A' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-20 max-w-lg mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold mb-3"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
            Simpel og ærlig pris
          </h2>
          <p className="text-sm mb-10" style={{ color: '#7A665A' }}>Ingen bindingsperiode · Opsig når som helst</p>

          <div className="rounded-3xl overflow-hidden shadow-2xl">
            {/* Top gradient band */}
            <div className="py-8 px-8" style={{ background: 'linear-gradient(135deg, #5B3F2B, #8A6245)' }}>
              <p className="text-white text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Fuld adgang</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-6xl font-bold text-white leading-none">59</span>
                <div className="mb-1">
                  <span className="text-2xl text-white">kr.</span>
                  <span className="text-white opacity-60 text-sm block">/ måned</span>
                </div>
              </div>
            </div>

            {/* Feature list */}
            <div className="py-8 px-8" style={{ backgroundColor: '#FFFDF9' }}>
              <ul className="space-y-3 mb-8 text-left">
                {['Fuld søvnrådgivning med AI', 'Tigerspring & udviklingsguide', 'Kalender & påmindelser', 'Fællesskab & chat', 'Videnscenter med ekspertartikler', 'Ekspert booking'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: '#2B1F16' }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs"
                      style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <button onClick={handleLogin}
                className="w-full py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)', color: '#fff' }}>
                Bliv medlem nu
              </button>
              <p className="mt-3 text-xs" style={{ color: '#B08D72' }}>Ingen bindingsperiode · Opsig når som helst</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* REVIEWS */}
      <section className="px-6 py-20" style={{ backgroundColor: '#F3E9E1' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h2 className="text-4xl font-bold text-center mb-12"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Hvad siger forældrene?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 flex flex-col justify-between"
                style={{ backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB' }}>
                <div>
                  <div className="flex mb-4">
                    {Array(r.stars).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-current" style={{ color: '#C8A882' }} />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed mb-5" style={{ color: '#2B1F16' }}>"{r.text}"</p>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#5B3F2B' }}>{r.name}</p>
                  <p className="text-xs" style={{ color: '#B08D72' }}>{r.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="px-6 py-20">
        <motion.div className="max-w-2xl mx-auto rounded-3xl p-10 text-center shadow-xl"
          style={{ background: 'linear-gradient(135deg, #3A2A1A, #5B3F2B)' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-4xl mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#F5EFE9', fontWeight: 700 }}>
            Klar til at komme i gang?
          </p>
          <p className="text-sm mb-8 opacity-70" style={{ color: '#DCC1B0' }}>
            Slut dig til tusindvis af forældre der allerede bruger Clubnosleep.
          </p>
          <button onClick={handleLogin}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold mx-auto transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #C8A882, #8A6245)', color: '#fff' }}>
            Bliv medlem nu <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* DOWNLOAD */}
      <section className="px-6 pb-20 text-center">
        <h2 className="text-3xl font-bold mb-3"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
          Hent appen
        </h2>
        <p className="text-sm mb-8" style={{ color: '#7A665A' }}>Tilgængelig på iOS og Android</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {[
            { icon: '🍎', label: 'App Store', sub: 'Download fra' },
            { icon: '🤖', label: 'Google Play', sub: 'Hent fra' },
          ].map((s, i) => (
            <a key={i} href="#"
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#2B1F16', color: '#fff' }}>
              <span className="text-2xl">{s.icon}</span>
              <div className="text-left">
                <p className="text-xs opacity-60">{s.sub}</p>
                <p className="font-semibold text-sm">{s.label}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#2B1F16', color: '#DCC1B0' }} className="px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            {/* Brand */}
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

            {/* Links */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8A6A5A' }}>Juridisk</p>
              <button
                onClick={() => setLegalModal('terms')}
                className="text-sm text-left transition-colors hover:text-white"
                style={{ color: '#C8A882' }}>
                Handelsbetingelser
              </button>
              <button
                onClick={() => setLegalModal('privacy')}
                className="text-sm text-left transition-colors hover:text-white"
                style={{ color: '#C8A882' }}>
                Privatlivspolitik
              </button>
            </div>

            {/* App badges */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8A6A5A' }}>Hent appen</p>
              {[
                { icon: '🍎', label: 'App Store' },
                { icon: '🤖', label: 'Google Play' },
              ].map((s, i) => (
                <a key={i} href="#"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                  style={{ color: '#C8A882' }}>
                  <span>{s.icon}</span> {s.label}
                </a>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #3A2A1A' }} className="pt-6 text-center">
            <p className="text-xs" style={{ color: '#6A5A50' }}>© 2025 Clubnosleep · Alle rettigheder forbeholdes</p>
          </div>
        </div>
      </footer>

      {/* Legal modals */}
      {legalModal === 'terms' && (
        <LegalModal type="terms" title="Handelsbetingelser" onClose={() => setLegalModal(null)} />
      )}
      {legalModal === 'privacy' && (
        <LegalModal type="privacy" title="Privatlivspolitik" onClose={() => setLegalModal(null)} />
      )}
    </div>
  );
}