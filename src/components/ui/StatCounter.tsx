"use client";

import { useEffect, useRef, useState } from "react";

type StatCounterProps = {
  value: string;
};

function getNumericValue(value: string) {
  const match = value.match(/^(~?)(\d+)$/);
  return match ? { prefix: match[1], number: Number(match[2]) } : null;
}

export function StatCounter({ value }: StatCounterProps) {
  const numericValue = getNumericValue(value);
  const [displayValue, setDisplayValue] = useState(numericValue ? `${numericValue.prefix}0` : value);
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!numericValue || !counterRef.current) return;

    const element = counterRef.current;
    const revealFinalValue = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplayValue(value);
        return;
      }

      const duration = 850;
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(`${numericValue.prefix}${Math.round(numericValue.number * easedProgress)}`);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        revealFinalValue();
        observer.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [numericValue, value]);

  return <span ref={counterRef}>{displayValue}</span>;
}
