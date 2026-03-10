import { useState, useEffect, useRef } from 'react';

export function useScrollDirection(threshold = 10) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (currentY < 10) {
        setVisible(true);
      } else if (diff < -threshold) {
        setVisible(true);
      } else if (diff > threshold) {
        setVisible(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return visible;
}