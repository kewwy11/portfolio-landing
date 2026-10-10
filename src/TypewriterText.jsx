import React from 'react';
import useRevealOnScroll from './useRevealOnScroll.js';
import './typewriter.css';

const characterFade = 65;

export default function TypewriterText({ as: Tag = 'span', children, duration = 1800, active, className = '', style, ...props }) {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ threshold: 0.15 });
  const text = String(children);
  const characters = Array.from(text);
  const interval = Math.max(0, duration - characterFade) / Math.max(characters.length - 1, 1);
  const immediate = reducedMotion || typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function';
  const visible = active ?? revealed;

  return <Tag {...props} ref={ref} style={style} className={`typewriter-text${visible ? ' is-revealed' : ''}${immediate ? ' motion-disabled' : ''}${className ? ` ${className}` : ''}`}>
    <span className="typewriter-readable">{text}</span>
    <span className="typewriter-visual" aria-hidden="true">
      {characters.map((character, index) => /\s/.test(character) ? character :
        <span key={index} className="typewriter-character" data-character-index={index} style={{ '--character-delay': `${index * interval}ms` }}>{character}</span>)}
    </span>
  </Tag>;
}
