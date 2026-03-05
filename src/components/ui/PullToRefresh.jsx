import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const threshold = 72;

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.5, threshold + 20));
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
    startY.current = null;
  }, [pullDistance, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const showing = pullDistance > 0 || refreshing;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: refreshing ? 56 : pullDistance > 0 ? pullDistance : 0 }}
      >
        <motion.div
          animate={{ rotate: refreshing ? 360 : progress * 360 }}
          transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
        >
          <RefreshCw
            className="w-5 h-5"
            style={{ color: `rgba(120,80,40,${progress})` }}
          />
        </motion.div>
      </div>
      {children}
    </div>
  );
}