import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import CodeCard from './CodeCard.jsx';
import Marquee from './Marquee.jsx';
import ProfilePhoto from './ProfilePhoto.jsx';
import TechLogo from './TechLogo.jsx';
import { profile, stats } from '../data/portfolio.js';
import useCountUp from '../hooks/useCountUp.js';

/** Types each role in and out, one character at a time. */
function useTypewriter(words, { typeSpeed = 65, deleteSpeed = 34, hold = 1500 } = {}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];
    let timeout;

    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), hold);
    } else if (deleting && text === '') {
      setDeleting(false);
      setIndex((current) => (current + 1) % words.length);
    } else {
      timeout = setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteSpeed : typeSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, hold]);

  return text;
}

function Stat({ value, suffix, label, delay }) {
  const { ref, value: current } = useCountUp(value);
  return (
    <div className="stat" ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <span className="stat-value">
        {current}
        <em>{suffix}</em>
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Hero() {
  const typed = useTypewriter(profile.roles);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="home" className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="pill">
            <span className="pulse-dot" />
            {profile.availability}
          </span>

          <p className="hero-hello mono">Hi, I am</p>
          <h1 className="hero-title">
            {profile.firstName}
            <span className="text-gradient"> Sibay</span>
          </h1>

          <p className="hero-role">
            <span className="mono role-tag">&lt;/&gt;</span>
            <span className="typed">{typed}</span>
            <span className="caret" aria-hidden="true" />
          </p>

          <p className="hero-tagline">{profile.tagline}</p>

          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={() => scrollTo('projects')}>
              <Icon name="bolt" size={17} />
              <span>View my work</span>
            </button>
            <a className="btn btn-ghost" href={profile.resumeUrl} download>
              <Icon name="download" size={17} />
              <span>Download resume</span>
            </a>
          </div>

          <ul className="hero-chips">
            <li>
              <a href={`mailto:${profile.email}`}>
                <Icon name="mail" size={15} />
                {profile.email}
              </a>
            </li>
            <li>
              <a href={`tel:${profile.mobileHref}`}>
                <Icon name="phone" size={15} />
                {profile.mobile}
              </a>
            </li>
            <li>
              <span>
                <Icon name="pin" size={15} />
                {profile.locationShort}
              </span>
            </li>
          </ul>

          <div className="hero-stats">
            {stats.map((stat, index) => (
              <Stat key={stat.label} {...stat} delay={index * 90} />
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <ProfilePhoto />

          <div className="float-badge float-badge-1 glass">
            <TechLogo name="React" size={17} />
            <span>
              <strong>React</strong>
              <em>component frontends</em>
            </span>
          </div>
          <div className="float-badge float-badge-2 glass">
            <TechLogo name="Express.js" size={17} />
            <span>
              <strong>Express.js</strong>
              <em>REST APIs, JWT secured</em>
            </span>
          </div>

          <CodeCard />
        </div>
      </div>

      <Marquee />
    </section>
  );
}
