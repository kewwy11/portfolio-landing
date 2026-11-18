import React, { useEffect, useState } from 'react';
import Media from './Media.jsx';
import useRevealOnScroll from './useRevealOnScroll.js';
import { coreFlows, overviewCopy, problems, reflectionCopy, solutionCopy } from './french-cake-content.js';
import './french-cake-case-study.css';

const base = import.meta.env.BASE_URL;
const asset = name => `${base}assets/${name}`;
const sections = [
  ['Hero', 'hero'], ['Overview', 'overview'], ['Problem', 'problem'],
  ['Solution', 'solution'], ['Core flows', 'core-flows'], ['Reflection', 'reflection'],
];
const details = [
  ['Role', ['Product Designer', 'Product Strategist', 'Interaction designer', 'Developer']],
  ['Timeline', ['2 weeks']],
  ['Team', ['Solo project']],
  ['Industry', ['E-commerce']],
  ['Skills', ['UI Design', 'UX research', 'Product strategy', 'Development']],
];
const overviewImages = ['Frame1361', 'Frame1410', 'Frame1411'];
const journey = [
  ['Customer Explores website', 'imgMousePointerClick11', 32],
  ['Doesn’t Purchase', 'imgShoppingBag03', 32],
  ['Leaves Website', 'imgUserLogout1', 28],
];

function Paragraphs({ items, className }) {
  return <div className={className}>
    {items.map(item => <p key={item}>{item}</p>)}
  </div>;
}

function Heading({ label, children }) {
  return <header className="french-heading">
    <p className="french-eyebrow">{label}</p>
    <h2>{children}</h2>
  </header>;
}

function Film({ name, label, width, height, poster }) {
  return <div className="french-media" style={{ aspectRatio: `${width} / ${height}` }}>
    <Media video={`videos/${name}`} image={poster} alt={label} width={width} height={height} />
  </div>;
}

function Hero() {
  return <section id="hero" className="french-section french-hero">
    <header className="french-heading">
      <p className="french-eyebrow">A cake delivery website redesign concept</p>
      <h1>Small Design Decisions. Bigger Business Opportunities.</h1>
    </header>
    <Film name="french-cake-hero.mp4" label="The French Cake Company hero film" width={1127} height={626} />
    <dl className="french-meta">
      {details.map(([label, lines]) => <div key={label}>
        <dt>{label}</dt>
        <dd>{lines.join('\n')}</dd>
      </div>)}
    </dl>
    <div className="french-links">
      <a href="https://the-french-cake-company.vercel.app/" target="_blank" rel="noopener noreferrer">Redesigned Website</a>
      <a href="https://www.thefrenchcakecompany.com/en/" target="_blank" rel="noopener noreferrer">Original Website</a>
    </div>
  </section>;
}

function Overview() {
  const { ref, revealed, reducedMotion } = useRevealOnScroll({ threshold: 0.1, repeat: true });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all(Array.from(ref.current.querySelectorAll('img'), image => image.decode()))
      .then(() => { if (mounted) setReady(true); })
      .catch(() => { /* Keep the first image visible if a later slide fails to decode. */ });
    return () => { mounted = false; };
  }, [ref]);

  return <section id="overview" className="french-section french-overview">
    <Heading label="Overview">How Do You Redesign the Website of a 21-Year-Old Brand Without Losing Its Identity?</Heading>
    <div className="french-overview-grid">
      <div ref={ref} className="french-reveal" data-ready={ready} data-playing={revealed && !reducedMotion}>
        {overviewImages.map((file, index) => <img key={file}
          src={asset(`french-3-imgProperty1${file}.png`)}
          alt={index === 0 ? 'The French Cake Company cake design and celebration photography' : ''}
          width="503" height="600" />)}
      </div>
      <Paragraphs className="french-copy french-copy-spaced" items={overviewCopy} />
    </div>
  </section>;
}

function Banner({ image, children, className }) {
  return <header className={`french-banner ${className}`}>
    <img src={asset(image)} alt="" loading="lazy" />
    <div>{children}</div>
  </header>;
}

function EntryTitle({ number, title, continuation, large = false }) {
  return <header className={`french-entry-title${large ? ' french-entry-title-large' : ''}`}>
    <h3><span>{number}.</span><span>{title}{continuation && <><br />{continuation}</>}</span></h3>
    <p>Existing Experience</p>
  </header>;
}

function AcquisitionDiagram() {
  const { ref, revealed } = useRevealOnScroll({ threshold: 0.25 });

  return <ol ref={ref} className="french-journey" data-drawn={revealed} aria-label="Customer acquisition journey">
    {journey.map(([label, icon, size], index) => <li key={icon}
      style={{ '--card-start': `${index * 530}ms` }}>
      <div className="french-journey-card">
        <span className="french-journey-icon">
          <img src={asset(`french-4-${icon}.svg`)} alt="" width={size} height={size} />
        </span>
        <span>{label}</span>
      </div>
      {index < journey.length - 1 && <span className="french-journey-arrow" aria-hidden="true">
        <img src={asset(`french-4-imgArrow${2 - index}.svg`)} alt="" />
      </span>}
    </li>)}
  </ol>;
}

function DiscoveryVisual() {
  return <figure className="french-audit-frame french-discovery">
    <img className="french-discovery-screen" src={asset('french-4-imgFrame1411.png')}
      alt="Original product and service columns with their calls to action" loading="lazy" />
    <img className="french-discovery-outline french-discovery-outline-first"
      src={asset('french-4-imgVector1.svg')} alt="" />
    <img className="french-discovery-outline french-discovery-outline-second"
      src={asset('french-4-imgVector2.svg')} alt="" />
    <figcaption>Too many informations and decisions cramped in one place, with a CTA that is very easy to miss</figcaption>
  </figure>;
}

function TrustVisual() {
  return <figure className="french-audit-frame french-trust">
    <img src={asset('french-4-img91.png')} alt="" loading="lazy" />
    <img src={asset('french-4-img92.png')} alt="" loading="lazy" />
    <figcaption>Missing Testimonial section!!!!</figcaption>
  </figure>;
}

function Problem() {
  const visuals = [
    <AcquisitionDiagram />,
    <DiscoveryVisual />,
    <TrustVisual />,
    <Film name="french-cake-existing.mp4" label="Existing French Cake Company website recording" width={1099} height={630} />,
  ];

  return <section id="problem" className="french-section french-problem">
    <div className="french-problem-intro">
      <Banner image="french-4-imgFrame1409.png" className="french-problem-banner">
        <p className="french-eyebrow">The problem</p>
        <h2>What happens when poor design<br className="french-desktop-break" /> meets good business?</h2>
      </Banner>
      <div className="french-copy french-copy-column">
        <p>The French Cake Company has spent over two decades creating beautifully crafted cakes for memorable occasions. However, its digital experience had several design gaps that could make it harder for customers to discover products, build trust, and complete purchases.</p>
        <p>Four areas stood out during my review of the existing website.</p>
      </div>
    </div>
    <div className="french-entries">
      {problems.map(({ title, heading, paragraphs }, index) => <article className="french-entry" key={title}>
        <EntryTitle number={index + 1} title={title} large={index === 3} />
        <div className="french-entry-content">
          {visuals[index]}
          <div className={`french-audit-copy french-audit-copy-${index + 1}`}>
            <h4>{heading}</h4>
            <Paragraphs className={index === 3 ? 'french-copy-spaced' : undefined} items={paragraphs} />
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}

function Solution() {
  return <section id="solution" className="french-section french-solution">
    <Film name="french-cake-project.mp4" poster="videos/french-cake-project-poster.webp"
      label="Redesigned French Cake Company website" width={1127} height={634} />
    <div className="french-copy-column french-solution-copy">
      <Heading label="The solution">Bringing the "Wow" Back to the Digital Experience</Heading>
      <Paragraphs className="french-copy french-copy-spaced" items={solutionCopy} />
    </div>
  </section>;
}

function CoreFlows() {
  return <section id="core-flows" className="french-section french-core">
    <Banner image="french-6-imgFrame1401.png" className="french-core-banner">
      <h2 className="french-eyebrow">The core-flows</h2>
    </Banner>
    <div className="french-entries">
      {coreFlows.map(({ title, titleContinuation, height, image, video, decision, why }, index) =>
        <article className="french-entry" key={title}>
          <EntryTitle number={index + 1} title={title} continuation={titleContinuation} />
          <div className="french-entry-content">
            {video ? <Film name={video} label={title} width={1099} height={height} /> :
              <div className="french-media" style={{ aspectRatio: `1099 / ${height}` }}>
                <img src={asset(image)} alt={title} width={1099} height={height} loading="lazy" />
              </div>}
            <div className="french-pair">
              <div><h4>The design decision</h4><Paragraphs items={decision} /></div>
              <div><h4>Why it mattered</h4><Paragraphs items={why} /></div>
            </div>
          </div>
        </article>)}
    </div>
  </section>;
}

export default function FrenchCakeCaseStudy() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const update = () => {
      const readingLine = Math.min(window.innerHeight * 0.35, 240);
      let current = 'hero';
      for (const [, id] of sections) {
        if (document.getElementById(id)?.getBoundingClientRect().top <= readingLine) current = id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'reflection';
      setActive(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <main className="french-case-study">
    <aside className="french-sidebar">
      <a className="french-back" href={`${base}projects`}><span aria-hidden="true">←</span> Back</a>
      <nav aria-label="Case study sections">
        {sections.map(([label, id]) => <a key={id} href={`#${id}`}
          aria-current={active === id ? 'location' : undefined}>{label}</a>)}
      </nav>
    </aside>
    <div className="french-content">
      <Hero />
      <Overview />
      <Problem />
      <Solution />
      <CoreFlows />
      <section id="reflection" className="french-section french-reflection">
        <Heading label="Reflection">What did I learn from redesigning a landing page that has been existing for decades?</Heading>
        <Paragraphs className="french-copy" items={reflectionCopy} />
      </section>
    </div>
  </main>;
}
