import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Artboard } from './LumisBrandIdentity';
import { VoiceTraitsArtwork, VoiceMessageArtwork, PortraitOneArtwork, PortraitTwoArtwork, PortraitThreeArtwork, CareMenuArtwork, ConsultationArtwork, SkinPatternArtwork, AccuracyArtwork } from './LumisFigmaArtwork';
import './lumis-brand-voice-visuals.css';

function Intro({ id, title, children }) {
  return <div className="lumis-brand-section-intro"><h2 id={id}>{title}</h2><div className="lumis-brand-intro-copy"><p>{children}</p></div></div>;
}

function VoiceTraits() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const fills = [...root.querySelectorAll('.lv-trait-fill')];
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return undefined;
    gsap.set(fills, { width: 0 });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gsap.to(fills, { width: index => Number(fills[index].dataset.target), duration: 1.8, stagger: 0.07, ease: 'power2.in' });
      observer.disconnect();
    }, { threshold: 0.28 });
    observer.observe(root);
    return () => { observer.disconnect(); gsap.killTweensOf(fills); };
  }, []);
  return <Artboard width={555} height={551} motionRef={ref}><VoiceTraitsArtwork /></Artboard>;
}

function VoiceMessage() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    const cards = [...root.querySelectorAll('.lf-30, .lf-35, .lf-40')];
    const positions = [
      { x: 34, y: 0, scale: 359 / 427, opacity: 0.5 },
      { x: 17, y: 15, scale: 393 / 427, opacity: 0.7 },
      { x: 0, y: 31, scale: 1, opacity: 1 },
    ];
    cards.forEach((card, index) => gsap.set(card, { ...positions[index], zIndex: index + 1 }));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timeline = gsap.timeline({ repeat: -1, paused: true });
    for (let step = 0; step < 3; step += 1) {
      const at = step * 2.85 + 1.9;
      timeline.to(cards, {
        x: index => positions[(index + step + 1) % 3].x,
        y: index => positions[(index + step + 1) % 3].y,
        scale: index => positions[(index + step + 1) % 3].scale,
        opacity: index => positions[(index + step + 1) % 3].opacity,
        duration: 0.95,
        ease: 'power2.inOut',
      }, at).set(cards, { zIndex: index => ((index + step + 1) % 3) + 1 }, at + 0.48);
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

export function LumisVisuals() {
  return <section id="lumis-brand-visuals" className="lb-section lv-visuals" aria-labelledby="lumis-brand-visuals-title">
    <Intro id="lumis-brand-visuals-title" title="Lumis Visuals">We used imagery across different touch points to show Lumis as a part of everyday healthcare. This included doctor consultations, patients in their day-to-day lives, conditions shown across different parts of the body not just the face and diagnostic moments through imagery and information cards.</Intro>
    <div className="lv-gallery">
      <div className="lv-portraits">
        <Artboard width={376.33} height={704}><PortraitOneArtwork /></Artboard>
        <Artboard width={376.33} height={704}><PortraitTwoArtwork /></Artboard>
        <Artboard width={375.33} height={704}><PortraitThreeArtwork /></Artboard>
      </div>
      <div className="lv-pair">
        <Artboard width={555.5} height={780}><CareMenuArtwork /></Artboard>
        <Artboard width={555.5} height={780}><ConsultationArtwork /></Artboard>
      </div>
      <div className="lv-pair">
        <Artboard width={555.5} height={780}><SkinPatternArtwork /></Artboard>
        <Artboard width={555.5} height={780}><AccuracyArtwork /></Artboard>
      </div>
    </div>
  </section>;
}
