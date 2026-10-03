import React, { useId } from 'react';
import RevealHeading from './RevealHeading.jsx';
import './service-accordion.css';

export default function ServiceAccordion({ service, index, open = false, onToggle }) {
  const id = useId();
  const toggleId = `service-toggle-${id}`;
  const panelId = `service-panel-${id}`;

  return <article className={`service-accordion${open ? ' is-open' : ''}`}>
    <button
      id={toggleId}
      className="service-toggle"
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <span className="service-toggle-label">
        <span className="service-toggle-square" aria-hidden="true" />
        <span className="service-toggle-number">{String(index + 1).padStart(2, '0')}</span>
        <span>{service.name}</span>
      </span>
      <span className="service-toggle-icon" aria-hidden="true">
        <span className="service-icon-horizontal" />
        <span className="service-icon-vertical" />
      </span>
    </button>

    <div
      id={panelId}
      className="service-panel"
      role="region"
      aria-labelledby={toggleId}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="service-panel-clip">
        <div className="service-content">
          <div className="service-visual" aria-hidden="true" />
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
      </div>
    </div>
  </article>;
}
