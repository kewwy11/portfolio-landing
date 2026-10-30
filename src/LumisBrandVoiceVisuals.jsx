import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Artboard, useVisibleImageSequence } from './LumisBrandIdentity';
import { VoiceTraitsArtwork, VoiceMessageArtwork, PortraitOneArtwork, PortraitTwoArtwork, PortraitThreeArtwork, ConsultationArtwork, SkinPatternArtwork, AccuracyArtwork } from './LumisFigmaArtwork';
import './lumis-brand-voice-visuals.css';

function Intro({ id, title, children }) {
  return <div className="lumis-brand-section-intro"><h2 id={id}>{title}</h2><div className="lumis-brand-intro-copy"><p>{children}</p></div></div>;
}

function VoiceTraits() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const fills = [...root.querySelectorAll('.lv-trait-fill')];
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ paused:true, repeat:-1 })
        .fromTo(fills, { scaleX:0, transformOrigin:'left center', force3D:true }, { scaleX:1, duration:1.45, ease:'sine.inOut' })
        .to({}, { duration:1.6 })
        .to(fills, { scaleX:0, duration:.85, ease:'sine.inOut' })
        .to({}, { duration:.2 });
      let visible = false;
      const sync = () => timeline.paused(!visible || document.hidden);
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold:.08 });
      observer.observe(root);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); };
    });
    return () => media.revert();
  }, []);
  return <Artboard width={555} height={551} motionRef={ref}><VoiceTraitsArtwork /></Artboard>;
}

function VoiceMessage() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const cards = [...root.querySelectorAll('.lv-stack-card')];
    const copy = cards.map(card => [...card.children]);
    const positions = [
      { x: 34, y: 0, scale: 359 / 427, backgroundColor: 'rgba(255,255,255,.55)' },
      { x: 17, y: 15, scale: 393 / 427, backgroundColor: 'rgba(255,255,255,.8)' },
      { x: 0, y: 31, scale: 1, backgroundColor: '#fff' },
    ];
    cards.forEach((card, index) => {
      gsap.set(card, { ...positions[index], zIndex: index + 1 });
      gsap.set(copy[index], { autoAlpha: index === 2 ? 1 : 0 });
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timeline = gsap.timeline({ repeat: -1, paused: true });
    for (let step = 0; step < 3; step += 1) {
      const at = step * 3.2 + 2.1;
      const outgoing = cards[(2 - step + 3) % 3];
      const incoming = cards[(1 - step + 3) % 3];
      const moving = cards.filter(card => card !== outgoing);
      const target = index => positions[(cards.indexOf(moving[index]) + step + 1) % 3];
      timeline.to(outgoing, { x: 34, y: -120, scale: 0.87, duration: 0.52, ease: 'sine.inOut' }, at)
        .to(copy[cards.indexOf(outgoing)], { autoAlpha: 0, duration: .14, ease: 'sine.out' }, at + .52)
        .to(moving, {
          x: index => target(index).x,
          y: index => target(index).y,
          scale: index => target(index).scale,
          backgroundColor: index => target(index).backgroundColor,
          duration: 1.04,
          ease: 'sine.inOut',
        }, at)
        .set(cards, { zIndex: index => ((index + step + 1) % 3) + 1 }, at + .66)
        .to(copy[cards.indexOf(incoming)], { autoAlpha: 1, duration: .38, ease: 'sine.inOut' }, at + .66)
        .to(outgoing, { ...positions[0], duration: 0.52, ease: 'sine.inOut' }, at + 0.52);
    }
    let visible = false;
    const sync = () => timeline.paused(!visible || document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.2 });
    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); };
  }, []);
  return <Artboard width={555} height={551} className="lv-message" motionRef={ref}><VoiceMessageArtwork /></Artboard>;
}

export function LumisVoice() {
  return <section id="lumis-brand-voice" className="lb-section lv-voice" aria-labelledby="lumis-brand-voice-title">
    <Intro id="lumis-brand-voice-title" title="Lumis Voice">We wanted Lumis to sound conversational, warm, and human. Instead of cold directions or language that made the AI feel like the focus, we used a voice that offered guidance and reassurance. The tone was friendly and emotional while still feeling credible and serious enough for a medical brand.</Intro>
    <div className="lv-pair">
      <VoiceTraits />
      <VoiceMessage />
    </div>
  </section>;
}

function SkinSequence() {
  const ref = useRef(null);
  useVisibleImageSequence(ref);
  return <Artboard width={555.5} height={780} motionRef={ref}>
    <div className="li-consultation-slides">{Array.from({length:5}, (_, i) => <img key={i} className={i === 0 ? 'is-active' : ''} src={`${import.meta.env.BASE_URL}assets/lumis-brand/skin-sequence-${i}.png`} alt="Skin detail" style={{inset:"auto",left:"50%",top:`calc(50% + ${[-9,-9,.5,29.5,-9][i]}px)`,width:[915,915,781,838,915][i],height:[914,914,781,839,914][i],maxWidth:"none",transform:"translate(-50%,-50%)"}} />)}</div>
    <img src={`${import.meta.env.BASE_URL}assets/lumis-brand/revised-874-413-imgBpattern2.svg`} alt="" style={{position:"absolute",left:-342,top:-202,width:1348,height:1348,maxWidth:"none",pointerEvents:"none"}} />
  </Artboard>;
}
function AccuracyMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const rows = [...ref.current.querySelectorAll('.lf-91')];
    const active = rows.slice(0, -1).flatMap(row => [...row.querySelectorAll('img')]);
    const inactive = rows.at(-1).querySelector('img').src;
    const sources = active.map(img => img.src);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const reset = () => active.forEach((img,i) => { img.src = i === 0 ? sources[0] : inactive; });
      reset();
      const timeline = gsap.timeline({ paused:true, repeat:-1, repeatDelay:1.6 });
      timeline.call(reset, [], 0);
      active.slice(1).forEach((img,i) => timeline.call(() => { img.src = sources[i + 1]; }, [], .03 + (i + 1) * .045));
      let visible = false;
      const sync = () => timeline.paused(!visible || document.hidden);
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !visible) timeline.restart();
        visible = entry.isIntersecting;
        sync();
      }, {threshold:.05, rootMargin:'0px 0px 40px 0px'});
      observer.observe(ref.current);
      document.addEventListener('visibilitychange', sync);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); timeline.kill(); active.forEach((img,i) => { img.src = sources[i]; }); };
    });
    return () => media.revert();
  }, []);
  return <Artboard width={555.5} height={780} motionRef={ref}><AccuracyArtwork /></Artboard>;
}

export function LumisVisuals() {
  const portraitsRef = useRef(null);
  useEffect(() => {
    const root = portraitsRef.current;
    const labels = [...root.querySelectorAll('.lv-diagnostic-label')];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    gsap.set(labels, { autoAlpha: 0 });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio >= .8) {
          gsap.to(entry.target, { autoAlpha:1, duration:.7, ease:'sine.out', overwrite:true });
        } else if (!entry.isIntersecting) {
          gsap.set(entry.target, { autoAlpha:0 });
        }
      });
    }, {threshold:[0,.8], rootMargin:'0px 0px -8% 0px'});
    labels.forEach(label => observer.observe(label));
    return () => { observer.disconnect(); gsap.killTweensOf(labels); };
  }, []);
  return <section id="lumis-brand-visuals" className="lb-section lv-visuals" aria-labelledby="lumis-brand-visuals-title">
    <Intro id="lumis-brand-visuals-title" title="Lumis Visuals">We used imagery across different touch points to show Lumis as a part of everyday healthcare. This included doctor consultations, patients in their day-to-day lives, conditions shown across different parts of the body not just the face and diagnostic moments through imagery and information cards.</Intro>
    <div className="lv-gallery">
      <div ref={portraitsRef} className="lv-portraits">
        <Artboard width={376.33} height={704}><PortraitOneArtwork /></Artboard>
        <Artboard width={376.33} height={704}><PortraitTwoArtwork /></Artboard>
        <Artboard width={375.33} height={704}><PortraitThreeArtwork /></Artboard>
      </div>
      <div className="lv-pair">
        <Artboard width={555.5} height={780}><img data-node-id="312:3981" src={`${import.meta.env.BASE_URL}assets/videos/lumis-care.gif`} alt="Lumis Care lifestyle and focus menu animation" width="555.5" height="780" style={{width:555.5,height:780,objectFit:'contain'}} loading="lazy" /></Artboard>
        <Artboard width={555.5} height={780}><ConsultationArtwork /></Artboard>
      </div>
      <div className="lv-pair">
        <SkinSequence />
        <AccuracyMotion />
      </div>
    </div>
  </section>;
}
