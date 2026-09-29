import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import TechLogo from './TechLogo.jsx';
import { projects } from '../data/portfolio.js';

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Projects"
          title="Systems I have"
          highlight="co-developed"
          description="Five production systems: membership, messaging, queueing, budgets and accounting. Live links are shown where they are publicly reachable."
        />

        <div className="projects-grid">
          {projects.map((project, index) => (
            <Reveal
              key={project.id}
              className={`glass project-card spotlight accent-${project.accent}`}
              delay={index * 90}
            >
              <div className="project-top">
                <span className="project-number mono">{project.number}</span>
                <span className={`status status-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>

              <h3 className="card-title">{project.title}</h3>
              <p className="project-client">
                <Icon name="briefcase" size={14} />
                {project.client}
              </p>
              <p>{project.description}</p>

              <ul className="check-list compact">
                {project.contributions.map((item) => (
                  <li key={item}>
                    <Icon name="check" size={13} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <ul className="chip-list">
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <TechLogo name={tech} size={14} />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>

              <div className="project-links">
                {project.url ? (
                  <a className="link" href={project.url} target="_blank" rel="noreferrer noopener">
                    <Icon name="external" size={15} />
                    <span>{project.urlLabel}</span>
                  </a>
                ) : (
                  <span className="link is-muted">
                    <Icon name="close" size={15} />
                    <span>{project.urlLabel}</span>
                  </span>
                )}

                {project.extraUrl ? (
                  <a
                    className="link link-alt"
                    href={project.extraUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name="external" size={15} />
                    <span>console</span>
                  </a>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
