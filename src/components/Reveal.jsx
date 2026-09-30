import { useEffect, useRef, useState } from 'react';

/**
 * One IntersectionObserver for every Reveal on the page.
 *
 * Reveal is used ~34 times, and each instance used to construct its own
 * observer. Observers are not free: each one is registered with the compositor
 * and evaluated on every frame the page is visible, so dozens of them add up to
 * work that grows with the size of the document.
 *
 * Observers are bucketed by `threshold` so callers that ask for a different
 * trigger ratio still get exactly the semantics they asked for. The per-element
 * callbacks live in a WeakMap, so an unmounted element is collectable and its
 * entry is dropped on unobserve.
 */
const observerBuckets = new Map();

const getObserver = (threshold) => {
  let bucket = observerBuckets.get(threshold);
  if (bucket) return bucket.observer;

  const callbacks = new WeakMap();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const callback = callbacks.get(entry.target);
        if (callback) callback(entry);
      }
    },
    { threshold, rootMargin: '0px 0px -70px 0px' },
  );

  bucket = { observer, callbacks };
  observerBuckets.set(threshold, bucket);
  return observer;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    // would also delay hover transitions on the same element. This is also
    // what releases the `will-change` hint - see the class list below.
    const timeout = setTimeout(() => setSettled(true), delay + 850);
    return () => clearTimeout(timeout);
  }, [visible, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      setSettled(true);
      return undefined;
    }

    const { observer, callbacks } = getObserver(threshold);

    callbacks.set(el, (entry) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      // One-shot: stop observing as soon as it has been revealed.
      observer.unobserve(entry.target);
    });

    observer.observe(el);
    return () => {
      callbacks.delete(el);
      observer.unobserve(el);
    };
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={
        `reveal${visible ? ' is-visible' : ''}${settled ? ' is-settled' : ''}` +
        `${className ? ` ${className}` : ''}`
      }
      style={{
        '--reveal-y': `${y}px`,
        ...(settled ? null : { transitionDelay: `${delay}ms` }),
      }}
    >
      {children}
    </Tag>
  );
}
