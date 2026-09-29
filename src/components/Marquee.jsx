import TechLogo from './TechLogo.jsx';
import { techMarquee } from '../data/portfolio.js';

/** Infinite, edge-faded tech strip. */
export default function Marquee() {
  const items = [...techMarquee, ...techMarquee];

  return (
    <div className="marquee" aria-label="Technologies I work with">
      <div className="marquee-track">
        {items.map((tech, index) => (
          <span className="marquee-item" key={`${tech}-${index}`}>
            <TechLogo name={tech} size={18} />
            <span>{tech}</span>
            <i aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
