import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { education, interests, references } from '../data/portfolio.js';

export default function Education() {
  return (
    <section id="education" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Education & references"
          title="Where the"
          highlight="foundation came from"
          description="A BS in Information and Communications Technology, and colleagues who can vouch for the work."
        />

        <div className="education-grid">
          <Reveal className="glass card-pad education-card">
            <span className="education-icon">
              <Icon name="cap" size={24} />
            </span>
            {education.map((item) => (
              <div key={item.degree}>
                <h3 className="card-title">{item.degree}</h3>
                <p className="timeline-company">
                  <Icon name="pin" size={14} />
                  {item.school}
                </p>
                <p className="card-note mono">{item.period}</p>
                <p>{item.note}</p>
              </div>
            ))}

            <ul className="chip-list">
              {interests.slice(0, 5).map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="glass card-pad reference-card" delay={120}>
            <h3 className="card-subtitle">
              <Icon name="user" size={16} /> Reference
            </h3>
            {references.map((person) => (
              <div className="reference" key={person.email}>
                <span className="avatar" aria-hidden="true">
                  {person.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <strong className="reference-name">{person.name}</strong>
                  <em className="reference-role">
                    {person.role} · {person.company}
                  </em>
                  <div className="reference-links">
                    <a href={`mailto:${person.email}`}>
                      <Icon name="mail" size={14} />
                      {person.email}
                    </a>
                    <a href={`tel:+63${person.phone.replace(/^0/, '')}`}>
                      <Icon name="phone" size={14} />
                      {person.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
            <p className="card-note">
              Available on request - happy to share more references from recent client rollouts.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
