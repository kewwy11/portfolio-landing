import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import LumisBrandIdentity from './LumisBrandIdentity';
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

function Application() {
  const ref = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = ref.current.querySelectorAll('.lb-app-finale span');
    const timeline = gsap.timeline({repeat:-1, paused:true});
    timeline.to(words[0], {left:'66.28%', top:'73.85%', duration:1.4, ease:'power2.inOut'}, 2.6)
      .to(words[1], {left:'20.59%', top:'20.77%', duration:1.4, ease:'power2.inOut'}, 2.6)
      .to(words[0], {left:'20.59%', top:'20.77%', duration:1.4, ease:'power2.inOut'}, 6.6)
      .to(words[1], {left:'66.28%', top:'73.85%', duration:1.4, ease:'power2.inOut'}, 6.6);
    const observer = new IntersectionObserver(([entry]) => timeline.paused(!entry.isIntersecting), {threshold:.15});
    observer.observe(ref.current.querySelector('.lb-app-finale'));
    return () => { observer.disconnect(); timeline.kill(); };
  }, []);
  return <section ref={ref} id="lumis-brand-application" className="lb-section lb-application" aria-labelledby="lumis-brand-application-title">
    <Intro id="lumis-brand-application-title" title="Application"><p>We showed how Lumis could exist in the real world through different brand applications. From billboards that communicated how we wanted people to perceive the brand, to logos applied across merchandise, doctor uniforms, and business cards.</p></Intro>
    <div className="lb-application-gallery">
      <figure className="lb-app-wide"><img src={asset('application-billboard.png')} alt="Lumis billboard in a city setting" loading="lazy" /></figure>
      <div className="lb-app-pair"><div className="lb-app-stack"><img src={asset('application-sign.png')} alt="Lumis sign on a building" loading="lazy" /><img src={asset('application-poster.png')} alt="Lumis street poster" loading="lazy" /></div><figure><img src={asset('application-uniform.png')} alt="Lumis logo on a healthcare uniform" loading="lazy" /></figure></div>
      <div className="lb-app-pair lb-app-cards"><figure><img className="lb-card-background" src={asset('application-card-background.png')} alt="" loading="lazy" /><img className="lb-card-front" src={asset('application-card-front.png')} alt="Lumis business card front" loading="lazy" /><img className="lb-card-back" src={asset('application-card-back.png')} alt="Lumis business card back" loading="lazy" /></figure><figure><img src={asset('application-street.png')} alt="Lumis campaign billboards on a city street" loading="lazy" /></figure></div>
      <div className="lb-app-finale"><div><span>For every</span><img src={asset('application-skin.png')} alt="Close-up of skin" loading="lazy" /><span>skin type</span></div><div><img src={asset('application-skin.png')} alt="Skin texture" loading="lazy" /><p>Every<br />skin tone,<br />every skin<br />condition<br />is included.</p></div></div>
    </div>
  </section>;
}

export default function LumisBrandSections() {
  return <><LumisBrandIdentity /><LumisVoice /><LumisVisuals /><Application /></>;
}
