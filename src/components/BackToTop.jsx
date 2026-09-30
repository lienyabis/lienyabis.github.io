import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { subscribeScroll } from '../utils/scrollMetrics.js';

/** Floating "back to top" button, shown once the visitor scrolls down. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    return subscribeScroll((state) => {
      const next = state.scrollY > 700;
      if (next === visibleRef.current) return;

      visibleRef.current = next;
      setVisible(next);
    });
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="arrowUp" size={18} />
    </button>
  );
}
