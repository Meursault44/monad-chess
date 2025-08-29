import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion'; // <- не из 'motion/react', а из 'motion'

type Props = {
  value: number; // целевое значение
  duration?: number; // секунды
  easing?: string; // 'easeOut', 'easeInOut', и т.д.
  format?: (n: number) => string; // как рисовать число (например, с разделителями)
  className?: string;
};

export const AnimatedNumber = ({
  value,
  duration = 0.6,
  easing = 'easeOut',
  format = (n) => String(n),
  className,
}: Props) => {
  const prevRef = useRef<number>(value);
  const [display, setDisplay] = useState<number>(value);

  useEffect(() => {
    const from = prevRef.current ?? 0;
    if (from === value) return;

    const controls = animate(from, value, {
      duration,
      easing,
      // округление до целого; поменяй на Math.trunc/toFixed по вкусу
      onUpdate: (v) => setDisplay(Math.round(v)),
    });

    prevRef.current = value;
    return () => controls?.stop();
  }, [value, duration, easing]);

  return <span className={className}>{format(display)}</span>;
};
