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
      const focus = () => ({
        scale: Math.min(3.15, panel.clientWidth * .78 / future.offsetWidth),
        x: panel.clientWidth / 2 - (headline.offsetLeft + future.offsetLeft + future.offsetWidth / 2),
        y: panel.clientHeight / 2 - (headline.offsetTop + future.offsetTop + future.offsetHeight / 2),
      });
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: .45, paused: true, defaults: { ease: 'sine.inOut' } });
      timeline.set(root.querySelectorAll('.beacon-written-word'), { clipPath: 'inset(0 100% -10% 0)' }, 0)
        .set(words, { yPercent: 110 }, 0)
        .set(headline, { force3D: false, x: 0, y: 0, scale: 1, opacity: 1, transformOrigin: () => (future.offsetLeft + future.offsetWidth / 2) + 'px ' + (future.offsetTop + future.offsetHeight / 2) + 'px' }, 0)
        .to(words, { yPercent: 0, duration: .7, stagger: .22 }, .08)
        .to(word('beacon-building-word'), type('building', .72), .12)
        .to(word('beacon-better-word'), type('better', .58), .89)
        .to(word('beacon-future-word'), type('future', .72), 1.5)
        .to(headline, { scale: () => focus().scale, x: () => focus().x, y: () => focus().y, duration: 1.55, ease: 'sine.inOut' }, 2.25)
        .to(headline, { x: () => focus().x - panel.clientWidth * .12, duration: .65, ease: 'sine.inOut' }, 3.8)
        .to(headline, { x: 0, y: 0, scale: 1, duration: 1.75, ease: 'sine.inOut' }, 4.45)
        .to(word('beacon-together-word'), type('together', 1.3), 4.67)
        .to(headline, { opacity: 0, duration: .45 }, 8.05)
        .to(words, { yPercent: -110, duration: .5, stagger: .12 }, 8.05);
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
    <img className="beacon-idea-film" data-node-id="120:299" src={`${import.meta.env.BASE_URL}assets/videos/beacon-idea.gif`} alt="The idea: Beacon Trust brings people together into a community rooted in trust" width="580" height="811" loading="lazy" />
    <div className="beacon-about-right">
      <div className="beacon-futures-panel"><p className="beacon-written-headline" aria-label="Building better futures together..."><span aria-hidden="true"><Word name="beacon-building-word">Building</Word>{' '}<Word name="beacon-better-word">better</Word><br /><Word name="beacon-future-word">futures</Word>{' '}<Word name="beacon-together-word">together...</Word></span></p></div>
      <div className="beacon-community-panel"><img src={`${import.meta.env.BASE_URL}assets/beacon/about-community.png`} alt="A joyful group of people celebrating together" loading="lazy" /><p aria-label="Community plus Trust plus Hope">{['Community', '+ Trust', '+ Hope'].map(word => <span key={word} className="beacon-community-reveal" aria-hidden="true"><span>{word}</span></span>)}</p></div>
    </div>
  </div>;
}
