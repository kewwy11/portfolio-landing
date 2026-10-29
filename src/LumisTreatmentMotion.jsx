import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Artboard } from './LumisBrandIdentity.jsx';
import LumisTreatmentArtwork from './LumisTreatmentArtwork.jsx';
import './lumis-treatment-motion.css';

export default function LumisTreatmentMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const frames = [...root.querySelectorAll('.tp-frame')];
      const indicator = root.querySelector('.tp-switch');
      const timeline = gsap.timeline({ repeat:-1, paused:true });
      for (let step = 0; step < 2; step++) {
        const next = 1 - step;
        const at = 3.8 + step * 4.6;
        timeline.set(frames[next], { autoAlpha:0 }, at)
          .to(frames[step], { autoAlpha:0, duration:.8, ease:'sine.inOut' }, at)
          .to(frames[next], { autoAlpha:1, duration:.8, ease:'sine.inOut' }, at)
          .to(indicator, { rotation:next ? 180 : 0, duration:.8, ease:'sine.inOut' }, at);
      }
      let visible = false;
      const sync = () => timeline.paused(!visible || document.hidden);
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold:.1});
      observer.observe(root);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.revert(); };
    });
    return () => media.revert();
  }, []);
  return <Artboard width={612} height={443} className="tp-artwork" motionRef={ref}>
    <div className="tp-scene" role="img" aria-label="Alternating Treatment Plan and Skincare Routine interface concepts">
      <div className="tp-frame"><LumisTreatmentArtwork property1="Frame 759" /></div>
      <div className="tp-frame"><LumisTreatmentArtwork property1="Frame 386" /></div>
      <img className="tp-switch" src={`${import.meta.env.BASE_URL}assets/lumis/treatment-switch.svg`} alt="" />
    </div>
  </Artboard>;
}
