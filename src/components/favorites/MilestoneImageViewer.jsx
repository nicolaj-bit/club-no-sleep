import React, { useState, useRef } from 'react';
import { X, Share2, Download } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/LanguageContext';
import { saveMilestonePhotoToLibrary } from '@/lib/savePhotoToLibrary';

// Fuldskærmsvisning af favorit-milepælsbilleder — næsten sort baggrund (også i lys
// tilstand), object-fit: contain, knib-zoom, og strygning mellem billederne.
export default function MilestoneImageViewer({ items, initialIndex, onClose }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const gesture = useRef({});

  // Samme vagtpost som gemme-funktionen selv bruger — «Gem» vises kun når det
  // native billed-plugin faktisk er tilgængeligt (afventer ny app-butik-build).
  const canSave = Capacitor.isNativePlatform();
  const item = items[index];

  const resetZoom = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const goTo = (newIndex) => {
    if (newIndex < 0 || newIndex >= items.length) return;
    setIndex(newIndex);
    resetZoom();
  };

  const touchDistance = (touches) => {
    const [a, b] = touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      gesture.current = { pinching: true, startDist: touchDistance(e.touches), startScale: scale };
    } else if (e.touches.length === 1) {
      gesture.current = {
        pinching: false,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTranslate: { ...translate },
        panning: scale > 1,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && gesture.current.pinching) {
      const newDist = touchDistance(e.touches);
      const next = Math.min(4, Math.max(1, gesture.current.startScale * (newDist / gesture.current.startDist)));
      setScale(next);
    } else if (e.touches.length === 1 && gesture.current.startX !== undefined) {
      const dx = e.touches[0].clientX - gesture.current.startX;
      const dy = e.touches[0].clientY - gesture.current.startY;
      if (gesture.current.panning) {
        setTranslate({ x: gesture.current.startTranslate.x + dx, y: gesture.current.startTranslate.y + dy });
      } else {
        gesture.current.dx = dx;
        gesture.current.dy = dy;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!gesture.current.pinching && scale <= 1 && gesture.current.dx !== undefined) {
      const { dx = 0, dy = 0 } = gesture.current;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx < 0 ? index + 1 : index - 1);
      }
    }
    if (scale < 1) resetZoom();
    gesture.current = {};
  };

  const handleShare = async () => {
    const shareText = t.milestoneShareText.replace('{headline}', item.item_title || '');
    try {
      const blob = await (await fetch(item.item_image)).blob();
      const file = new File([blob], `lalatoto-${item.id}.jpg`, { type: blob.type || 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: item.item_title, text: shareText });
      } else if (navigator.share) {
        await navigator.share({ title: item.item_title, text: shareText });
      } else {
        const a = document.createElement('a');
        a.href = item.item_image;
        a.download = `lalatoto-${item.id}.jpg`;
        a.click();
        toast.info(t.milestoneShareNotSupported);
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      toast.error(t.milestoneShareError);
    }
  };

  const handleSave = () => saveMilestonePhotoToLibrary(item.item_image);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: '#050505' }}>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-4 safe-top">
        <button onClick={onClose} aria-label={t.close} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          {canSave && (
            <button onClick={handleSave} aria-label={t.save} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Download className="w-5 h-5 text-white" />
            </button>
          )}
          <button onClick={handleShare} aria-label={t.milestoneShare} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Billede — object-contain, knib-zoom + strygning */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={item.id}
          src={item.item_image}
          alt={item.item_title}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: gesture.current.pinching ? 'none' : 'transform 0.05s linear',
          }}
          draggable={false}
        />
      </div>

      {/* Titel + dato — blødt oven på billedet med forløbning, som i milepæls-forhåndsvisningen */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-16 safe-bottom pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}
      >
        <h2 className="font-display text-xl font-medium text-white leading-snug">{item.item_title}</h2>
        {item.item_date && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.item_date}</p>}
      </div>
    </div>
  );
}