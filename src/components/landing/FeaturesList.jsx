import React, { useState, useRef, useEffect } from 'react';
import { Baby, Award, Zap, Lightbulb, Coffee, Calendar, Moon, MessageCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/ui/LanguageContext';

const ICON_SIZE = 110;
const ICON_COLOR = "#5B3A28";
const ICON_STROKE = 1.5;
const CIRCLE_SIZE = 90;

const features = [
  {
    key: 'graviditet',
    icon: <Baby size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featPregnancyTitle',
    descKey: 'featPregnancyDesc',
  },
  {
    key: 'milepæle',
    icon: <Award size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featMilestonesTitle',
    descKey: 'featMilestonesDesc',
  },
  {
    key: 'tigerspring',
    icon: <Zap size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featWonderWeeksTitle',
    descKey: 'featWonderWeeksDesc',
  },
  {
    key: 'lys',
    icon: <Lightbulb size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featNightLightTitle',
    descKey: 'featNightLightDesc',
  },
  {
    key: 'caféer',
    icon: <Coffee size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featCafesTitle',
    descKey: 'featCafesDesc',
  },
  {
    key: 'kalender',
    icon: <Calendar size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featCalendarTitle',
    descKey: 'featCalendarDesc',
  },
  {
    key: 'søvn',
    icon: <Moon size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featSleepLogTitle',
    descKey: 'featSleepLogDesc',
  },
  {
    key: 'fællesskab',
    icon: <MessageCircle size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featCommunityTitle',
    descKey: 'featCommunityDesc',
  },
  {
    key: 'valg',
    icon: <CheckCircle2 size={ICON_SIZE} color={ICON_COLOR} strokeWidth={ICON_STROKE} />,
    titleKey: 'featChoicesTitle',
    descKey: 'featChoicesDesc',
  },
];

function FeatureCard({ f, imageUrl, t }) {
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
          <img src={imageUrl} alt={t[f.titleKey]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : f.icon}
      </div>
      <div style={{ paddingTop: 5 }}>
        <p style={{ color: '#1E140A', fontSize: '0.88rem', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.3 }}>{t[f.titleKey]}</p>
        <p style={{ color: '#7A665A', fontSize: '0.78rem', lineHeight: 1.72, margin: 0 }}>{t[f.descKey]}</p>
      </div>
    </div>
  );
}

export default function FeaturesList() {
  const { t } = useLanguage();
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
        {features.map((f, i) => <FeatureCard key={i} f={f} imageUrl={iconMap[f.key]} t={t} />)}
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
          <FeatureCard f={features[activeSlide]} imageUrl={iconMap[features[activeSlide].key]} t={t} />
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