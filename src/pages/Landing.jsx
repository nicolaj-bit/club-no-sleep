import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Moon, Heart, Baby, Users, Star, ChevronDown, ArrowRight } from 'lucide-react';

const FEATURES = [
  { emoji: '🌙', title: 'Søvnrådgivning', desc: 'AI-baserede søvnråd tilpasset dit barns alder og mønstre.' },
  { emoji: '📅', title: 'Kalender & aftaler', desc: 'Hold styr på jordemoder, scanning og alle dine aftaler.' },
  { emoji: '🐯', title: 'Tigerspring', desc: 'Følg dit barns udviklingsspring og forbedringsperioder.' },
  { emoji: '👩‍👧', title: 'Fællesskab', desc: 'Mød andre mødre og fædre tæt på dig.' },
  { emoji: '📖', title: 'Videnscenter', desc: 'Ekspertviden om graviditet, baby og det første år.' },
  { emoji: '🔔', title: 'Notifikationer', desc: 'Få besked om vigtige milepæle og kommende aftaler.' },
];

const REVIEWS = [
  { name: 'Sofie M.', role: 'Mor til 6 måneder', text: 'Endelig en app der forstår, hvad det vil sige at være ny mor. Uundværlig!', stars: 5 },
  { name: 'Mette K.', role: 'Mor til 1 år', text: 'Søvnrådene har reddet os. Vores datter sover nu hele natten.', stars: 5 },
  { name: 'Thomas R.', role: 'Far til 4 måneder', text: 'Som far er det rart at have et sted hvor man kan finde relevant info.', stars: 5 },
];

export default function Landing() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin('/app');
  };

  const handleEnterApp = () => {
    window.location.href = '/app';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF6F1', color: '#2B1F16', fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#FAF6F1', borderBottom: '1px solid #EDE4DB' }} className="sticky top-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5" style={{ color: '#B08D72' }} />
          <span className="text-lg font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#5B3F2B' }}>
            Clubnosleep
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAuth ? (
            <button
              onClick={handleEnterApp}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
            >
              Åbn app
            </button>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="text-sm font-medium px-4 py-2 rounded-xl"
                style={{ color: '#5B3F2B', border: '1px solid #EDE4DB', backgroundColor: '#fff' }}
              >
                Log ind
              </button>
              <button
                onClick={handleLogin}
                className="text-sm font-semibold px-4 py-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
              >
                Kom i gang
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 pt-16 pb-20 max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ backgroundColor: '#F3E9E1', color: '#B08D72', border: '1px solid #DCC1B0' }}>
            🌙 Din trygge havn som ny forælder
          </div>

          <h1 className="text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
            Søvn, samvær{' '}
            <span style={{ fontStyle: 'italic', color: '#B08D72' }}>& fællesskab</span>{' '}
            for nye forældre
          </h1>

          <p className="text-lg mb-10 leading-relaxed" style={{ color: '#7A665A' }}>
            Clubnosleep samler alt det vigtige ét sted — søvnrådgivning, tigerspring, kalender og et fællesskab af forældre der forstår dig.
          </p>

          {/* App mockup placeholder */}
          <div className="mx-auto mb-10 rounded-3xl overflow-hidden shadow-2xl"
            style={{ width: 280, height: 500, background: 'linear-gradient(160deg, #DCC1B0 0%, #C8A882 40%, #A0785A 100%)', position: 'relative' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
              <Moon className="w-16 h-16" style={{ color: '#fff' }} />
              <p className="text-white font-bold text-xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Clubnosleep</p>
              <p className="text-white text-sm text-center opacity-80">Din app for nye forældre</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #C8A882, #A0785A)', color: '#fff' }}
            >
              Start gratis <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold"
              style={{ backgroundColor: '#fff', color: '#5B3F2B', border: '1px solid #EDE4DB' }}
            >
              Log ind
            </button>
          </div>
          <p className="mt-4 text-xs" style={{ color: '#B08D72' }}>✓ 30 dages gratis prøveperiode · Opsig når som helst</p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16" style={{ backgroundColor: '#F3E9E1' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
            Alt hvad du har brug for
          </h2>
          <p className="text-center mb-10 text-sm" style={{ color: '#7A665A' }}>
            Bygget specielt til mødre og fædre i det første år
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-5 flex gap-4"
                style={{ backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB' }}
              >
                <span className="text-2xl flex-shrink-0">{f.emoji}</span>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#2B1F16' }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#7A665A' }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-6 py-16 max-w-lg mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
          Simpel og ærlig pris
        </h2>
        <p className="text-sm mb-8" style={{ color: '#7A665A' }}>Ingen bindingsperiode, ingen skjulte gebyrer</p>

        <div className="rounded-3xl p-8 shadow-xl"
          style={{ background: 'linear-gradient(160deg, #DCC1B0, #C8A882)', border: '1px solid #B08D72' }}>
          <p className="text-white text-sm font-semibold mb-1 uppercase tracking-widest opacity-80">Fuld adgang</p>
          <div className="flex items-end justify-center gap-1 mb-2">
            <span className="text-5xl font-bold text-white">59</span>
            <span className="text-2xl text-white mb-1">kr.</span>
            <span className="text-white opacity-70 mb-1">/ md.</span>
          </div>
          <p className="text-white text-xs opacity-70 mb-6">Først 30 dage gratis</p>

          <ul className="text-left space-y-2 mb-8">
            {['Fuld søvnrådgivning', 'Tigerspring & kalender', 'Fællesskab & chat', 'Videnscenter', 'Ekspert booking', 'Ubegrænset adgang'].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-white">
                <span className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-2xl font-semibold text-base"
            style={{ backgroundColor: '#fff', color: '#5B3F2B' }}
          >
            Start gratis i 30 dage
          </button>
        </div>

        <p className="mt-6 text-sm" style={{ color: '#7A665A' }}>
          Eller prøv den gratis demo-version med begrænset adgang
        </p>
        <button onClick={handleLogin} className="text-sm underline mt-1" style={{ color: '#B08D72' }}>
          Prøv demo gratis →
        </button>
      </section>

      {/* REVIEWS */}
      <section className="px-6 py-16" style={{ backgroundColor: '#F3E9E1' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
            Hvad siger forældrene?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-5"
                style={{ backgroundColor: '#FFFDF9', border: '1px solid #EDE4DB' }}
              >
                <div className="flex mb-3">
                  {Array(r.stars).fill(0).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" style={{ color: '#C8A882' }} />
                  ))}
                </div>
                <p className="text-sm italic mb-3 leading-relaxed" style={{ color: '#2B1F16' }}>"{r.text}"</p>
                <p className="text-xs font-semibold" style={{ color: '#5B3F2B' }}>{r.name}</p>
                <p className="text-xs" style={{ color: '#B08D72' }}>{r.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-3"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2B1F16' }}>
          Hent appen gratis
        </h2>
        <p className="text-sm mb-8" style={{ color: '#7A665A' }}>Tilgængelig på iOS og Android</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#"
            className="flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{ backgroundColor: '#2B1F16', color: '#fff' }}
          >
            <span className="text-2xl">🍎</span>
            <div className="text-left">
              <p className="text-xs opacity-60">Download fra</p>
              <p className="font-semibold text-sm">App Store</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{ backgroundColor: '#2B1F16', color: '#fff' }}
          >
            <span className="text-2xl">🤖</span>
            <div className="text-left">
              <p className="text-xs opacity-60">Hent fra</p>
              <p className="font-semibold text-sm">Google Play</p>
            </div>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 text-center" style={{ borderTop: '1px solid #EDE4DB' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <Moon className="w-4 h-4" style={{ color: '#B08D72' }} />
          <span className="font-semibold" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#5B3F2B' }}>Clubnosleep</span>
        </div>
        <p className="text-xs" style={{ color: '#B08D72' }}>© 2025 Clubnosleep · Alle rettigheder forbeholdes</p>
      </footer>
    </div>
  );
}