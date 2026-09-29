import Icon from './Icon.jsx';
import { navLinks, profile } from '../data/portfolio.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-mark brand-avatar">
            <img src={profile.avatar} alt="" width="40" height="40" loading="lazy" decoding="async" />
          </span>
          <div>
            <strong>{profile.name}</strong>
            <em>{profile.title}</em>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              onClick={() =>
                document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="footer-social">
          <a href={`mailto:${profile.email}`} aria-label="Email">
            <Icon name="mail" size={17} />
          </a>
          <a href={`tel:${profile.mobileHref}`} aria-label="Call">
            <Icon name="phone" size={17} />
          </a>
          <a href={profile.resumeUrl} download aria-label="Download resume">
            <Icon name="download" size={17} />
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          &copy; {year} {profile.name}. Built with React, Vite and a lot of coffee.
        </p>
        <p className="mono">{profile.locationShort}</p>
      </div>
    </footer>
  );
}
