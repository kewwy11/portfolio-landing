import React, { useState } from 'react';
import { faqs } from './contact.js';
import RevealHeading from './RevealHeading.jsx';
import './faq.css';

const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;

export default function FaqSection() {
  const [activeId, setActiveId] = useState(null);
  return <section className="faq" aria-labelledby="faq-heading">
    <RevealHeading id="faq-heading">FAQ</RevealHeading>
    <div className="faq-list">
      {faqs.map(item => {
        const open = activeId === item.id;
        const toggleId = `faq-${item.id}-toggle`;
        const panelId = `faq-${item.id}-panel`;
        return <article className={`faq-item${open ? ' is-open' : ''}`} key={item.id} data-faq={item.id}>
          <button className="faq-toggle" id={toggleId} type="button" aria-expanded={open}
            aria-controls={panelId} onClick={() => setActiveId(previous => previous === item.id ? null : item.id)}>
            <span>{item.question}</span>
            <span className="faq-icon" aria-hidden="true">
              <img className="faq-plus" src={asset('faq-plus.svg')} alt="" />
              <img className="faq-minus" src={asset('faq-minus.svg')} alt="" />
            </span>
          </button>
          <div className="faq-panel" id={panelId} role="region" aria-labelledby={toggleId} aria-hidden={!open} inert={!open}>
            <div className="faq-panel-clip"><p className="faq-answer">{item.answer}</p></div>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
