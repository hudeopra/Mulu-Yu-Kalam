'use client';

import { useEffect, useState, useRef } from 'react';

export interface CounterProps {
  target: number;
  label: string;
  colorClass: string;
  bgClass: string;
  duration?: number;
}

export function AnimatedCounter({
  target,
  label,
  colorClass,
  bgClass,
  duration = 2000,
}: CounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 },
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOut * target);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [hasAnimated, target, duration]);

  return (
    <div
      ref={ref}
      className={`text-center py-6 px-8 rounded-xl shadow-lg border border-black/5 transition-transform duration-300 hover:-translate-y-1 ${colorClass} ${bgClass}`}
    >
      <div className="text-4xl lg:text-5xl font-extrabold mb-2 tracking-tight">
        +{count}
      </div>
      <span className="block font-bold tracking-[3px] text-sm md:text-base uppercase">
        {label}
      </span>
    </div>
  );
};
