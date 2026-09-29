import Icon from './Icon.jsx';
import ProfilePhoto from './ProfilePhoto.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { interests, profile } from '../data/portfolio.js';

const facts = [
  { icon: 'pin', label: 'Based in', value: profile.locationShort },
  { icon: 'briefcase', label: 'Focus', value: 'Laravel & PHP web applications' },
  { icon: 'code', label: 'Also builds with', value: 'React, Express.js, REST APIs' },
  { icon: 'bolt', label: 'Also good at', value: 'Data migration, client support' },
];

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="About me"
          title="Building software people"
          highlight="actually use"
          description="From requirement gathering and data migration to shipping the last bug fix - I have worked the whole lifecycle."
        />

        <div className="about-grid">
          <Reveal className="about-main glass card-pad">
            <h3 className="card-title">Full-stack, but grounded in delivery</h3>
            <p>{profile.summary}</p>

            <blockquote className="objective">
              <Icon name="quote" size={18} />
              <p>{profile.objective}</p>
            </blockquote>

            <div className="fact-list">
              {facts.map((fact) => (
                <div className="fact" key={fact.label}>
                  <span className="fact-icon">
                    <Icon name={fact.icon} size={16} />
                  </span>
                  <span>
                    <em>{fact.label}</em>
                    <strong>{fact.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="about-side" delay={140}>
            <div className="glass card-pad about-photo-card">
              <ProfilePhoto variant="card" />
            </div>

            <div className="glass card-pad interests">
              <h4 className="card-subtitle">
                <Icon name="sparkles" size={16} /> Interests
              </h4>
              <ul className="tag-cloud">
                {interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </div>

            <div className="glass card-pad education-mini">
              <h4 className="card-subtitle">
                <Icon name="cap" size={16} /> Quick facts
              </h4>
              <ul className="mini-list">
                <li>
                  <span>Education</span>
                  <strong>BS Information and Communications Technology</strong>
                </li>
                <li>
                  <span>School</span>
                  <strong>Cebu Technological University - Tuburan</strong>
                </li>
                <li>
                  <span>Graduated</span>
                  <strong>2020</strong>
                </li>
                <li>
                  <span>Experience</span>
                  <strong>2019 - present</strong>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
