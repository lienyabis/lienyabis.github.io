import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 up to `target` the first time the element becomes visible.
 */
export default function useCountUp(target, duration = 1400) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setValue(target);
      return undefined;
    }

    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return;
          started = true;
          const startTime = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // easeOutCubic keeps the count from feeling mechanical
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) frame = requestAnimationFrame(tick);
          };

          frame = requestAnimationFrame(tick);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  return { ref, value };
}
