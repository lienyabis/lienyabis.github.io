import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import TechLogo from './TechLogo.jsx';
import { levelLabels, skillGroups } from '../data/portfolio.js';

/* Decorative bar width per qualitative level (see data/portfolio.js). */
const levelWidth = { core: 100, strong: 76, working: 52 };

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Skills"
          title="The stack I"
          highlight="ship with"
          description="Grouped the way I actually use them - backend first, then the frontend, the data and the tools around it."
        />

        <div className="skills-grid">
          {skillGroups.map((group, groupIndex) => (
            <Reveal key={group.id} className="glass card-pad skill-card" delay={groupIndex * 110}>
              <header className="skill-head">
                <span className="skill-icon">
                  <Icon name={group.icon} size={20} />
                </span>
                <div>
                  <h3 className="card-title">{group.title}</h3>
                  <p className="card-note">{group.blurb}</p>
                </div>
              </header>

              <ul className="skill-list">
                {group.skills.map((skill, index) => (
                  <li key={skill.name}>
                    <div className="skill-row">
                      <TechLogo name={skill.name} size={16} className="skill-logo" />
                      <span className="skill-name">{skill.name}</span>
                      <span className={`level level-${skill.level}`}>{levelLabels[skill.level]}</span>
                    </div>
                    <span className="meter" aria-hidden="true">
                      <i
                        style={{
                          width: `${levelWidth[skill.level]}%`,
                          animationDelay: `${groupIndex * 110 + index * 60}ms`,
                        }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
