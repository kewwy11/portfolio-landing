import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import RevealHeading from './RevealHeading.jsx';
import useRevealOnScroll from './useRevealOnScroll.js';

const projects = [
  ['nommy', 'Nommy Stitches'], ['jewelry', 'Jewelry website'],
  ['lumis', 'Lumis Dermatologists'], ['piggyvest', 'Piggyvest'],
];

export default function FooterMasthead() {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ repeat: true, rootMargin: '0px' });
  const [textDone, setTextDone] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [wanted, setWanted] = useState(null);
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState({});
  const images = useRef({});
  const current = useRef(null);
  const timeline = useRef(null);
  const exiting = useRef(false);
  const request = useRef(null);
  const immediate = reducedMotion || typeof window.IntersectionObserver !== 'function';
  const ready = fontsReady && revealed && (textDone || immediate);

  useEffect(() => {
    let alive = true;
    document.fonts.load('400 169px Gind').catch(() => {}).then(() => { if (alive) setFontsReady(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { if (!revealed) { setTextDone(false); setWanted(null); } }, [revealed]);
  useEffect(() => () => timeline.current?.kill(), []);

  // Exit the previous card before opening the latest requested card. Fast pointer
  // changes update the destination without restarting the current exit.
  useLayoutEffect(() => {
    const target = ready && loaded[wanted] ? wanted : null;
    const show = id => {
      if (current.current === id) return;
      current.current = id;
      setActive(id);
      if (!id) return;
      const image = images.current[id];
      if (immediate) {
        gsap.set(image, { autoAlpha: 1, scale: 1, rotation: 0 });
        return;
      }
      gsap.set(image, { autoAlpha: 0, scale: .15, rotation: -6 });
      timeline.current = gsap.timeline()
        .to(image, { autoAlpha: 1, scale: 1, duration: .48, ease: 'power3.out' }, 0)
        .to(image, { rotation: 3, duration: .32, ease: 'power2.out' }, 0)
        .to(image, { rotation: -1.2, duration: .18, ease: 'sine.inOut' })
        .to(image, { rotation: 0, duration: .22, ease: 'sine.out' });
    };
    request.current = () => show(target);
    if (current.current === target || exiting.current) return;
    timeline.current?.kill();
    const previous = current.current;
    if (!previous) { show(target); return; }
    if (!revealed || immediate) {
      gsap.set(images.current[previous], { autoAlpha: 0, scale: .15, rotation: 0 });
      current.current = null;
      show(target);
      if (!target) setActive(null);
      return;
    }
    exiting.current = true;
    timeline.current = gsap.to(images.current[previous], {
      autoAlpha: 0,
      scale: Math.min(.8, Number(gsap.getProperty(images.current[previous], 'scaleX')) * .85),
      duration: .16, ease: 'power2.inOut',
      onComplete: () => {
        current.current = null;
        exiting.current = false;
        setActive(null);
        request.current?.();
      },
    });
  }, [wanted, ready, loaded, revealed, immediate]);

  return <div ref={ref} className={`footer-masthead${ready ? ' images-ready' : ''}`}
    onPointerLeave={event => {
      if (event.pointerType !== 'touch' && !event.currentTarget.contains(document.activeElement)) setWanted(null);
    }}>
    <RevealHeading as="p" className="footer-wordmark" ready={fontsReady}
      onAnimationEnd={event => {
        if (event.target.classList.contains('heading-text')) setTextDone(true);
      }}>Grateful Erhis</RevealHeading>
    <div className="footer-collage">
      {projects.map(([id, label]) => <button key={id} type="button"
        className={`footer-card footer-card-${id}${active === id ? ' is-active' : ''}`}
        aria-label={`Preview ${label}`} aria-pressed={active === id}
        onPointerEnter={event => { if (event.pointerType !== 'touch') setWanted(id); }}
        onFocus={() => setWanted(id)} onBlur={() => setWanted(null)}
        onClick={event => {
          if (event.detail === 0) setWanted(previous => previous === id ? null : id);
          else if (!window.matchMedia('(hover: hover)').matches) setWanted(id);
        }}>
        <img ref={node => { images.current[id] = node; }} className="footer-project"
          src={`${import.meta.env.BASE_URL}assets/footer-${id}.png`} alt=""
          loading={revealed ? 'eager' : 'lazy'} decoding="async"
          onLoad={event => {
            event.currentTarget.decode().catch(() => {}).then(() =>
              setLoaded(previous => ({ ...previous, [id]: true })));
          }} />
      </button>)}
    </div>
  </div>;
}
