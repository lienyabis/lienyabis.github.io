import { useEffect, useState } from 'react';

/**
 * Tracks which section is currently in view so the navbar can highlight it.
 */
export default function useActiveSection(ids, offset = 140) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element) => Boolean(element));

    if (!elements.length) return undefined;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset + 1;
      let current = elements[0].id;

      elements.forEach((element) => {
        if (element.offsetTop <= scrollPosition) current = element.id;
      });

      // Snap to the last section when the page is scrolled to the bottom.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
        current = elements[elements.length - 1].id;
      }

      setActive(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [ids, offset]);

  return active;
}
