import { techAliases, techInkOverrides } from '../data/techAliases.js';
import { techLogos } from '../data/techLogos.js';

const NEUTRAL = 'mark-unknown';

/** Accepts `4F5D95` or `#4F5D95` and returns a valid CSS colour. */
const ink = (hex) => (hex ? (hex.startsWith('#') ? hex : `#${hex}`) : null);

/** Resolve a display name ("Laravel Framework") to a logo slug ("laravel"). */
export function slugForTech(name) {
  if (!name) return null;
  return techAliases[String(name).trim().toLowerCase()] ?? null;
}

/**
 * Brand mark for a technology.
 *
 * The name is normally already visible next to the mark (skill rows, chips,
 * marquee), so the SVG is hidden from assistive tech by default - pass `label`
 * when the mark stands on its own.
 *
 * `src/data/techLogos.js` is generated from the names used in
 * `src/data/portfolio.js`; `npm run logos` refreshes it (also runs pre-build).
 */
export default function TechLogo({ name, slug, size = 18, className = '', label }) {
  const key = slug ?? slugForTech(name);
  const icon = (key && techLogos[key]) || techLogos[NEUTRAL];
  const override = key ? techInkOverrides[key] : undefined;
  const themed = override && typeof override === 'object';

  /* Ink is handed to CSS as a custom property so media.css can swap the
     light-theme value without React re-rendering on a theme change. */
  const style = { '--logo-ink': ink(themed ? override.dark : override) ?? `#${icon.hex}` };
  const light = themed ? ink(override.light) : null;
  if (light) style['--logo-ink-light'] = light;

  return (
    <svg
      className={`tech-logo${key ? '' : ' is-neutral'}${className ? ` ${className}` : ''}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={icon.path} fillRule={icon.fillRule} />
    </svg>
  );
}
