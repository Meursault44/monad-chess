import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { usePuzzleEffects } from '@/store/puzzleEffects.ts';

type Ripple = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dur: number;
};

type Props = {
  color?: string;
  size?: number;
  durationMs?: number;
  zIndex?: number;
};

const RippleLayer: React.FC<Props> = ({
  color = 'rgba(131,110,249,0.35)',
  size = 240,
  durationMs = 600,
  zIndex = 2,
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const { rippleSignal, resetRippleSignal } = usePuzzleEffects();

  const fireRipple = () => {
    const host = layerRef.current;
    if (!host) return;

    const rect = host.getBoundingClientRect();
    const x = 0;
    const y = 390;

    setRipples((arr) => [
      ...arr,
      {
        id: Date.now() + Math.random(),
        x,
        y,
        size,
        color,
        dur: durationMs,
      },
    ]);
  };

  useEffect(() => {
    if (rippleSignal > 0) {
      fireRipple();
    }
    return () => {
      if (rippleSignal > 0) {
        resetRippleSignal();
      }
    };
  }, [rippleSignal, fireRipple, resetRippleSignal]);

  return (
    <div
      ref={layerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex,
      }}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: r.dur / 1000, ease: 'easeOut' }}
          onAnimationComplete={() => setRipples((arr) => arr.filter((x) => x.id !== r.id))}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            marginLeft: -r.size / 2,
            marginTop: -r.size / 2,
            borderRadius: '9999px',
            background: r.color,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
};

export default RippleLayer;
