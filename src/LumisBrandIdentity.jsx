import React, { useEffect, useRef, useState } from 'react';
import './lumis-brand-identity.css';
import { LogoAnatomyArtwork, StoryArtwork1, StoryArtwork2, StoryArtwork3, StoryArtwork4, StoryArtwork5, StoryArtwork6 } from './LumisFigmaArtwork';

const asset = name => `${import.meta.env.BASE_URL}assets/lumis-brand/${name}`;
const design = (group, name, ext = 'svg') => asset(`design-${group}-${name}.${ext}`);

// The brand artwork uses Figma coordinates. Scale the complete composition,
// rather than independently resizing its type, images, and annotations.
export function Artboard({ width, height, className = '', children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [width]);
  return <div ref={ref} className={`li-artboard ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
    <div className="li-canvas" style={{ width, height, transform: `scale(${scale})` }}>{children}</div>
  </div>;
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

function Anatomy() { return <Artboard width={555} height={700}><LogoAnatomyArtwork /></Artboard>; }

function Consultation() {
  return <Artboard width={555} height={700}>
    <Image src={design('361-365', 'imgChatGptImageJun52026123526Pm1', 'png')} x={-2} y={1} width={559} height={698} alt="Lumis dermatologist consulting with a patient" />
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
  return <Artboard width={559} height={730} className={mono ? 'li-type li-type-mono' : 'li-type li-type-sora'}>
    <div className="li-type-labels"><span>{mono ? 'Light' : 'Thin'}</span><span>{mono ? 'Supporting & Social media' : 'Headers & Body'}</span></div>
    <div className="li-specimen">Aa</div>
    <div className="li-type-caption"><span>{mono ? 'DM Mono - Monospace' : 'Sora sans serif'}</span><span>{mono ? 'Accent typeface' : 'Primary typeface'}</span></div>
  </Artboard>;
}

function Post({ light = false, second = false }) {
  const suffix = light ? '2' : '1';
  return <div className={`li-post${light ? ' li-post-light' : ''}`}>
    <div className="li-post-header"><span><img src={asset('hero-symbol.svg')} alt="" /></span><b>Lumis</b><img src={design('306-3135', light ? 'imgFrame1394' : 'imgFrame1393')} alt="" /></div>
    <img className="li-post-photo" src={design('306-3135', second ? 'imgFrame1387' : 'imgFrame1386', 'png')} alt="Lumis skin education campaign" loading="lazy" />
    <div className="li-post-footer">{[`imgHeart2${suffix}`, `imgBeacon1${suffix}`, `imgPaperPlane2${suffix}`, `imgBookmark${suffix}`].map(name => <img src={design('306-3135', name)} alt="" key={name} />)}</div>
  </div>;
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
    <div className="li-stories" tabIndex={0} role="region" aria-label="Lumis story designs; scroll horizontally to see all six">{[StoryArtwork1, StoryArtwork2, StoryArtwork3, StoryArtwork4, StoryArtwork5, StoryArtwork6].map((Story, index) => <Artboard key={index} width={374.093} height={665.054}><Story /></Artboard>)}</div>
    <div className="li-pair li-social-pair">
      <Artboard width={555} height={700} className="li-amber"><div className="li-single-post"><Post /></div></Artboard>
      <Artboard width={555} height={700} className="li-amber"><div className="li-post-track"><Post light /><Post light second /></div></Artboard>
    </div>
  </section>;
}
