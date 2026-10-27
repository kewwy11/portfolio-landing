import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import LumisBrandIdentity, { Artboard, useVisibleImageSequence } from './LumisBrandIdentity';
import './lumis-brand-sections.css';
import { LumisVoice, LumisVisuals } from './LumisBrandVoiceVisuals';

const root = `${import.meta.env.BASE_URL}assets/lumis-brand/`;
const asset = name => `${root}${name}`;

function Intro({ id, title, children }) {
  return <div className="lumis-brand-section-intro">
    <h2 id={id}>{title}</h2>
    <div className="lumis-brand-intro-copy">{children}</div>
  </div>;
}

function BillboardSequence() {
  const ref = useRef(null);
  useVisibleImageSequence(ref, 3600);
  return <figure ref={ref} className="lb-app-wide" aria-label="Alternating Lumis billboard campaigns">
    <div className="li-consultation-slides">
      {['application-billboard.png', 'application-billboard-city.png', 'application-billboard-night.png'].map((photo, i) => <img key={photo} className={i === 0 ? 'is-active' : ''} src={asset(photo)} alt="Lumis billboard campaign" style={i === 1 ? { height: '121.026%', objectPosition: 'top' } : i === 2 ? { width: '99.645%', height: '143.974%', left: '.1775%', top: '-26.026%' } : undefined} />)}
    </div>
  </figure>;
}

function ApplicationFinale() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const media = gsap.matchMedia();
    let disposed = false;
    let ready = false;
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const words = root.querySelectorAll('.lb-app-label');
      const lines = [...root.querySelectorAll('.lb-app-copy span')];
      const portraits = [...root.querySelectorAll('.lb-app-portrait img')];
      const closeups = [...root.querySelectorAll('.lb-app-closeup img')];
      const timeline = gsap.timeline({ repeat: -1, paused: true });
      // Three photographs and two horizontal positions meet again after six steps.
      for (let step = 0; step < 6; step++) {
        const at = step * 4.8 + 3.2;
        const right = step % 2 === 0;
        const timing = { duration: 1.6, ease: 'power2.inOut' };
        timeline.to(words[0], { x: right ? 515 : 0, ...timing }, at)
          .to(words[1], { x: right ? -515 : 0, ...timing }, at)
          .to(lines, { x: (_, line) => right ? 220 - line.offsetWidth : 0, ...timing }, at);
        // Advance exactly one photograph during each complete slide.
        const index = (step + 1) % 3;
        timeline.set([...portraits, ...closeups], { autoAlpha: 0 }, at + .8)
          .set([portraits[index], closeups[index]], { autoAlpha: 1 }, at + .8);
      }
      let visible = false;
      const sync = () => timeline.paused(!ready || !visible || document.hidden);
      Promise.all([...portraits, ...closeups].map(image => image.decode())).then(() => {
        if (!disposed) { ready = true; sync(); }
      }).catch(() => {});
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .15 });
      observer.observe(root);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); };
    });
    return () => { disposed = true; media.revert(); };
  }, []);
  const photos = [0, 1, 2].map(i => asset(`application-skin-${i}.png`));
  return <Artboard width={1127} height={780} motionRef={ref} className="lb-app-finale">
    <div className="lb-app-top">
      <span className="lb-app-label">For every</span>
      <div className="lb-app-portrait">{photos.map((src, i) => <img key={src} src={src} alt="Skin portrait" style={{ visibility: i ? 'hidden' : 'visible', opacity: i ? 0 : 1 }} />)}</div>
      <span className="lb-app-label">skin type</span>
    </div>
    <div className="lb-app-bottom">
      <div className="lb-app-closeup">{photos.map((src, i) => <img key={src} className={`lb-app-crop-${i}`} src={src} alt="Skin texture" style={{ visibility: i ? 'hidden' : 'visible', opacity: i ? 0 : 1 }} />)}</div>
      <div className="lb-app-copy">{['Every', 'skin tone,', 'every skin', 'condition', 'is included.'].map(line => <div key={line}><span>{line}</span></div>)}</div>
    </div>
  </Artboard>;
}

function Application() {
  return <section id="lumis-brand-application" className="lb-section lb-application" aria-labelledby="lumis-brand-application-title">
    <Intro id="lumis-brand-application-title" title="Application"><p>We showed how Lumis could exist in the real world through different brand applications. From billboards that communicated how we wanted people to perceive the brand, to logos applied across merchandise, doctor uniforms, and business cards.</p></Intro>
    <div className="lb-application-gallery">
      <BillboardSequence />
      <div className="lb-app-pair"><div className="lb-app-stack"><img src={asset('application-sign.png')} alt="Lumis sign on a building" loading="lazy" /><img src={asset('application-poster.png')} alt="Lumis street poster" loading="lazy" /></div><figure><img src={asset('application-uniform.png')} alt="Lumis logo on a healthcare uniform" loading="lazy" /></figure></div>
      <div className="lb-app-pair lb-app-cards"><figure><img className="lb-card-background" src={asset('application-card-background.png')} alt="" loading="lazy" /><img className="lb-card-front" src={asset('application-card-front.png')} alt="Lumis business card front" loading="lazy" /><img className="lb-card-back" src={asset('application-card-back.png')} alt="Lumis business card back" loading="lazy" /></figure><figure><img src={asset('application-street.png')} alt="Lumis campaign billboards on a city street" loading="lazy" /></figure></div>
      <ApplicationFinale />
    </div>
  </section>;
}

export default function LumisBrandSections() {
  return <><LumisBrandIdentity /><LumisVoice /><LumisVisuals /><Application /></>;
}
