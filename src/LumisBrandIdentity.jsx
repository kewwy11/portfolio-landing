import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './lumis-brand-identity.css';
import { LogoAnatomyArtwork, StoryArtwork1, StoryArtwork2, StoryArtwork3, StoryArtwork4, StoryArtwork5, StoryArtwork6 } from './LumisFigmaArtwork';

const asset = name => `${import.meta.env.BASE_URL}assets/lumis-brand/${name}`;
const design = (group, name, ext = 'svg') => asset(`design-${group}-${name}.${ext}`);

// The brand artwork uses Figma coordinates. Scale the complete composition,
// rather than independently resizing its type, images, and annotations.
export function Artboard({ width, height, className = '', children, motionRef }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  const assignRef = useCallback(node => {
    ref.current = node;
    if (motionRef) motionRef.current = node;
  }, [motionRef]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={assignRef} className={`li-artboard ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
    <div className="li-canvas" style={{ width, height, transform: `scale(${scale})` }}>{children}</div>
  </div>;
}

function useVisibleLoop(ref, create) {
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const root = ref.current;
      if (!root) return undefined;
      const timeline = create(root).pause();
      let visible = false;
      const sync = () => timeline.paused(!visible || document.hidden);
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      }, { threshold: 0.12 });
      observer.observe(root);
      document.addEventListener('visibilitychange', sync);
      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', sync);
        timeline.kill();
      };
    });
    return () => media.revert();
  }, [ref, create]);
}

function logoConstruction(root) {
  // Keep the drawing sequence in visual order. querySelectorAll returns DOM
  // order, which puts the symbol guide before the connector lines.
  const lines = ['.lf-6', '.lf-9', '.lf-11', '.lf-18', '.lf-symbol-guide']
    .map(selector => root.querySelector(selector))
    .filter(Boolean);
  const masks = ['inset(0 100% 0 0)', 'inset(0 0 100% 0)', 'inset(0 0 100% 0)', 'inset(0 0 100% 0)', 'inset(0 100% 0 0)'];
  const points = [...root.querySelectorAll('.lf-3, .lf-4, .lf-5')];
  const labels = [...root.querySelectorAll('.lf-13, .lf-15, .lf-16, .lf-17')];
  lines.forEach((line, index) => gsap.set(line, { clipPath: masks[index] }));
  gsap.set(points, { autoAlpha: 0, scale: 0.78, transformOrigin: '50% 50%' });
  gsap.set(labels, { autoAlpha: 0, y: 9 });

  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.18 });
  lines.forEach((line, index) => timeline.to(line, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 0.72,
    ease: 'power2.inOut',
  }, index * 0.075));
  timeline.to(points, { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)' }, 1.02)
    .to(labels, { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.09, ease: 'power3.out' }, 1.5)
    .to({}, { duration: 1.05 })
    .to(labels, { autoAlpha: 0, y: 8, duration: 0.26, stagger: 0.045, ease: 'power2.in' })
    .to(points, { autoAlpha: 0, scale: 0.78, duration: 0.2, stagger: 0.04, ease: 'power1.in' }, '<');
  [...lines].reverse().forEach((line, index) => timeline.to(line, {
    clipPath: masks[lines.length - index - 1],
    duration: 0.32,
    ease: 'power1.inOut',
  }, index === 0 ? '<' : '<+0.035'));
  return timeline;
}

function typefaceEntrance(root) {
  const labels = [...root.querySelectorAll('.li-type-labels span')];
  const glyphs = [...root.querySelectorAll('.li-specimen span')];
  const captions = [...root.querySelectorAll('.li-type-caption span')];
  gsap.set(labels, { autoAlpha: 0, y: -10 });
  gsap.set(glyphs, { autoAlpha: 0, y: 26, scale: 0.94, transformOrigin: '50% 75%' });
  gsap.set(captions, { autoAlpha: 0, y: 10 });
  return gsap.timeline()
    .to(labels, { autoAlpha: 1, y: 0, duration: 0.44, stagger: 0.06, ease: 'power3.out' })
    .to(glyphs, { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.1, ease: 'power3.out' }, '-=0.16')
    .to(captions, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.06, ease: 'power3.out' }, '-=0.2');
}

function pullPostRail(root) {
  const track = root.querySelector('.li-post-track');
  const cards = [...track.children];
  const step = 416;
  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });
  for (let index = 0; index < 2; index += 1) {
    const current = cards[index];
    const next = cards[index + 1];
    const offset = -(index + 1) * step;
    timeline.to(track, { x: offset - 14, duration: 0.58, ease: 'power2.inOut' })
      .to(track, { x: offset, duration: 0.26, ease: 'power3.out' })
      .to(current, { scale: 0.985, duration: 0.7, ease: 'power2.inOut' }, '<-0.58')
      .to(next, { scale: 1, duration: 0.7, ease: 'power2.inOut' }, '<')
      .to({}, { duration: 1.55 });
  }
  timeline.set(track, { x: 0 }).set(cards, { scale: 1 }, '<');
  return timeline;
}

function useVisibleImageSequence(ref, count, interval = 20) {
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => setEnabled(visible && !document.hidden && !reducedMotion.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [ref]);
  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setInterval(() => setActive(index => (index + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [enabled, count, interval]);
  return active;
}

function Image({ src, x, y, width, height, alt = '', className = '' }) {
  return <img className={`li-positioned ${className}`} src={src} alt={alt} loading="lazy" style={{ left: x, top: y, width, height }} />;
}

function LogoStage() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`lb-logo-stage${revealed ? ' is-revealed' : ''}`} aria-label="Lumis logo reveal">
    <p className="lb-logo-stage-label">Logo animation</p>
    <div className="lb-logo-stage-lockup"><img src={asset('hero-symbol.svg')} alt="" /><img src={asset('hero-wordmark.svg')} alt="Lumis" /></div>
  </div>;
}

function Anatomy() {
  const ref = useRef(null);
  useVisibleLoop(ref, logoConstruction);
  return <Artboard width={555} height={700} motionRef={ref}><LogoAnatomyArtwork /></Artboard>;
}

function Consultation() {
  const ref = useRef(null);
  const photos = [
    ['identity-consultation-frame-1.png', 'Dermatologist consulting with a patient'],
    ['identity-consultation-frame-2.png', 'Patient speaking with a dermatologist over video'],
    ['identity-consultation-frame-3.png', 'Patient receiving an in-clinic skincare treatment'],
    ['identity-consultation-frame-4.png', 'Dermatologist discussing skincare with a patient'],
  ];
  const active = useVisibleImageSequence(ref, photos.length);
  return <Artboard width={555} height={700} motionRef={ref} className="li-consultation-artboard">
    <div className="li-consultation-slides" aria-hidden="true">
      {photos.map(([photo], index) => <img key={photo} className={active === index ? 'is-active' : ''} src={asset(photo)} alt="" loading="eager" />)}
    </div>
    {[
      ['imgGroup1', 224.93, 240, 105.15, 90.13],
      ['imgGroup2', 139, 339.66, 277, 64.06],
      ['imgGroup3', 185.04, 421.86, 184.23, 10.64],
      ['imgGroup4', 180.06, 281.88, 24.75, 10.71],
      ['imgGroup5', 347.03, 281.86, 36.15, 10.73],
      ['imgGroup6', 244.97, 451.78, 65.35, 8.43],
    ].map(([name, x, y, width, height]) => <Image key={name} src={design('361-365', name)} {...{ x, y, width, height }} />)}
  </Artboard>;
}

const colors = [
  ['#1d4ed8', '1D4ED8', '29, 78, 216', '0.87, 0.64, 0.00, 0.15'],
  ['#f59e0b', 'F59E0B', '245, 158, 11', '0, 36, 96, 4'],
  ['#0f172a', '0F172A', '15, 23, 42', '0.0, 0.0, 0.0, 0.0'],
  ['#fff8eb', 'FFF8EB', '255, 248, 235', '0, 0.03, 0.08, 0'],
  ['#eff6ff', 'EFF6FF', '239, 246, 255', '0.06, 0.04, 0.00, 0.0'],
];

function Palette() {
  return <Artboard width={1134} height={700}>
    <Image src={asset('identity-skin-closeup.png')} x={0} y={0} width={1134} height={700} alt="Skin texture behind the Lumis colour palette" />
    <div className="li-palette">{colors.map(([color, hex, rgb, cmyk]) => <div className="li-swatch-card" key={hex}>
      <div className="li-swatch" style={{ background: color }} />
      <dl>{[['HEX', hex], ['RGB', rgb], ['CMYK', cmyk]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </div>)}</div>
  </Artboard>;
}

function Typeface({ mono = false }) {
  const ref = useRef(null);
  useVisibleLoop(ref, typefaceEntrance);
  return <Artboard width={559} height={730} motionRef={ref} className={mono ? 'li-type li-type-mono' : 'li-type li-type-sora'}>
    <div className="li-type-labels"><span>{mono ? 'Light' : 'Thin'}</span><span>{mono ? 'Supporting & Social media' : 'Headers & Body'}</span></div>
    <div className="li-specimen"><span>A</span><span>a</span></div>
    <div className="li-type-caption"><span>{mono ? 'DM Mono - Monospace' : 'Sora sans serif'}</span><span>{mono ? 'Accent typeface' : 'Primary typeface'}</span></div>
  </Artboard>;
}

function Post({ light = false, second = false, duplicate = false }) {
  const suffix = light ? '2' : '1';
  return <div className={`li-post${light ? ' li-post-light' : ''}`} aria-hidden={duplicate || undefined}>
    <div className="li-post-header"><span><img src={asset('hero-symbol.svg')} alt="" /></span><b>Lumis</b><img src={design('306-3135', light ? 'imgFrame1394' : 'imgFrame1393')} alt="" /></div>
    <img className="li-post-photo" src={design('306-3135', second ? 'imgFrame1387' : 'imgFrame1386', 'png')} alt="Lumis skin education campaign" loading="lazy" />
    <div className="li-post-footer">{[`imgHeart2${suffix}`, `imgBeacon1${suffix}`, `imgPaperPlane2${suffix}`, `imgBookmark${suffix}`].map(name => <img src={design('306-3135', name)} alt="" key={name} />)}</div>
  </div>;
}

function StoryCards({ duplicate = false }) {
  const stories = [StoryArtwork1, StoryArtwork2, StoryArtwork3, StoryArtwork4, StoryArtwork5, StoryArtwork6];
  return <div className="li-stories-group" aria-hidden={duplicate || undefined}>
    {stories.map((Story, index) => <Artboard key={index} width={374.093} height={665.054}><Story /></Artboard>)}
  </div>;
}

function StoryMarquee() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`li-stories${visible ? ' is-visible' : ''}`} tabIndex={0} role="region" aria-label="Lumis story designs moving horizontally">
    <div className="li-stories-track"><StoryCards /><StoryCards duplicate /></div>
  </div>;
}

function SocialRail() {
  const ref = useRef(null);
  useVisibleLoop(ref, pullPostRail);
  return <Artboard width={555} height={700} className="li-amber" motionRef={ref}>
    <div className="li-post-track">
      <Post light />
      <Post light second />
      <Post light duplicate />
      <Post light second duplicate />
    </div>
  </Artboard>;
}

export default function LumisBrandIdentity() {
  return <section id="lumis-brand-identity" className="lb-section li-identity" aria-labelledby="lumis-brand-identity-title">
    <div className="lumis-brand-section-intro">
      <h2 id="lumis-brand-identity-title">The Identity</h2>
      <div className="lumis-brand-intro-copy">
        <p>We designed a logo that reflected what Lumis stood for: care, skin, people, and technology.</p>
        <p>The heart represents care, while cells make up the logo, inspired by what our skin is made of. The circle at the centre represents a person, while the connected forms are inspired by neural networks and modern technology.</p>
        <p>Blue was chosen as the primary colour to represent trust and give the brand a premium feel, while amber, sky blue, and bright butter yellow added warmth and energy.</p>
        <p>For typography, we used Sora for its clean, bold, and easy-to-read character, reflecting clarity and professionalism. It was paired with the geometric DM to bring a more modern, futuristic feel with a subtle nod to technology.</p>
        <p>For social media, we used imagery showing different skin conditions across various skin tones, paired with language that felt fun, lively, and emotional rather than overly clinical.</p>
      </div>
    </div>
    <LogoStage />
    <div className="li-pair li-logo-pair"><Anatomy /><Consultation /></div>
    <Palette />
    <div className="li-pair"><Typeface /><Typeface mono /></div>
    <StoryMarquee />
    <div className="li-pair li-social-pair">
      <Artboard width={555} height={700} className="li-amber"><div className="li-single-post"><Post /></div></Artboard>
      <SocialRail />
    </div>
  </section>;
}
