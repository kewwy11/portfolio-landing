import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './beacon-about-motion.css';

function Word({ children, name }) {
  return <span className={`beacon-written-word ${name || ''}`}>{[...children].map((letter, index) => <span className="beacon-written-letter" key={index}>{letter}</span>)}</span>;
}

export default function BeaconAboutMotion() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const root = ref.current;
    const media = gsap.matchMedia();
    let observer;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const rings = root.querySelectorAll('.beacon-forming-ring');
      const headline = root.querySelector('.beacon-written-headline');
      const panel = root.querySelector('.beacon-futures-panel');
      const future = root.querySelector('.beacon-future-word');
      const letters = name => root.querySelectorAll(`.${name} .beacon-written-letter`);
      const words = root.querySelectorAll('.beacon-community-reveal > span');
      const offsets = [[0,-24],[-24,0],[24,0],[0,24]];
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: .8, paused: true, defaults: { ease: 'power2.inOut' } });
      timeline.set(rings, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1, x: i => offsets[i][0], y: i => offsets[i][1] }, 0)
        .set(root.querySelectorAll('.beacon-written-letter'), { opacity: 0 }, 0)
        .set(words, { yPercent: 110 }, 0)
        .set(headline, { x: 0, y: 0, scale: 1, opacity: 1 }, 0)
        .to(rings, { strokeDashoffset: 0, duration: 1.9, stagger: .3 }, .2)
        .to(rings, { x: 0, y: 0, duration: 2.3, stagger: .18 }, 1)
        .to(letters('beacon-building-word'), { opacity: 1, duration: .12, stagger: .11 }, 3.2)
        .to(letters('beacon-better-word'), { opacity: 1, duration: .12, stagger: .11 }, 4.3)
        .set(headline, { transformOrigin: () => `${future.offsetLeft + future.offsetWidth / 2}px ${future.offsetTop + future.offsetHeight / 2}px` }, 5.1)
        .to(headline, { scale: () => panel.clientWidth * .9 / future.offsetWidth, x: () => panel.clientWidth / 2 - (headline.offsetLeft + future.offsetLeft + future.offsetWidth / 2), y: () => panel.clientHeight / 2 - (headline.offsetTop + future.offsetTop + future.offsetHeight / 2), duration: 1.1 }, 5.1)
        .to(letters('beacon-future-word'), { opacity: 1, duration: .14, stagger: .16 }, 5.35)
        .to(headline, { x: 0, y: 0, scale: 1, duration: 1.25 }, 7.1)
        .to(letters('beacon-together-word'), { opacity: 1, duration: .12, stagger: .1 }, 8.5)
        .to(words, { yPercent: 0, duration: 1.1, stagger: .3 }, 10)
        .to(rings, { strokeDashoffset: -1, duration: 1.8, stagger: .18 }, 13)
        .to(headline, { opacity: 0, duration: .7 }, 14)
        .to(words, { yPercent: -110, duration: .7, stagger: .15 }, 14);
      let visible = false;
      const sync = () => visible && !document.hidden ? timeline.resume() : timeline.pause();
      observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .1 });
      observer.observe(root);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); };
    }, root);
    return () => media.revert();
  }, []);
  return <div ref={ref} className="beacon-about-grid beacon-about-motion">
    <div className="beacon-idea-panel">
      <div className="beacon-idea-copy"><p className="beacon-idea-label">The idea</p><p>Beacon Trust is like a hope to people, this hope brings people together to form a community rooted in trust and constantly cheering each other.</p></div>
      <svg className="beacon-idea-mark beacon-forming-rings" viewBox="-26 -26 504.519 501.666" role="img" aria-label="Four rings forming an interlocking community">
        {[[226.259,101.722],[101.722,224.357],[350.797,224.357],[226.259,347.944]].map(([cx,cy],index) => <circle key={index} className="beacon-forming-ring" cx={cx} cy={cy} r={100.438} fill="none" stroke="#fafafc" strokeWidth={2.566} pathLength={1} />)}
      </svg>
    </div>
    <div className="beacon-about-right">
      <div className="beacon-futures-panel"><p className="beacon-written-headline" aria-label="Building better futures together..."><span aria-hidden="true"><Word name="beacon-building-word">Building</Word>{' '}<Word name="beacon-better-word">better</Word><br /><Word name="beacon-future-word">futures</Word>{' '}<Word name="beacon-together-word">together...</Word></span></p></div>
      <div className="beacon-community-panel"><img src={`${import.meta.env.BASE_URL}assets/beacon/about-community.png`} alt="A joyful group of people celebrating together" loading="lazy" /><p aria-label="Community plus Trust plus Hope">{['Community', '+ Trust', '+ Hope'].map(word => <span key={word} className="beacon-community-reveal" aria-hidden="true"><span>{word}</span></span>)}</p></div>
    </div>
  </div>;
}
