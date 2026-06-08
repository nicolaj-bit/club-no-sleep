import React, { useState, useRef } from 'react';

const features = [
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><ellipse cx="24" cy="28" rx="9" ry="11" /><path d="M18 17c0-5 3-9 6-9s6 4 6 9" /><path d="M13 33c-2 1.5-4 4-4 7" /><path d="M35 33c2 1.5 4 4 4 7" /><circle cx="21" cy="26" r="1.5" fill="#8B6A50" stroke="none" /><circle cx="27" cy="26" r="1.5" fill="#8B6A50" stroke="none" /><path d="M21 31 q3 2.5 6 0" /></svg>,
    title: 'Graviditeten uge for uge',
    desc: 'Modtag ugentlige opdateringer om baby, kroppen og alt hvad der ellers følger med graviditeten inklusiv et lille skriv til din partner samt kærlige forslag til \u201det lille næste skridt\u201d.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><rect x="10" y="14" width="28" height="22" rx="3" /><path d="M10 21h28" /><path d="M17 10v8M31 10v8" /><path d="M17 28l4 4 10-8" /></svg>,
    title: 'Milepæle',
    desc: 'Bliv mindet om din babys milepæle og forevig de store øjeblikke med fine stickers og datoer, lige til at hente ned på din telefon.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><circle cx="24" cy="27" r="12" /><path d="M20 21 q-5-8 2-13 q1 6 7 6 q4-4 6 0 q-6 2-6 8" /><circle cx="20" cy="28" r="1.5" fill="#8B6A50" stroke="none" /><circle cx="28" cy="28" r="1.5" fill="#8B6A50" stroke="none" /><path d="M20 32 q4 3 8 0" /></svg>,
    title: 'Tigerspring',
    desc: 'Få besked når din baby nærmer sig et udviklingsspring. Bliv klogere på dit barns udvikling og læs hvordan du bedst muligt hjælper dit barn, når verden bliver større.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><path d="M24 10 C14 10 10 18 10 24 C10 33 17 38 24 42 C31 38 38 33 38 24 C38 18 34 10 24 10Z" /><path d="M19 26 h10M24 21 v10" /></svg>,
    title: 'Et lys i mørket',
    desc: 'Se hvor mange andre mødre som er vågne om natten, præcis ligesom dig. Så føles stilheden lidt mindre ensom.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><path d="M14 38 C14 30 18 23 24 21 C24 21 22 15 28 13 C26 19 30 21 33 17 C35 23 31 27 28 29 C33 29 38 32 38 38" /><path d="M10 38 h28" /><ellipse cx="24" cy="37" rx="9" ry="3" /></svg>,
    title: 'Babyvenlige caféer',
    desc: 'Find hyggelige kaffesteder anbefalet af andre mødre, hvor der er plads til barnevogn, babylyde og krummer på gulvet.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><rect x="8" y="12" width="32" height="26" rx="3" /><path d="M8 20h32" /><path d="M16 8v8M32 8v8" /><rect x="14" y="26" width="6" height="6" rx="1" /><rect x="22" y="26" width="6" height="6" rx="1" /><rect x="30" y="26" width="6" height="6" rx="1" /></svg>,
    title: 'Kalender',
    desc: 'Hold styr på jordemodertider, lægebesøg, aktiviteter og andre vigtige datoer, og del kalenderen (og ansvaret) med en partner.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><path d="M32 12 L20 36" /><path d="M16 30 L20 36 L26 34" /><path d="M26 12 C26 12 36 14 34 22" /></svg>,
    title: 'Søvnlog',
    desc: 'Registrér babys nattesøvn, dagslure og opvågninger og modtag feedback fra AI søvnvejleder.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><path d="M8 33 C8 21 16 13 28 13 C34 13 39 17 39 23 C39 31 31 37 22 37 L9 42 Z" /><circle cx="19" cy="25" r="1.5" fill="#8B6A50" stroke="none" /><circle cx="26" cy="25" r="1.5" fill="#8B6A50" stroke="none" /><circle cx="33" cy="25" r="1.5" fill="#8B6A50" stroke="none" /></svg>,
    title: 'Fællesskab',
    desc: 'Ræk ud til en mor, der sidder vågen, præcis ligesom dig. Måske begynder et venskab netop der, hvor natten ellers føles mest stille.',
  },
  {
    icon: <svg viewBox="0 0 48 48" fill="none" stroke="#8B6A50" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 34, height: 34 }}><rect x="8" y="8" width="32" height="32" rx="4" /><path d="M16 24 l6 6 12-12" /></svg>,
    title: 'Din app dine valg',
    desc: 'Tilpas din hjemmeskærm, vælg selv om du ønsker at invitere en partner (gratis), del kun det, du ønsker, og vælg det farvetema, der føles bedst for dig.',
  },
];

function FeatureCard({ f }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{ width: 74, height: 74, borderRadius: '50%', backgroundColor: '#EBD8C4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {f.icon}
      </div>
      <div style={{ paddingTop: 5 }}>
        <p style={{ color: '#1E140A', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3 }}>{f.title}</p>
        <p style={{ color: '#7A665A', fontSize: '0.78rem', lineHeight: 1.72, margin: 0 }}>{f.desc}</p>
      </div>
    </div>
  );
}

export default function FeaturesList() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (Math.abs(dx) > 40 && dy < 60) {
      if (dx < 0 && activeSlide < features.length - 1) setActiveSlide(i => i + 1);
      if (dx > 0 && activeSlide > 0) setActiveSlide(i => i - 1);
    }
    touchStartX.current = null;
  };

  return (
    <>
      {/* Desktop: 3-col grid */}
      <div className="lnd-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem 3.5rem' }}>
        {features.map((f, i) => <FeatureCard key={i} f={f} />)}
      </div>

      {/* Mobile: swipe carousel */}
      <div className="lnd-features-carousel" style={{ display: 'none' }}>
        {/* Slide */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            backgroundColor: '#F9F2EB',
            borderRadius: 20,
            padding: '2rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
            minHeight: 180,
          }}
        >
          <FeatureCard f={features[activeSlide]} />
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: '1.2rem' }}>
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              style={{
                width: i === activeSlide ? 20 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i === activeSlide ? '#8B6A50' : '#D4BEA8',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.25s ease, background-color 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Prev / Next arrows */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: '1rem' }}>
          <button
            onClick={() => setActiveSlide(i => Math.max(0, i - 1))}
            disabled={activeSlide === 0}
            style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #C8A882', backgroundColor: 'transparent', color: '#8B6A50', fontSize: '1.1rem', cursor: 'pointer', opacity: activeSlide === 0 ? 0.3 : 1, transition: 'opacity 0.2s' }}
          >‹</button>
          <span style={{ color: '#9A7A6A', fontSize: '0.78rem', alignSelf: 'center' }}>{activeSlide + 1} / {features.length}</span>
          <button
            onClick={() => setActiveSlide(i => Math.min(features.length - 1, i + 1))}
            disabled={activeSlide === features.length - 1}
            style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid #C8A882', backgroundColor: 'transparent', color: '#8B6A50', fontSize: '1.1rem', cursor: 'pointer', opacity: activeSlide === features.length - 1 ? 0.3 : 1, transition: 'opacity 0.2s' }}
          >›</button>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .lnd-features-grid { display: none !important; }
          .lnd-features-carousel { display: block !important; }
        }
      `}</style>
    </>
  );
}