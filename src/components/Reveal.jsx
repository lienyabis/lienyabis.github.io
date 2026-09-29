import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element once it scrolls into view.
 * Falls back to "always visible" when IntersectionObserver is unavailable
 * (or when the visitor prefers reduced motion).
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  y = 26,
  threshold = 0.15,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;
    // Drop the stagger delay once the entrance animation is done, otherwise it
    // would also delay hover transitions on the same element.
    const timeout = setTimeout(() => setSettled(true), delay + 850);
    return () => clearTimeout(timeout);
  }, [visible, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -70px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--reveal-y': `${y}px`,
        ...(settled ? null : { transitionDelay: `${delay}ms` }),
      }}
    >
      {children}
    </Tag>
  );
}
