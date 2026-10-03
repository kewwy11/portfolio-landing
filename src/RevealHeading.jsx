import React from 'react';
import useRevealOnScroll from './useRevealOnScroll.js';

export default function RevealHeading({ as: Tag = 'h2', lines, children, className = '', ready = true, ...props }) {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ repeat: true, rootMargin: '0px' });
  const immediate = reducedMotion || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function';
  return <Tag {...props} ref={ref} className={`scroll-heading${revealed && ready ? ' is-revealed' : ''}${immediate ? ' motion-disabled' : ''}${className ? ` ${className}` : ''}`}>
    {(lines || [children]).map((line, index) => <span className="heading-mask" key={index}>
      <span className="heading-text" style={{ '--heading-delay': `${index * 200}ms` }}>{line}</span>
    </span>)}
  </Tag>;
}
