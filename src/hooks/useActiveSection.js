import { useEffect, useRef, useState } from 'react';
import { subscribeScroll, getScrollState } from '../utils/scrollMetrics.js';

/**
 * Tracks which section is currently in view so the navbar can highlight it.
 *
 * This used to read `element.offsetTop` for every tracked section plus
 * `document.body.offsetHeight` on *every* scroll event, which forces a
 * synchronous layout each time the user moved the wheel. Now the offsets are
 * cached and only re-read when the shared scroll pipeline reports that the
 * document layout changed (`layoutVersion`), and state is only pushed when the
 * resolved section actually differs - so a normal scroll produces zero renders.
 */
export default function useActiveSection(ids, offset = 140) {
  const [active, setActive] = useState(ids[0]);
  const activeRef = useRef(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element) => Boolean(element));

    if (!elements.length) return undefined;

    // Cached geometry. `offsetTop` is a layout read, so it must never happen
    // inside the scroll callback itself.
    let tops = [];
    const measure = () => {
      tops = elements.map((element) => element.offsetTop);
    };
    measure();

    const resolve = (state) => {
      const probe = state.scrollY + offset + 1;
      let current = elements[0].id;

      for (let i = 0; i < tops.length; i += 1) {
        if (tops[i] <= probe) current = elements[i].id;
      }

      // Snap to the last section when the page is scrolled to the bottom.
      if (state.atBottom) current = elements[elements.length - 1].id;

      return current;
    };

    // Seed immediately so a reload that restores the scroll position does not
    // briefly highlight the first section.
    activeRef.current = resolve(getScrollState());
    setActive(activeRef.current);

    let seenVersion = getScrollState().layoutVersion;

    const update = (state) => {
      if (state.layoutVersion !== seenVersion) {
        seenVersion = state.layoutVersion;
        measure();
      }

      const next = resolve(state);
      if (next === activeRef.current) return;

      activeRef.current = next;
      setActive(next);
    };

    return subscribeScroll(update);
  }, [ids, offset]);

  return active;
}
