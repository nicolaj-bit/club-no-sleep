import React, { useState, useRef, useEffect } from 'react';
import { Baby, Award, Zap, Lightbulb, Coffee, Calendar, Moon, MessageCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ICON_SIZE = 110;
const ICON_COLOR = "#5B3A28";
const ICON_STROKE = 1.5;
const CIRCLE_SIZE = 90;

const features = [
  {
    key: 'graviditet',
    icon: <Baby size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Graviditeten uge for uge',
    desc: 'Modtag ugentlige opdateringer om baby, kroppen og alt hvad der ellers følger med graviditeten inklusiv et lille skriv til din partner samt kærlige forslag til \u201det lille næste skridt\u201d.',
  },
  {
    key: 'milepæle',
    icon: <Award size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Milepæle',
    desc: 'Bliv mindet om din babys milepæle og forevig de store øjeblikke med fine stickers og datoer, lige til at hente ned på din telefon.',
  },
  {
    key: 'tigerspring',
    icon: <Zap size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Tigerspring',
    desc: 'Få besked når din baby nærmer sig et udviklingsspring. Bliv klogere på dit barns udvikling og læs hvordan du bedst muligt hjælper dit barn, når verden bliver større.',
  },
  {
    key: 'lys',
    icon: <Lightbulb size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Et lys i mørket',
    desc: 'Se hvor mange andre mødre som er vågne om natten, præcis ligesom dig. Så føles stilheden lidt mindre ensom.',
  },
  {
    key: 'caféer',
    icon: <Coffee size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Babyvenlige caféer',
    desc: 'Find hyggelige kaffesteder anbefalet af andre mødre, hvor der er plads til barnevogn, babylyde og krummer på gulvet.',
  },
  {
    key: 'kalender',
    icon: <Calendar size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Kalender',
    desc: 'Hold styr på jordemodertider, lægebesøg, aktiviteter og andre vigtige datoer, og del kalenderen (og ansvaret) med en partner.',
  },
  {
    key: 'søvn',
    icon: <Moon size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Søvnlog',
    desc: 'Registrér babys nattesøvn, dagslure og opvågninger og modtag feedback fra AI søvnvejleder.',
  },
  {
    key: 'fællesskab',
    icon: <MessageCircle size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Fællesskab',
    desc: 'Ræk ud til en mor, der sidder vågen, præcis ligesom dig. Måske begynder et venskab netop der, hvor natten ellers føles mest stille.',
  },
  {
    key: 'valg',
    icon: <CheckCircle2 size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    title: 'Din app dine valg',
    desc: 'Tilpas din hjemmeskærm, vælg selv om du ønsker at invitere en partner (gratis), del kun det, du ønsker, og vælg det farvetema, der føles bedst for dig.',
  },
];

function FeatureCard({ f, imageUrl }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
      <div style={{
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: '50%',
        backgroundColor: '#E8D9CC',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt={f.title} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
        ) : f.icon}
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
  const [iconMap, setIconMap] = useState({});

  useEffect(() => {
    base44.entities.AppConfig.filter({ key: 'landing_feature_icons' }).then(results => {
      if (results?.[0]?.feature_icons) {
        const map = {};
        results[0].feature_icons.forEach(f => { if (f.url) map[f.key] = f.url; });
        setIconMap(map);
      }
    }).catch(() => {});
  }, []);

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
        {features.map((f, i) => <FeatureCard key={i} f={f} imageUrl={iconMap[f.key]} />)}
      </div>

      {/* Mobile: swipe carousel */}
      <div className="lnd-features-carousel" style={{ display: 'none' }}>
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
          <FeatureCard f={features[activeSlide]} imageUrl={iconMap[features[activeSlide].key]} />
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