import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';

/** Floating "back to top" button, shown once the visitor scrolls down. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
