import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * SwipeBackGesture — global iOS-style "tilbage"-gestus.
 *
 * Aktiveres når brugeren starter et touch inden for de yderste ~25px af venstre
 * skærmkant og swiper mod højre (mindst ~80px vandret, og mere vandret end lodret).
 * Navigerer ét skridt tilbage i historikken via navigate(-1).
 *
 * Ignorerer:
 *  - Sider hvor tilbage-navigation ikke giver mening (login, onboarding)
 *  - Når der ikke er noget at gå tilbage til (history.length <= 1)
 *  - Almindelige scroll/touches midt på skærmen
 */
const EDGE_THRESHOLD = 25;      // px fra venstre kant for at starte
const SWIPE_DISTANCE = 80;       // min px vandret for at udløse
const EXCLUDED_PATHS = ['/Onboarding', '/AcceptInvite'];

export default function SwipeBackGesture() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchRef = useRef(null);

  useEffect(() => {
    const excluded = EXCLUDED_PATHS.some(p => location.pathname.startsWith(p));
    if (excluded) return;

    const onTouchStart = (e) => {
      // Kun single-touch
      if (e.touches.length !== 1) {
        touchRef.current = null;
        return;
      }
      const touch = e.touches[0];
      if (touch.clientX <= EDGE_THRESHOLD) {
        touchRef.current = { startX: touch.clientX, startY: touch.clientY };
      } else {
        touchRef.current = null;
      }
    };

    const onTouchEnd = (e) => {
      if (!touchRef.current) return;
      const start = touchRef.current;
      touchRef.current = null;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - start.startX;
      const dy = touch.clientY - start.startY;

      // Skal være en swipe mod højre, mere vandret end lodret
      if (dx >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
        // Kun hvis der er noget at gå tilbage til
        if (window.history.length > 1) {
          navigate(-1);
        }
      }
    };

    const onTouchCancel = () => {
      touchRef.current = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [location.pathname, navigate]);

  return null;
}