import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import TechLogo from './TechLogo.jsx';
import { experience } from '../data/portfolio.js';

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Experience"
          title="Four roles, one"
          highlight="clear progression"
          description="I moved from building pages, to implementing software for clients, to leading implementations and finally shipping web applications."
        />

        <ol className="timeline">
          {experience.map((job, index) => (
            <Reveal as="li" key={`${job.role}-${job.period}`} className="timeline-item" delay={index * 110}>
              <span className="timeline-marker" aria-hidden="true">
                <i />
              </span>

              <div className="glass card-pad timeline-card">
                <div className="timeline-top">
                  <div>
                    <h3 className="card-title">{job.role}</h3>
                    <p className="timeline-company">
                      <Icon name="briefcase" size={14} />
                      {job.company}
                    </p>
                  </div>
                  <span className="timeline-period mono">
                    <Icon name="calendar" size={13} />
                    {job.period}
                  </span>
                </div>

                {job.companyNote ? <p className="card-note">{job.companyNote}</p> : null}
                <p className="timeline-summary">{job.summary}</p>

                <ul className="check-list">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>
                      <Icon name="check" size={14} />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <ul className="chip-list">
                  {job.stack.map((tech) => (
                    <li key={tech}>
                      <TechLogo name={tech} size={14} />
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
