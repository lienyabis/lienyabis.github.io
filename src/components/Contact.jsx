import { useState } from 'react';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';
import SectionHeading from './SectionHeading.jsx';
import { profile } from '../data/portfolio.js';

const initialForm = { name: '', email: '', subject: '', message: '' };

/**
 * Contact form.
 * There is no backend in this portfolio, so the form composes a pre-filled
 * e-mail in the visitor's own mail client - no data leaves the browser.
 */
export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (status !== 'idle') setStatus('idle');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = form.subject.trim() || `Portfolio enquiry from ${form.name.trim() || 'a visitor'}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      '',
      form.message.trim(),
    ].join('\n');

    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setStatus('sent');
  };

  const details = [
    { icon: 'mail', label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: 'phone', label: 'Mobile', value: profile.mobile, href: `tel:${profile.mobileHref}` },
    { icon: 'pin', label: 'Location', value: profile.location, href: '' },
  ];

  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something"
          highlight="together"
          description="I am open to web developer roles, Laravel/PHP projects and long-term collaborations. The fastest way to reach me is email or a call."
        />

        <div className="contact-grid">
          <Reveal className="contact-info">
            {details.map((detail) => (
              <div className="glass contact-item" key={detail.label}>
                <span className="contact-icon">
                  <Icon name={detail.icon} size={18} />
                </span>
                <span className="contact-text">
                  <em>{detail.label}</em>
                  {detail.href ? <a href={detail.href}>{detail.value}</a> : <strong>{detail.value}</strong>}
                </span>
              </div>
            ))}

            <div className="glass card-pad contact-cta">
              <h4 className="card-subtitle">
                <Icon name="download" size={16} /> Need the paperwork?
              </h4>
              <p className="card-note">Grab the full resume with the same details in PDF form.</p>
              <a className="btn btn-primary btn-sm" href={profile.resumeUrl} download>
                <Icon name="download" size={16} />
                <span>Download resume (PDF)</span>
              </a>
            </div>
          </Reveal>

          <Reveal className="glass card-pad contact-form-wrap" delay={120}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  <span>Your name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Jane Dela Cruz"
                    value={form.name}
                    onChange={update('name')}
                  />
                </label>
                <label>
                  <span>Your email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={update('email')}
                  />
                </label>
              </div>

              <label>
                <span>Subject</span>
                <input
                  type="text"
                  name="subject"
                  placeholder="Laravel developer role"
                  value={form.subject}
                  onChange={update('subject')}
                />
              </label>

              <label>
                <span>Message</span>
                <textarea
                  name="message"
                  rows="6"
                  required
                  placeholder="Tell me about the role or the project you have in mind..."
                  value={form.message}
                  onChange={update('message')}
                />
              </label>

              <div className="form-foot">
                <button type="submit" className="btn btn-primary">
                  <Icon name="mail" size={17} />
                  <span>Send message</span>
                </button>
                {status === 'sent' ? (
                  <span className="form-note">
                    <Icon name="check" size={15} /> Your mail app should now be open.
                  </span>
                ) : (
                  <span className="form-note">Opens your mail app - nothing is stored.</span>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
