import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './talk-button.css';

// Keep the Figma fill and label sequence on a continuous, reversible clock.
const DURATION = 650;
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const at = milliseconds => milliseconds / DURATION;

export default function TalkButton({ children = 'Let’s talk', type = 'submit', className = '', disabled = false,
  onPointerEnter, onPointerLeave, onFocus, onBlur, ...props }) {
  const buttonRef = useRef(null);
  const fillRef = useRef(null);
  const labelRef = useRef(null);
  const animationsRef = useRef([]);
  const [hovered, setHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const active = !disabled && (hovered || keyboardFocused);
  const immediate = reducedMotion || typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function';
  const immediateRef = useRef(immediate);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = event => setReducedMotion(event.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => () => {
    animationsRef.current.forEach(animation => animation.cancel());
  }, []);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const fill = fillRef.current;
    const label = labelRef.current;
    if (!button || !fill || !label) return;
    const wasImmediate = immediateRef.current;
    immediateRef.current = immediate;
    if (immediate) {
      animationsRef.current.forEach(animation => animation.cancel());
      animationsRef.current = [];
      return;
    }
    if (!active && !animationsRef.current.length) return;

    if (!animationsRef.current.length) {
      const tokens = getComputedStyle(button);
      const pink = tokens.getPropertyValue('--pink').trim();
      const palePink = tokens.getPropertyValue('--pale-pink').trim();
      const timing = { duration: DURATION, easing: 'linear', fill: 'both' };
      const fillAnimation = fill.animate([
        { offset: 0, opacity: 0, '--talk-sweep': '180deg', easing: EASE },
        { offset: at(180), opacity: 1 },
        { offset: at(430), '--talk-sweep': '360deg' },
        { offset: 1, opacity: 1, '--talk-sweep': '360deg' },
      ], timing);
      const labelAnimation = label.animate([
        { offset: 0, color: pink, transform: 'translateY(0px)', easing: EASE },
        { offset: at(300), color: pink, transform: 'translateY(30px)', easing: EASE },
        // Change color while the label is below the button's clipping edge.
        { offset: at(300.001), color: palePink },
        { offset: 1, color: palePink, transform: 'translateY(0px)' },
      ], timing);
      fillAnimation.id = 'talk-fill';
      labelAnimation.id = 'talk-label';
      animationsRef.current = [fillAnimation, labelAnimation];
      animationsRef.current.forEach(animation => {
        animation.pause();
        animation.currentTime = wasImmediate && active ? DURATION : 0;
      });
      if (wasImmediate) return;
    }

    const animations = animationsRef.current;
    const position = Math.max(0, Math.min(DURATION, animations[0].currentTime ?? 0));
    const rate = active ? 1 : -1.25;
    const atTarget = active ? position === DURATION : position === 0;
    const clock = document.timeline.currentTime;
    animations.forEach(animation => {
      // Reuse both tracks: interruptions never reset the visible fill or label.
      animation.pause();
      animation.currentTime = position;
      animation.playbackRate = rate;
      if (!atTarget) {
        animation.play();
        animation.startTime = clock - position / rate;
      }
    });
  }, [active, immediate]);

  return <button {...props} ref={buttonRef} type={type} disabled={disabled}
    className={`talk-button${active ? ' is-active' : ''}${immediate ? ' motion-disabled' : ''}${className ? ` ${className}` : ''}`}
    onPointerEnter={event => {
      if (event.pointerType !== 'touch') setHovered(true);
      onPointerEnter?.(event);
    }}
    onPointerLeave={event => {
      setHovered(false);
      onPointerLeave?.(event);
    }}
    onFocus={event => {
      setKeyboardFocused(event.currentTarget.matches(':focus-visible'));
      onFocus?.(event);
    }}
    onBlur={event => {
      setKeyboardFocused(false);
      onBlur?.(event);
    }}>
    <span ref={fillRef} className="talk-button-fill" aria-hidden="true" />
    <span ref={labelRef} className="talk-button-label">{children}</span>
  </button>;
}
