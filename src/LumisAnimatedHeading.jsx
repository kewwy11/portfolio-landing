import React from 'react';
import useRevealOnScroll from './useRevealOnScroll.js';

export default function LumisAnimatedHeading({ label, title, id, as: Tag = 'h2', lines, labelClassName = 'lumis-eyebrow' }) {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ threshold: 0.15 });
  const immediate = reducedMotion || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function';

  return <div ref={ref} className={`lumis-animated-heading${revealed ? ' is-revealed' : ''}${immediate ? ' motion-disabled' : ''}`}>
    <p className={`${labelClassName} lumis-label-mask`}><span className="lumis-label-text">{label}</span></p>
    <Tag id={id} className="lumis-slide-heading">
      {(lines || [title]).map((line, index) => <span className="heading-mask" key={index}><span className="heading-text">{line}</span></span>)}
    </Tag>
  </div>;
}
