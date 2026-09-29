import TechLogo from './TechLogo.jsx';
import { profile } from '../data/portfolio.js';

/** Marks shown under the name - the stack a visitor should remember. */
const HIGHLIGHT_STACK = ['PHP', 'Laravel', 'React', 'Express.js', 'MySQL'];

/**
 * The profile photo, used twice: as the hero centrepiece and as the About card.
 * `variant="hero"` is eager + high priority (it is the largest contentful paint),
 * the card variant lazy-loads.
 */
export default function ProfilePhoto({ variant = 'hero' }) {
  const isHero = variant === 'hero';

  return (
    <figure className={`profile profile-${variant}`}>
      <div className="profile-shot">
        <span className="profile-halo" aria-hidden="true" />
        <span className="profile-ring" aria-hidden="true" />

        <img
          className="profile-img"
          src={profile.avatar}
          alt={profile.avatarAlt}
          width="560"
          height="560"
          loading={isHero ? 'eager' : 'lazy'}
          fetchPriority={isHero ? 'high' : 'auto'}
          decoding="async"
        />
        <span className="profile-sheen" aria-hidden="true" />
      </div>

      <figcaption className="profile-meta">
        <span className="profile-status">
          <span className="pulse-dot" />
          {profile.availability}
        </span>

        <strong className="profile-name">{profile.name}</strong>
        <span className="profile-role mono">&lt;/&gt; {profile.title}</span>

        <ul className="profile-stack">
          {HIGHLIGHT_STACK.map((tech) => (
            <li key={tech}>
              <TechLogo name={tech} size={15} />
              <span>{tech}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
