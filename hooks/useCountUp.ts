"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a displayed number toward `value` whenever it changes, instead of
 * snapping — used for the metric cards so slider drags read as live motion.
 */
export function useCountUp(value: number, durationMs = 500): number {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number>();
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number.isFinite(value) ? value : from;
    const start = performance.now();

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return Number.isFinite(value) ? display : value;
}
