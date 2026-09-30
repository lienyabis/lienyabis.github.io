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

const getObserverBucket = (threshold) => {
  const cached = observerBuckets.get(threshold);
  if (cached) return cached;

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

  // The whole `{ observer, callbacks }` pair is stored and returned. Returning
  // only `observer` from here would make the caller destructure `undefined` for
  // both names, and the `callbacks.set(...)` on the next line would throw - which
  // unmounts the entire React tree and leaves a blank page.
  const bucket = { observer, callbacks };
  observerBuckets.set(threshold, bucket);
  return bucket;
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

    const { observer, callbacks } = getObserverBucket(threshold);

    const reveal = () => {
      callbacks.delete(el);
      observer.unobserve(el);
      setVisible(true);
    };

    callbacks.set(el, (entry) => {
      if (entry.isIntersecting) reveal();
    });

    observer.observe(el);

    /*
     * Safety net.
     *
     * `.reveal` starts at `opacity: 0`, so any trigger that fails to fire leaves
     * that content permanently invisible - which is exactly what a blank page
     * looks like on a phone. IntersectionObserver is the primary trigger, but it
     * is not sufficient on its own:
     *   - content inside a subtree the browser has skipped (the
     *     `content-visibility` rule in base.css) reports no intersection until
     *     the browser decides to render it, and on some mobile engines that
     *     decision never arrives for a section that is already on screen;
     *   - a restored scroll position can place an element inside the viewport
     *     before the observer is attached.
     * So we also test the element's own box, coalesced into one rAF, on scroll
     * and resize until it reveals. Two passive listeners, both removed the
     * moment it fires, so this costs nothing once the animation has played.
     */
    let frame = 0;
    let watching = true;

    const check = () => {
      frame = 0;
      if (!watching) return;
      const rect = el.getBoundingClientRect();
      // Matches the observer's `rootMargin: '0px 0px -70px 0px'`.
      if (rect.top - 70 < window.innerHeight && rect.bottom > 0) reveal();
    };

    const scheduleCheck = () => {
      if (watching && !frame) frame = requestAnimationFrame(check);
    };

    window.addEventListener('scroll', scheduleCheck, { passive: true });
    window.addEventListener('resize', scheduleCheck, { passive: true });
    // Covers an element that is already on screen at mount, where no scroll or
    // resize event is guaranteed to ever arrive.
    scheduleCheck();

    return () => {
      watching = false;
      window.removeEventListener('scroll', scheduleCheck);
      window.removeEventListener('resize', scheduleCheck);
      if (frame) cancelAnimationFrame(frame);
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
