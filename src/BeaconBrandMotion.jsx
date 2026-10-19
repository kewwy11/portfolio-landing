import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './beacon-brand-motion.css';

const asset = name => `${import.meta.env.BASE_URL}assets/beacon/${name}`;

function Canvas({ width = 554, height = 367, children, className = '' }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={ref} className={`bb-canvas ${className}`} style={{ aspectRatio: `${width}/${height}` }}><div className="bb-stage" style={{ width, height, transform: `scale(${scale})` }}>{children}</div></div>;
}

function useMotion(ref, animate) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = animate(ref.current);
      let visible = false;
      const sync = () => visible && !document.hidden ? timeline.play() : timeline.pause();
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .05 });
      observer.observe(ref.current);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); };
    }, ref);
    return () => media.revert();
  }, []);
}

export function BeaconLogoShowcase() {
  const ref = useRef(null);
  useMotion(ref, root => {
    const photos = root.querySelectorAll('.bb-logo-photo');
    const marks = root.querySelectorAll('.bb-cycle-mark');
    const rings = root.querySelectorAll('.bb-progress');
    const circumference = 2 * Math.PI * 9;
    const panel = root.querySelector('.bb-colour-panel');
    const tile = root.querySelector('.bb-logo-tile');
    const backgrounds = ['#17173d', '#e8e9ff', '#6b6bf7'];
    const tiles = ['#fafafc', '#0b0bd6', '#17173d'];
    const tl = gsap.timeline({ repeat: -1, paused: true });
    tl.set(photos, { opacity: i => i === 0 ? 1 : 0, scale: 1 }, 0)
      .set(marks, { opacity: i => i === 0 ? 1 : 0 }, 0)
      .set(rings, { autoRound: false, strokeDasharray: circumference, strokeDashoffset: circumference }, 0);
    for (let i = 0; i < 3; i++) {
      const next = (i + 1) % 3, time = i * 4.25;
      tl.to(rings[i], { strokeDashoffset: 0, autoRound: false, duration: 4, ease: 'none' }, time)
        .to(photos[i], { scale: 1.07, duration: 2.95, ease: 'sine.inOut' }, time)
        .set(photos[next], { scale: 1, zIndex: 2 }, time + 2.95)
        .set(photos[i], { zIndex: 1 }, time + 2.95)
        .to(photos[i], { scale: 1, opacity: 0, duration: 1.3, ease: 'sine.inOut' }, time + 2.95)
        .to(photos[next], { scale: 1.04, opacity: 1, duration: 1.3, ease: 'sine.inOut' }, time + 2.95)
        .to(panel, { backgroundColor: backgrounds[next], duration: .25 }, time + 4)
        .to(tile, { backgroundColor: tiles[next], duration: .25 }, time + 4)
        .to(marks[i], { opacity: 0, duration: .25 }, time + 4)
        .to(marks[next], { opacity: 1, duration: .25 }, time + 4)
        .set(rings[i], { strokeDashoffset: circumference }, time + 4.25);
    }
    return tl;
  });
  return <div ref={ref} className="bb-logo-grid">
    <div className="bb-logo-left">
      <Canvas><div className="bb-photo-window">{['logo-car.png', 'logo-photo-team.png', 'logo-photo-opening.png'].map((name, i) => <img key={name} className={`bb-logo-photo bb-photo-${i}`} src={asset(name)} alt={['Friends celebrating in a car', 'A community joining hands', 'Celebrating a business opening'][i]} loading="lazy" />)}</div></Canvas>
      <Canvas><div className="bb-colour-panel"><div className="bb-logo-tile">{['blue', 'white', 'yellow'].map(colour => <img key={colour} className="bb-cycle-mark" src={asset(`logo-cycle-${colour}.svg`)} alt={colour === 'blue' ? 'Beacon Trust symbol' : ''} />)}</div><div className="bb-indicators" aria-hidden="true">{['#0b0bd6', '#fafafc', '#ffaf1d'].map(colour => <svg key={colour} viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill={colour}/><circle className="bb-progress" cx="10" cy="10" r="9" fill="none" stroke="white" strokeWidth="1" strokeDasharray={2 * Math.PI * 9} strokeDashoffset={2 * Math.PI * 9} transform="rotate(-90 10 10)"/></svg>)}</div></div></Canvas>
    </div>
    <Canvas height={750} className="bb-grid-panel"><img className="bb-logo-construction" src={asset('logo-grid.svg')} alt="Beacon Trust symbol on its construction grid" /></Canvas>
  </div>;
}

function Trace({ id, className, path, width, height }) {
  return <svg className={`bb-trace ${className}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true"><defs><mask id={id}><path className="bb-trace-mask" d={path} fill="none" stroke="white" strokeWidth="3" pathLength="1" /></mask></defs><path d={path} fill="none" stroke="white" strokeWidth=".5" strokeDasharray="4 2" mask={`url(#${id})`} /></svg>;
}

const statements = [
  ['No paperwork', 'mountain. Just', 'a few minutes...'],
  ['Your next step.', 'A little support.', 'A brighter future.'],
  ['Real people.', 'Clear terms.', 'Room to grow.'],
];

function StatementRotation() {
  const ref = useRef(null);
  useMotion(ref, root => {
    const frames = [...root.querySelectorAll('.bb-statement-frame')];
    const timeline = gsap.timeline({ repeat: -1, paused: true });
    timeline.set(frames, { visibility: 'hidden' }, 0);
    frames.forEach((frame, index) => {
      const lines = frame.querySelectorAll('.bb-statement-line > div');
      const start = index * 4.8;
      timeline.set(frame, { visibility: 'visible' }, start)
        .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: .65, stagger: .18, ease: 'power3.out' }, start)
        .to(lines, { yPercent: 110, duration: .6, stagger: { each: .16, from: 'end' }, ease: 'power2.inOut' }, start + 3.45)
        .set(frame, { visibility: 'hidden' }, start + 4.8);
    });
    return timeline;
  });
  return <div ref={ref} className="bb-statement-copy" role="img" aria-label={statements.map(lines => lines.join(' ')).join(' ')}>
    {statements.map((lines, index) => <div className="bb-statement-frame" key={index} aria-hidden="true">
      {lines.map((line, i) => <div className="bb-statement-line" key={line}><div>
        {index === 0 ? <img src={asset('type-statement-exact.svg')} alt="" style={{ top: -4 - i * 76.5 }}/> : <svg width="458" height="76.5" viewBox="0 0 458 76.5"><text x="458" y="48" textAnchor="end">{line}</text></svg>}
      </div></div>)}
    </div>)}
  </div>;
}

function TypographySample() {
  const ref = useRef(null);
  useMotion(ref, root => {
    const text = root.querySelector('.bb-sample-text');
    const lines = root.querySelectorAll('.bb-sample-line');
    const caption = root.querySelector('p');
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: .45, paused: true });
    timeline.set(text, { transformOrigin: '95px 82px', force3D: false, x: 0, y: 0, scale: 1, opacity: 1 }, 0)
      .set(lines, { clipPath: 'inset(0 100% 0 0)' }, 0)
      .to(lines[0], { clipPath: 'inset(0 0% 0 0)', duration: 1.05, ease: 'steps(16)' }, .15)
      .to(lines[1], { clipPath: 'inset(0 0% 0 0)', duration: 1.35, ease: 'steps(19)' }, 1.25)
      .to(caption, { opacity: 0, duration: .5, ease: 'sine.inOut' }, 2.55)
      .to(text, { scale: 3.1, x: 143, y: -40, duration: 1.55, ease: 'sine.inOut' }, 2.7)
      .to(text, { x: 72, duration: .7, ease: 'sine.inOut' }, 4.25)
      .to(text, { scale: 1, x: 0, y: 0, duration: 1.75, ease: 'sine.inOut' }, 4.95)
      .to(caption, { opacity: 1, duration: .55, ease: 'sine.inOut' }, 6.1)
      .to(text, { opacity: 0, duration: .4 }, 7.75);
    return timeline;
  });
  return <div ref={ref}><Canvas className="bb-sample"><p>Inter x Canela</p><div className="bb-sample-text" role="img" aria-label="Built for people, building something.">
    <span className="bb-sample-line bb-sample-line-one" aria-hidden="true"><img src={asset('type-sample-exact.svg')} alt="" /></span>
    <span className="bb-sample-line bb-sample-line-two" aria-hidden="true"><img src={asset('type-sample-exact.svg')} alt="" /></span>
  </div></Canvas></div>;
}

export function BeaconTypography() {
  const ref = useRef(null), id = useId().replaceAll(':', '');
  const [reveal, setReveal] = useState(50);
  useMotion(ref, root => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: .3, paused: true });
    tl.fromTo(root.querySelectorAll('.bb-trace-mask'), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .9, ease: 'power2.inOut' }, 0)
      .fromTo(root.querySelectorAll('.bb-glass'), { clipPath: 'inset(0 100% 0 0)', opacity: 0 }, { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: .6 }, .8)
      .fromTo(root.querySelectorAll('.bb-glass span'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: .5 }, 1.15)
      .to(root.querySelectorAll('.bb-glass'), { opacity: 0, duration: .4 }, 3.8)
      .to(root.querySelectorAll('.bb-trace-mask'), { strokeDashoffset: -1, duration: .5 }, 4);
    return tl;
  });
  return <div ref={ref} className="bb-typography">
    <Canvas width={1127} height={684} className="bb-workshop"><img className="bb-workshop-photo" src={asset('type-photo.png')} alt="Craftsperson at work in a sunlit workshop" loading="lazy"/><div className="bb-photo-shade"/><img className="bb-workshop-text" src={asset('type-photo-exact.svg')} alt="Building better futures together"/>
      <Trace id={`${id}-inter`} className="bb-inter-trace" width={76.5} height={98.5} path="M76.25 98.25V10.25C76.25 4.72715 71.7728 .25 66.25 .25H.25"/>
      <Trace id={`${id}-canela`} className="bb-canela-trace" width={40.5} height={73.5} path="M.25 .25V63.25C.25 68.7728 4.72715 73.25 10.25 73.25H40.25"/>
      <div className="bb-glass bb-inter-note"><span>Main typeface: Inter</span></div><div className="bb-glass bb-canela-note"><span>Canela sans serif</span></div>
    </Canvas>
    <div className="bb-type-grid"><div className="bb-type-left">
      <TypographySample />
      <Canvas className="bb-comparison"><span className="bb-slide-label">Slide to reveal</span><div className="bb-compare-sans">Beacon Trust</div><div className="bb-compare-serif" style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}><img src={asset('type-comparison-exact.svg')} alt=""/></div><span className="bb-divider" style={{ left: `${reveal}%` }}><b>‹›</b></span><input type="range" min="0" max="100" value={reveal} onChange={e => setReveal(Number(e.target.value))} aria-label="Compare Inter and Canela lettering"/></Canvas>
    </div><Canvas height={750} className="bb-statement"><StatementRotation /><img className="bb-relax-photo" src={asset('lifestyle-photo.png')} alt="A person relaxing at home" loading="lazy"/></Canvas></div>
  </div>;
}
