import { useEffect, useRef } from 'react';
import TechLogo from './TechLogo.jsx';
import { techMarquee } from '../data/portfolio.js';

/** Travel speed in px/s. The duration is measured at runtime from the real
 *  strip width, so the speed stays identical on every screen size. */
const PIXELS_PER_SECOND = 110;

/**
 * Infinite, edge-faded tech strip.
 *
 * The list is rendered as *two identical groups* instead of one flat list. The
 * track is then exactly 2x a group, which makes `translate3d(-50%)` land on
 * the exact start of the second copy - the loop is seamless. The old flat
 * version had `padding-inline` plus N-1 gaps in the width, so -50% overshot by
 * the padding and the strip visibly jumped once per cycle.
 */
export default function Marquee() {
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group) return undefined;

    const apply = () => {
      const width = group.getBoundingClientRect().width;
      if (width <= 0) return;
      track.style.setProperty(
        '--marquee-duration',
        `${(width / PIXELS_PER_SECOND).toFixed(2)}s`,
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(group);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="marquee" aria-label="Technologies I work with">
      <div className="marquee-track" ref={trackRef}>
        {[0, 1].map((copy) => (
          <div
            className="marquee-group"
            key={copy}
            ref={copy === 0 ? groupRef : undefined}
            aria-hidden={copy === 1 ? 'true' : undefined}
          >
            {techMarquee.map((tech) => (
              <span className="marquee-item" key={tech}>
                <TechLogo name={tech} size={18} />
                <span>{tech}</span>
                <i aria-hidden="true" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
