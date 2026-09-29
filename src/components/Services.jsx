import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { services } from '../data/portfolio.js';

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="What I do"
          title="Services built around"
          highlight="real client needs"
          description="Everything below comes straight from the work I have already delivered - no filler."
        />

        <div className="services-grid">
          {services.map((service, index) => (
            <Reveal key={service.title} className="glass service-card spotlight" delay={index * 80}>
              <span className="service-icon">
                <Icon name={service.icon} size={22} />
              </span>
              <h3 className="card-title">{service.title}</h3>
              <p>{service.text}</p>
              <span className="service-index mono">{String(index + 1).padStart(2, '0')}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
