import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Artboard } from './LumisBrandIdentity.jsx';
import LumisTreatmentArtwork from './LumisTreatmentArtwork.jsx';
import './lumis-treatment-motion.css';

export default function LumisTreatmentMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    root.dataset.activeUi = '0';
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const frames = [...root.querySelectorAll('.tp-frame')];
      gsap.set(frames[0], { y:0, yPercent:0 });
      gsap.set(frames[1], { y:0, yPercent:100 });
      const indicator = root.querySelector('.tp-active-indicator');
      const timeline = gsap.timeline({ repeat:-1, paused:true });
      for (let step = 0; step < 2; step++) {
        const next = 1 - step;
        const direction = next === 1 ? 1 : -1;
        const at = 3.8 + step * 4.8;
        timeline.set(frames[next], { yPercent:direction * 100, autoAlpha:1 }, at)
          .to(frames[step], { yPercent:-direction * 100, duration:1, ease:'sine.inOut' }, at)
          .to(frames[next], { yPercent:0, duration:1, ease:'sine.inOut' }, at)
          .to(indicator, { y:next * 35, duration:1, ease:'sine.inOut' }, at)
          .set(root, { attr:{'data-active-ui':next} }, at + 1);
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
      <div className="tp-window">
        <div className="tp-frame"><LumisTreatmentArtwork property1="Frame 759" /></div>
        <div className="tp-frame"><LumisTreatmentArtwork property1="Frame 386" /></div>
      </div>
      <div className="tp-switch" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}assets/lumis/treatment-switch.svg`} alt="" /><span className="tp-active-indicator" /></div>
    </div>
  </Artboard>;
}
