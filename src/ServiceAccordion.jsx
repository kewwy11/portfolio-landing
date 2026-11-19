import React, { useId } from 'react';
import RevealHeading from './RevealHeading.jsx';
import RollingNumber from './RollingNumber.jsx';
import AccordionPanel from './AccordionPanel.jsx';
import './service-accordion.css';

export default function ServiceAccordion({ service, index, open = false, onToggle }) {
  const id = useId();
  const toggleId = `service-toggle-${id}`;
  const panelId = `service-panel-${id}`;

  return <article className={`service-accordion${open ? ' is-open' : ''}`}>
    <button
      id={toggleId}
      className="service-toggle number-hover"
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={`${String(index + 1).padStart(2, '0')} ${service.name}`}
      onClick={onToggle}
    >
      <span className="service-toggle-label">
        <span className="service-toggle-square" aria-hidden="true" />
        <RollingNumber value={String(index + 1).padStart(2, '0')} className="service-toggle-number" />
        <span>{service.name}</span>
      </span>
      <span className="service-toggle-icon" aria-hidden="true">
        <span className="service-icon-horizontal" />
        <span className="service-icon-vertical" />
      </span>
    </button>

    <AccordionPanel id={panelId} labelledBy={toggleId} open={open}>
        <div className="service-content">
          <div className={`service-visual service-visual-${service.id}`} aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}assets/${service.image}`} alt="" loading="lazy" />
          </div>
          <div className="service-content-copy">
            <RevealHeading as="h3" className="service-content-title" lines={service.title} />
            <div className="service-paragraphs">
              {service.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            </div>
          </div>
          <div className="service-milestones">
            <p className="service-milestones-label">Milestones</p>
            <ul>{service.milestones.map(milestone => <li key={milestone}>
              <span className="service-milestone-square" aria-hidden="true" />
              <span>{milestone}</span>
            </li>)}</ul>
          </div>
        </div>
    </AccordionPanel>
  </article>;
}
