import React, { useEffect, useState } from 'react';
import RevealHeading from './RevealHeading.jsx';
import TypewriterText from './TypewriterText.jsx';
import useRevealOnScroll from './useRevealOnScroll.js';

export default function LumisAnimatedHeading({ label, title, id, as = 'h2', lines, labelClassName = 'lumis-eyebrow', duration = 1400 }) {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ threshold: 0.15 });
  const [headingReady, setHeadingReady] = useState(false);

  useEffect(() => {
    if (!revealed) return undefined;
    if (reducedMotion) {
      setHeadingReady(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setHeadingReady(true), Math.max(0, duration - 250));
    return () => window.clearTimeout(timer);
  }, [revealed, reducedMotion, duration]);

  return <div className="lumis-animated-heading" ref={ref}>
    <TypewriterText as="p" className={labelClassName} active={revealed} duration={duration}>{label}</TypewriterText>
    <RevealHeading as={as} id={id} lines={lines} ready={headingReady}>{title}</RevealHeading>
  </div>;
}
