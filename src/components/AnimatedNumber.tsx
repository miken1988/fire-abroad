'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatter: (n: number) => string;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, formatter, duration = 600, className = '' }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    // Skip animation if values are the same or first render
    if (from === to) return;

    const startTime = performance.now();
    const diff = to - from;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplay(from + diff * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(to);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{formatter(display)}</span>;
}
