import Reveal from './Reveal.jsx';

/**
 * Consistent section header: small eyebrow label, big title, short lead-in.
 * `highlight` is rendered with the gradient accent.
 */
export default function SectionHeading({ eyebrow, title, highlight, description, align = 'center' }) {
  return (
    <Reveal className={`section-heading align-${align}`}>
      <span className="eyebrow">
        <i aria-hidden="true" />
        {eyebrow}
      </span>
      <h2 className="section-title">
        {title} {highlight ? <span className="text-gradient">{highlight}</span> : null}
      </h2>
      {description ? <p className="section-lead">{description}</p> : null}
    </Reveal>
  );
}
