import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useLayoutEffect } from 'react';
import './lumis-brand-identity.css';
import Media from './Media.jsx';
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
  useLayoutEffect(() => {
    setScale(ref.current.getBoundingClientRect().width / width);
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={assignRef} className={`li-artboard ${className}`} style={{ aspectRatio: `${width}/${height}`, "--li-scale": scale }}>
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
  const lines = ['.lf-6', '.lf-9', '.lf-11', '.lf-18']
    .map(selector => root.querySelector(selector))
    .filter(Boolean);
  const masks = ['inset(0 100% 0 0)', 'inset(0 0 100% 0)', 'inset(0 0 0 100%)', 'inset(100% 0 0 0)'];
  const points = [...root.querySelectorAll('.lf-3, .lf-4, .lf-5')];
  const labels = [...root.querySelectorAll('.lf-13, .lf-15, .lf-16, .lf-17')];
  const directions = [1, -1, -1, 1];
  lines.forEach((line, index) => gsap.set(line, index === 1 || index === 3
    ? { scaleY: 0, transformOrigin: index === 1 ? 'top center' : 'bottom center' }
    : { clipPath: masks[index] }));
  gsap.set(points, { autoAlpha: 0, scale: 0.78, transformOrigin: '50% 50%' });
  labels.forEach((label, index) => {
    gsap.set(label, { clipPath: directions[index] > 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' });
    gsap.set(label, { y: directions[index] * 18, autoAlpha: 0 });
  });

  const timeline = gsap.timeline();
  lines.forEach((line, index) => timeline.to(line, {
    ...(index === 1 || index === 3 ? { scaleY: 1 } : { clipPath: 'inset(-2px -2px -2px -2px)' }),
    duration: 0.78,
    ease: 'power2.inOut',
    onComplete: () => gsap.set(line, { clearProps: 'clipPath' }),
  }, index * 0.08));
  timeline.to(points, { autoAlpha: 1, scale: 1, duration: 0.28, stagger: 0.06, ease: 'power2.out' }, 0.88);
  labels.forEach((label, index) => {
    const at = 1.18 + index * 0.1;
    timeline.to(label, { clipPath: 'inset(0 0 0 0)', duration: 0.52, ease: 'power3.out' }, at)
      .to(label, { y: 0, autoAlpha: 1, duration: 0.65, ease: 'power2.out' }, at);
  });
  return timeline;
}

function typefaceCycle(root) {
  const glyph = root.querySelector('.li-specimen-layer');
  const label = root.querySelector('.li-weight-label');
  const chip = label.parentElement;
  const mono = root.classList.contains('li-type-mono');
  const variants = mono
    ? [
      { name: 'Light', stroke: 0, skew: 0 },
      { name: 'Regular', stroke: 2.2, skew: 0 },
      { name: 'Medium', stroke: 4.2, skew: 0 },
      { name: 'Light Italic', stroke: 0, skew: -10 },
      { name: 'Regular Italic', stroke: 2.2, skew: -10 },
      { name: 'Medium Italic', stroke: 4.2, skew: -10 },
    ]
    : [
      { name: 'Thin', weight: 100 },
      { name: 'Extra light', weight: 200 },
      { name: 'Light', weight: 300 },
      { name: 'Regular', weight: 400 },
      { name: 'Medium', weight: 500 },
      { name: 'Semi-bold', weight: 600 },
      { name: 'Bold', weight: 700 },
      { name: 'Extra Bold', weight: 800 },
    ];
  const nextLabel = label.cloneNode(true);
  nextLabel.classList.add('li-weight-next');
  nextLabel.setAttribute('aria-hidden', 'true');
  chip.appendChild(nextLabel);
  const timeline = gsap.timeline({ repeat: -1 });
  variants.forEach((variant, index) => {
    const next = variants[(index + 1) % variants.length];
    const at = index * 1.45;
    timeline.call(() => { label.textContent = variant.name; nextLabel.textContent = next.name; }, [], at)
      .set(label, { yPercent: 0 }, at).set(nextLabel, { yPercent: 100 }, at);
    const start = at + 0.5;
    timeline.to(label, { yPercent: -100, duration: 0.95, ease: 'sine.inOut' }, start)
      .to(nextLabel, { yPercent: 0, duration: 0.95, ease: 'sine.inOut' }, start)
      .to(glyph, mono
        ? { webkitTextStrokeWidth: next.stroke, skewX: next.skew, duration: 0.95, ease: 'sine.inOut' }
        : { fontWeight: next.weight, duration: 0.95, ease: 'sine.inOut' }, start);
  });
  const originalKill = timeline.kill.bind(timeline);
  timeline.kill = () => { nextLabel.remove(); originalKill(); };
  return timeline;
}

function pullPostRail(root) {
  const track = root.querySelector('.li-post-track');
  const cards = [...track.children];
  const count = Number(track.dataset.count);
  const timeline = gsap.timeline({ repeat: -1 });
  for (let index = 0; index < count; index += 1) {
    timeline.to(track, {
      x: () => -(index + 1) * (cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap)),
      duration: 2.6,
      // Accelerate into each pull without ever stopping between cards.
      ease: progress => progress - .14 * Math.sin(2 * Math.PI * progress),
    });
  }
  // The next group is identical: resetting here preserves the exact visible frame.
  timeline.set(track, { x: 0 });
  return timeline;
}

export function useVisibleImageSequence(ref, interval = 1050) {
  useEffect(() => {
    const root = ref.current;
    const images = [...root.querySelectorAll('.li-consultation-slides img')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let ready = false;
    let disposed = false;
    let timer = 0;
    let active = 0;
    const advance = () => {
      const next = (active + 1) % images.length;
      images[next].classList.add('is-active');
      images[active].classList.remove('is-active');
      active = next;
    };
    const sync = () => {
      window.clearInterval(timer);
      if (ready && visible && !document.hidden && !reducedMotion.matches && !disposed) timer = window.setInterval(advance, interval);
    };
    // Keep the first photo visible until every frame is decoded, including on slow connections.
    Promise.all(images.map(image => image.decode())).then(() => { ready = true; sync(); }).catch(() => {});
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.12 });
    observer.observe(root);
    reducedMotion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      observer.disconnect();
      reducedMotion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [ref, interval]);
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
  useEffect(() => {
    const root = ref.current;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {}, root);
    let timeline;
    context.add(() => { timeline = logoConstruction(root).pause(0); });
    let entered = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= .45 && !entered) {
        entered = true;
        timeline.restart();
      } else if (!entry.isIntersecting) { entered = false; }
    }, {threshold:[0,.45]});
    observer.observe(root);
    return () => { observer.disconnect(); context.revert(); };
  }, []);
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
  useVisibleImageSequence(ref);
  return <Artboard width={555} height={700} motionRef={ref} className="li-consultation-artboard">
    <div className="li-consultation-slides" aria-hidden="true">
      {photos.map(([photo], index) => <img key={photo} className={index === 0 ? 'is-active' : ''} src={asset(photo)} alt="" loading="eager" />)}
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
  useVisibleLoop(ref, typefaceCycle);
  return <Artboard width={559} height={730} motionRef={ref} className={mono ? 'li-type li-type-mono' : 'li-type li-type-sora'}>
    <div className="li-type-labels"><span className="li-weight-chip"><span className="li-weight-window"><i className="li-weight-label">{mono ? 'Light' : 'Thin'}</i></span></span><span>{mono ? 'Supporting & Social media' : 'Headers & Body'}</span></div>
    <div className="li-specimen"><span className="li-specimen-layer" style={{ fontWeight: mono ? 300 : 100 }}>Aa</span></div>
    <div className="li-type-caption"><span>{mono ? 'DM Mono - Monospace' : 'Sora sans serif'}</span><span>{mono ? 'Accent typeface' : 'Primary typeface'}</span></div>
  </Artboard>;
}

function Post({ light = false, index = 0, duplicate = false }) {
  const suffix = light ? '2' : '1';
  const actions = light
    ? ['post-ui-heart.svg', 'post-ui-comment.svg', 'post-ui-send.svg', 'post-ui-save.svg'].map(asset)
    : [`imgHeart2${suffix}`, `imgBeacon1${suffix}`, `imgPaperPlane2${suffix}`, `imgBookmark${suffix}`].map(name => design('306-3135', name));
  return <div className={`li-post${light ? ' li-post-light' : ''}`} aria-hidden={duplicate || undefined}>
    <div className="li-post-header"><span><img src={light ? asset('post-ui-logo.svg') : asset('hero-symbol.svg')} alt="" /></span><b>Lumis</b><img src={light ? asset('post-ui-menu.svg') : design('306-3135', 'imgFrame1393')} alt="" /></div>
    {light ? <img className="li-post-photo" src={asset(`post-${index + 1}.webp`)} alt="Lumis skin education campaign" loading="eager" /> : <Media className="li-post-photo" image="lumis-brand/post-treatment.png" video="lumis-brand/post-treatment.mp4" alt="Skincare treatment with protective eye shields" />}
    <div className="li-post-footer">{actions.map(src => <img src={src} alt="" key={src} />)}</div>
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
    <div className="li-post-track" data-count="8">
      {Array.from({ length: 16 }, (_, index) => <Post key={index} light index={index % 8} duplicate={index >= 8} />)}
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
