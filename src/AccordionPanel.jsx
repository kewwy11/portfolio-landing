import React from 'react';

export default function AccordionPanel({ id, labelledBy, open, children }) {
  return <div id={id} className="service-panel" role="region" aria-labelledby={labelledBy}
    aria-hidden={!open} inert={!open}>
    <div className="service-panel-clip">{children}</div>
  </div>;
}
