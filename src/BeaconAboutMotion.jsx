import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './beacon-about-motion.css';

function Word({ children, name }) {
  return <span className={`beacon-written-word ${name || ''}`}>{children}</span>;
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
      const word = name => root.querySelector(`.${name}`);
      const type = (name, duration) => {
        const element = word('beacon-' + name + '-word');
        const text = element.firstChild;
        const range = document.createRange();
        const bounds = element.getBoundingClientRect();
        // Reveal at actual glyph boundaries, retaining the font's native kerning.
        const frames = [...text.textContent].map((_, i) => {
          range.setStart(text, 0);
          range.setEnd(text, i + 1);
          const edge = (range.getBoundingClientRect().right - bounds.left) / bounds.width;
          return { clipPath: 'inset(-10% ' + Math.max(-2, (1 - edge) * 100 - .3) + '% -10% 0)', duration: duration / text.length, ease: 'steps(1)' };
        });
        return { keyframes: frames };
      };
      const words = root.querySelectorAll('.beacon-community-reveal > span');
      const offsets = [[0,-24],[-24,0],[24,0],[0,24]];
      const focus = () => ({
        scale: panel.clientWidth * 1.65 / future.offsetWidth,
        x: panel.clientWidth / 2 - (headline.offsetLeft + future.offsetLeft + future.offsetWidth / 2),
        y: panel.clientHeight / 2 - (headline.offsetTop + future.offsetTop + future.offsetHeight / 2),
      });
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: .35, paused: true, defaults: { ease: 'power2.inOut' } });
      timeline.set(rings, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1, x: i => offsets[i][0], y: i => offsets[i][1] }, 0)
        .set(root.querySelectorAll('.beacon-written-word'), { clipPath: 'inset(0 100% -10% 0)' }, 0)
        .set(words, { yPercent: 110 }, 0)
        .set(headline, { force3D: false, x: () => -panel.clientWidth * .3, y: 32, scale: .86, opacity: 1, transformOrigin: () => (future.offsetLeft + future.offsetWidth / 2) + 'px ' + (future.offsetTop + future.offsetHeight / 2) + 'px' }, 0)
        .to(rings, { strokeDashoffset: 0, duration: 1.45, stagger: .2 }, .08)
        .to(rings, { x: 0, y: 0, duration: 1.7, stagger: .12 }, .55)
        .to(words, { yPercent: 0, duration: .7, stagger: .22 }, .08)
        .to(word('beacon-building-word'), type('building', .65), .08)
        .to(headline, { x: () => -panel.clientWidth * .08, y: -12, scale: 1.05, duration: 1.55 }, .08)
        .to(word('beacon-better-word'), type('better', .5), .85)
        .to(word('beacon-future-word'), type('future', .65), 1.35)
        .to(headline, { scale: () => focus().scale, x: () => focus().x, y: () => focus().y, duration: 1.05, ease: 'power3.inOut' }, 1.55)
        // Travel across the enlarged lettering before pulling back to the full phrase.
        .to(headline, { x: () => focus().x - panel.clientWidth * .32, duration: .85, ease: 'sine.inOut' }, 2.6)
        .to(headline, { x: 0, y: 0, scale: 1, duration: 1.65, ease: 'power3.inOut' }, 3.45)
        .to(word('beacon-together-word'), type('together', 1.3), 3.6)
        .to(rings, { strokeDashoffset: -1, duration: 1.15, stagger: .12 }, 6.25)
        .to(headline, { opacity: 0, duration: .5 }, 7)
        .to(words, { yPercent: -110, duration: .5, stagger: .12 }, 7);
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
