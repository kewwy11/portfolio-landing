import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Artboard } from './LumisBrandIdentity.jsx';
import './lumis-brand-motion.css';

const asset = name => `${import.meta.env.BASE_URL}assets/lumis-brand/${name}`;
const ease = 'power3.inOut';

// Keep each sequence on a single clock, including its first/last transition.
function useVisibleLoop(ref, create) {
  useEffect(() => {
    const media = gsap.matchMedia();
    let observer;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = create(ref.current).pause();
      let visible = false;
      const sync = () => timeline.paused(!visible || document.hidden);
      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .15 });
      observer.observe(ref.current);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); };
    });
    return () => media.revert();
  }, [ref, create]);
}

const posters = [
  { top: ['Where', 'tech'], bottom: ['Meets', 'skincare'], image: 'story-tablet.png', width: 410, height: 285, color: '#eff6ff', background: '#1d4ed8', crop: { width: 442, height: 664, left: 0, top: -168 } },
  { top: ['Where', 'dermatology'], bottom: ['Meets', 'inclusivity'], image: 'story-inclusivity.png', width: 391, height: 302, color: '#1d4ed8', background: '#fff8eb', crop: { width: 391, height: 586, left: 0, top: -164 } },
  { top: ['Where', 'healthcare'], bottom: ['Feels', 'alive'], image: 'story-alive.png', width: 251, height: 302, color: '#fff8eb', background: '#f59e0b', reverse: true, crop: { width: 290, height: 386, left: -19, top: -84 } },
];

function posterLoop(root) {
  const scenes = [...root.querySelectorAll('.lm-poster-scene')];
  const timeline = gsap.timeline({ repeat: -1 });
  scenes.forEach((scene, i) => {
    const next = scenes[(i + 1) % scenes.length];
    const at = i * 5.6 + 3.5;
    const outgoing = scene.querySelectorAll('.lm-poster-heading span');
    const incoming = next.querySelectorAll('.lm-poster-heading span');
    timeline.set(next, { visibility: 'visible' }, at)
      .fromTo(incoming, { yPercent: 112, x: posters[(i + 1) % 3].reverse ? -45 : 45 }, { immediateRender: false, x: 0, yPercent: 0, duration: 1.35, stagger: .055, ease }, at + .2)
      .to(outgoing, { yPercent: -112, x: posters[i].reverse ? 45 : -45, duration: 1.2, stagger: .055, ease }, at)
      .to(root, { backgroundColor: posters[(i + 1) % 3].background, duration: 1.5, ease }, at)
      .fromTo(next.querySelector('.lm-poster-photo'), { scale: .72, autoAlpha: 0 }, { immediateRender: false, scale: 1, autoAlpha: 1, duration: 1.65, ease }, at + .05)
      .to(scene.querySelector('.lm-poster-photo'), { scale: 1.12, autoAlpha: 0, duration: 1.3, ease }, at)
      .fromTo(next.querySelectorAll('.lm-poster-caption'), { autoAlpha: 0, y: 10 }, { immediateRender: false, autoAlpha: 1, y: 0, duration: .9, ease }, at + .55)
      .to(scene.querySelectorAll('.lm-poster-caption'), { autoAlpha: 0, y: -10, duration: .7, ease }, at)
      .set(scene, { visibility: 'hidden' }, at + 1.8);
  });
  timeline.to({}, { duration: .3 });
  return timeline;
}

export function LumisStoryMotion() {
  const ref = useRef(null);
  useVisibleLoop(ref, posterLoop);
  return <div ref={ref} className="lm-poster" aria-label="Where tech meets skincare. Where dermatology meets inclusivity. Where healthcare feels alive.">
    <Artboard width={1127} height={700}>
      {posters.map((poster, i) => <div key={poster.image} className={`lm-poster-scene${poster.reverse ? ' is-reversed' : ''}`} style={{ color: poster.color, visibility: i ? 'hidden' : 'visible' }} aria-hidden="true">
        <div className="lm-poster-heading lm-poster-top">{poster.top.map(line => <div key={line}><span>{line}</span></div>)}</div>
        <div className="lm-poster-heading lm-poster-bottom">{poster.bottom.map(line => <div key={line}><span>{line}</span></div>)}</div>
        <figure className="lm-poster-photo" style={{ width: poster.width, height: poster.height, left: (1127 - poster.width) / 2, top: (700 - poster.height) / 2 }}><img src={asset(poster.image)} alt="" style={poster.crop} /></figure>
        <p className="lm-poster-caption lm-poster-est">Est. 2026<br />Lumiscare.com</p>
        <p className="lm-poster-caption lm-poster-tag">Clarity for<br />every skin.</p>
      </div>)}
    </Artboard>
  </div>;
}

const portraits = ['strategy-portrait.png', 'portrait-1342.png', 'portrait-1343.png', 'portrait-1344.png'];
function portraitLoop(root) {
  const frames = [...root.querySelectorAll('.lm-portrait-frame')];
  const timeline = gsap.timeline({ repeat: -1 });
  frames.forEach((frame, i) => {
    const next = frames[(i + 1) % frames.length];
    const at = i * 5.2 + 3.2;
    timeline.set(next, { zIndex: 2 }, at)
      .set(frame, { zIndex: 1 }, at)
      .fromTo(next, { autoAlpha: 0, scale: 1.17 }, { immediateRender: false, autoAlpha: 1, scale: 1, duration: 2, ease: 'sine.inOut' }, at)
      .to(frame, { scale: .94, duration: 2, ease: 'sine.inOut' }, at)
      .set(frame, { autoAlpha: 0, zIndex: 0 }, at + 2);
  });
  return timeline;
}
export function LumisPortraitMotion() {
  const ref = useRef(null);
  useVisibleLoop(ref, portraitLoop);
  return <figure ref={ref} className="lumis-brand-portrait lm-portraits" aria-label="Portraits celebrating different skin tones">
    {portraits.map((photo, i) => <div key={photo} className={`lm-portrait-frame lm-portrait-${i}`} style={{ visibility: i ? 'hidden' : 'visible' }}><img src={asset(photo)} alt="" /></div>)}
  </figure>;
}

export function LumisStrategyMotion({ items }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setActive(i => (i + 1) % items.length), 6500);
    return () => clearTimeout(timer);
  }, [active, visible, paused, items.length]);
  return <div ref={ref} className={`lm-strategy lm-strategy-${active}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }} aria-label="Lumis brand strategy">
    {items.map((item, i) => <div className={`lm-strategy-row${active === i ? ' is-active' : ''}`} key={item.number}>
      <button type="button" aria-expanded={active === i} aria-controls={`lm-strategy-copy-${i}`} onClick={() => setActive(i)}>
        <span className="lm-strategy-number"><i />{item.number}</span><span className="lm-strategy-title">{item.title}</span>
      </button>
      <div className="lm-strategy-reveal" id={`lm-strategy-copy-${i}`} inert={active !== i} aria-hidden={active !== i}>
        <div className="lm-strategy-body"><span aria-hidden="true">●</span><div>{(Array.isArray(item.copy) ? item.copy : [item.copy]).map(p => <p key={p}>{p}</p>)}</div></div>
      </div>
    </div>)}
  </div>;
}
