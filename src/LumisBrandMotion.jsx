import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Artboard } from './LumisBrandIdentity.jsx';
import './lumis-brand-motion.css';

const asset = name => `${import.meta.env.BASE_URL}assets/lumis-brand/${name}`;

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
  const topLines = root.querySelectorAll('.lm-poster-top span');
  const bottomLines = root.querySelectorAll('.lm-poster-bottom span');
  const photo = root.querySelector('.lm-poster-photo');
  const images = [...photo.querySelectorAll('img')];
  const topWords = [...root.querySelectorAll('.lm-poster-top .lm-changing-word')];
  const bottomWords = [...root.querySelectorAll('.lm-poster-bottom .lm-changing-word')];
  gsap.set(topLines, { x: 0, xPercent: 0 });
  gsap.set(bottomLines, { x: 1063, xPercent: -100 });
  const timeline = gsap.timeline({ repeat: -1 });
  // Six states let three designs alternate left/right without jumping at the seam.
  for (let step = 0; step < 6; step++) {
    const current = step % posters.length;
    const next = (step + 1) % posters.length;
    const right = step % 2 === 0;
    const at = step * 4.8 + 3.2;
    const destination = posters[next];
    const timing = { duration: 1.6, ease: 'power2.inOut' };
    timeline.to(topLines, { x: right ? 1063 : 0, xPercent: right ? -100 : 0, ...timing }, at)
      .to(bottomLines, { x: right ? 0 : 1063, xPercent: right ? 0 : -100, ...timing }, at)
      .to(photo, { width: destination.width, height: destination.height, ...timing }, at)
      .to(root, { backgroundColor: destination.background, color: destination.color, ...timing }, at)
      .to(root.querySelector('.lm-poster-est'), { x: right ? -935 : 0, ...timing }, at)
      .to(root.querySelector('.lm-poster-tag'), { x: right ? 967 : 0, ...timing }, at);
    // Only the content dissolves; the image aperture stays anchored at the centre.
    timeline.to([topWords[current], ...bottomWords.filter(n => Number(n.dataset.variant) === current), images[current]], { autoAlpha: 0, duration: .5, ease: 'sine.inOut' }, at + .55)
      .to([topWords[next], ...bottomWords.filter(n => Number(n.dataset.variant) === next), images[next]], { autoAlpha: 1, duration: .5, ease: 'sine.inOut' }, at + .55);
  }
  return timeline;
}

export function LumisStoryMotion() {
  const ref = useRef(null);
  useVisibleLoop(ref, posterLoop);
  return <div ref={ref} className="lm-poster" aria-label="Where tech meets skincare. Where dermatology meets inclusivity. Where healthcare feels alive.">
    <Artboard width={1127} height={700}>
      <div className="lm-poster-scene" aria-hidden="true">
        <div className="lm-poster-heading lm-poster-top">
          <div><span>Where</span></div>
          <div>{posters.map((poster, i) => <span key={poster.image} className="lm-changing-word" style={{ visibility: i ? 'hidden' : 'visible', opacity: i ? 0 : 1 }}>{poster.top[1]}</span>)}</div>
        </div>
        <div className="lm-poster-heading lm-poster-bottom">
          {[0, 1].map(line => <div key={line}>{posters.map((poster, i) => <span key={poster.image} data-variant={i} className="lm-changing-word" style={{ visibility: i ? 'hidden' : 'visible', opacity: i ? 0 : 1 }}>{poster.bottom[line]}</span>)}</div>)}
        </div>
        <figure className="lm-poster-photo">
          {posters.map((poster, i) => <img key={poster.image} src={asset(poster.image)} alt="" style={{ width: poster.crop.width, height: poster.crop.height, left: `calc(50% + ${poster.crop.left + poster.crop.width / 2 - poster.width / 2}px)`, top: `calc(50% + ${poster.crop.top + poster.crop.height / 2 - poster.height / 2}px)`, visibility: i ? 'hidden' : 'visible', opacity: i ? 0 : 1 }} />)}
        </figure>
        <p className="lm-poster-caption lm-poster-est">Est. 2026<br />Lumiscare.com</p>
        <p className="lm-poster-caption lm-poster-tag">Clarity for<br />every skin.</p>
      </div>
    </Artboard>
  </div>;
}

const portraits = ['strategy-portrait.png', 'portrait-1342.png', 'portrait-1343.png', 'portrait-1344.png'];
function portraitLoop(root) {
  const frames = [...root.querySelectorAll('.lm-portrait-frame')];
  const timeline = gsap.timeline({ repeat: -1 });
  // Preloaded, simultaneous cuts: no transforms, fades, or empty frames.
  frames.forEach((frame, i) => {
    const at = (i + 1) * 1.25;
    timeline.set(frame, { visibility: 'hidden' }, at)
      .set(frames[(i + 1) % frames.length], { visibility: 'visible' }, at);
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
  const [reduced, setReduced] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setReduced(preference.matches);
    const onVisibility = () => setPageVisible(!document.hidden);
    onPreference();
    onVisibility();
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  useEffect(() => {
    if (!visible || !pageVisible || reduced) return;
    const timer = setTimeout(() => setActive(i => (i + 1) % items.length), 8500);
    return () => clearTimeout(timer);
  }, [active, visible, pageVisible, reduced, items.length]);
  return <div ref={ref} className={`lm-strategy lm-strategy-${active}${reduced ? ' is-reduced' : ''}`} aria-label="Lumis brand strategy">
    {items.map((item, i) => <div className={`lm-strategy-row${active === i ? ' is-active' : ''}`} key={item.number}>
      <div className="lm-strategy-label">
        <span className="lm-strategy-number"><i />{item.number}</span><span className="lm-strategy-title">{item.title}</span>
      </div>
      <div className="lm-strategy-reveal" id={`lm-strategy-copy-${i}`} inert={!reduced && active !== i} aria-hidden={!reduced && active !== i}>
        <div className="lm-strategy-body"><span aria-hidden="true">●</span><div>{(Array.isArray(item.copy) ? item.copy : [item.copy]).map(p => <p key={p}>{p}</p>)}</div></div>
      </div>
    </div>)}
  </div>;
}
