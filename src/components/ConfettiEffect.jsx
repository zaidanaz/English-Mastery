import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Triggers a confetti burst at the given position.
 * Respects prefers-reduced-motion.
 */
export function useConfetti() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const triggerConfetti = (opts = {}) => {
    if (prefersReducedMotion) return;
    confetti({
      particleCount: opts.particleCount || 80,
      spread: opts.spread || 60,
      origin: opts.origin || { x: 0.5, y: 0.6 },
      colors: ['#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#A78BFA'],
      zIndex: 9998,
      disableForReducedMotion: true,
    });
  };

  const triggerStreakConfetti = () => {
    if (prefersReducedMotion) return;
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#6C63FF'],
      zIndex: 9998,
      disableForReducedMotion: true,
    });
  };

  return { triggerConfetti, triggerStreakConfetti };
}

/**
 * Shake animation component (for wrong answers).
 */
export function ShakeWrapper({ trigger, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger || !ref.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    ref.current.style.animation = 'none';
    ref.current.offsetHeight; // reflow
    ref.current.style.animation = 'shake 0.4s ease';
  }, [trigger]);

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
      <div ref={ref}>{children}</div>
    </>
  );
}
