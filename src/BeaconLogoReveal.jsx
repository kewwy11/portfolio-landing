import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function BeaconLogoReveal() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const artwork = ref.current.querySelector('.beacon-logo-reveal-art');
      const motion = gsap.fromTo(artwork, { yPercent: 110 }, { yPercent: 0, duration: 1.05, ease: 'power3.out', paused: true });
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) motion.play();
        else if (entry.intersectionRatio === 0) motion.pause(0);
      }, { threshold: [0, .25] });
      observer.observe(ref.current);
      return () => { observer.disconnect(); motion.kill(); };
    }, ref);
    return () => media.revert();
  }, []);
  return <div ref={ref} className="beacon-logo-lockup">
    <div className="beacon-logo-reveal-mask"><div className="beacon-logo-reveal-art">
      <img className="beacon-lockup-symbol" src={`${import.meta.env.BASE_URL}assets/beacon/logo-white.svg`} alt="" />
      <img className="beacon-lockup-wordmark" src={`${import.meta.env.BASE_URL}assets/beacon/wordmark-white.svg`} alt="Beacon Trust" />
    </div></div>
  </div>;
}
