import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import useActiveSection from '../hooks/useActiveSection.js';
import { navLinks, profile } from '../data/portfolio.js';

const sectionIds = navLinks.map((link) => link.id);

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const goTo = (id) => {
    setMenuOpen(false);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <nav className="nav container" aria-label="Main navigation">
          <button type="button" className="brand" onClick={() => goTo('home')}>
            <span className="brand-mark brand-avatar">
              <img src={profile.avatar} alt="" width="40" height="40" decoding="async" />
            </span>
            <span className="brand-text">
              <strong>{profile.name}</strong>
              <em>{profile.title}</em>
            </span>
          </button>

          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  className={`nav-link${active === link.id ? ' is-active' : ''}`}
                  onClick={() => goTo(link.id)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button
              type="button"
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>

            <button type="button" className="btn btn-primary btn-sm nav-cta" onClick={() => goTo('contact')}>
              <span>Hire me</span>
              <Icon name="arrowRight" size={16} />
            </button>

            <button
              type="button"
              className={`burger${menuOpen ? ' is-open' : ''}`}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        </nav>
      </header>

      <div className={`mobile-drawer${menuOpen ? ' is-open' : ''}`}>
        <ul>
          {navLinks.map((link, index) => (
            <li key={link.id} style={{ transitionDelay: `${index * 45}ms` }}>
              <button
                type="button"
                className={active === link.id ? 'is-active' : ''}
                onClick={() => goTo(link.id)}
              >
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <a className="btn btn-ghost drawer-resume" href={profile.resumeUrl} download>
          <Icon name="download" size={16} />
          <span>Download resume</span>
        </a>
      </div>
    </>
  );
}
