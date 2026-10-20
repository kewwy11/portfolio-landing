import React, { useEffect, useState } from 'react';
import LumisBrandSections from './LumisBrandSections.jsx';
import './lumis-brand-case-study.css';

const base = import.meta.env.BASE_URL;
const asset = name => `${base}assets/lumis-brand/${name}`;
const navigation = [
  ['Hero', 'lumis-brand-hero'],
  ['Lumis Story', 'lumis-brand-story'],
  ['Brand Strategy', 'lumis-brand-strategy'],
  ['The Identity', 'lumis-brand-identity'],
  ['Lumis Voice', 'lumis-brand-voice'],
  ['Lumis Visuals', 'lumis-brand-visuals'],
  ['Application', 'lumis-brand-application'],
];

const strategyItems = [
  {
    number: '01', title: 'Vision',
    copy: ['The vision for Lumis was simple: A brand where no skin tone feels left out. Where modern technology can be used to support faster and more accurate results.', 'At the same time, Lumis needed to make people feel comfortable and seen, while maintaining its credibility within the medical field.'],
  },
  {
    number: '02', title: 'Target Audience',
    copy: 'Lumis is for people who have struggled to find skincare that understands their skin, especially people with darker skin tones who are often overlooked in dermatology and beauty.',
  },
  {
    number: '03', title: 'Positioning',
    copy: 'By bringing experienced dermatologists together with modern technology, Lumis makes expert care feel clear, inclusive, and approachable across every skin tone.',
  },
];

function SectionIntro({ title, id, children }) {
  return <div className="lumis-brand-section-intro">
    <h2 id={id}>{title}</h2>
    <div className="lumis-brand-intro-copy">{children}</div>
  </div>;
}

export default function LumisBrandCaseStudy() {
  const [activeSection, setActiveSection] = useState(navigation[0][1]);
  const [openStrategy, setOpenStrategy] = useState(0);

  useEffect(() => {
    const update = () => {
      const readingLine = Math.min(window.innerHeight * .35, 240);
      setActiveSection(navigation.reduce((current, [, id]) =>
        document.getElementById(id)?.getBoundingClientRect().top <= readingLine ? id : current,
      navigation[0][1]));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <div className="lumis-brand-case-study">
    <a className="skip-link" href="#lumis-brand-hero">Skip to case study</a>
    <aside className="lumis-brand-sidebar">
      <a className="lumis-brand-back" href={`${base}projects`} aria-label="Back to projects"><img src={`${base}assets/lumis/back-arrow.svg`} alt="" />Back</a>
      <nav aria-label="Lumis brand identity sections">
        {navigation.map(([label, id]) => <a key={id} href={`#${id}`}
          className={activeSection === id ? 'is-active' : undefined}
          aria-current={activeSection === id ? 'location' : undefined}>{label}</a>)}
      </nav>
    </aside>

    <main className="lumis-brand-content" aria-labelledby="lumis-brand-title">
      <section id="lumis-brand-hero" className="lumis-brand-hero" aria-labelledby="lumis-brand-title">
        <div className="lumis-brand-hero-art">
          <img className="lumis-brand-hero-photo" src={asset('hero-faces.png')} alt="Three women with different skin tones together" fetchPriority="high" />
          <div className="lumis-brand-hero-shade" aria-hidden="true" />
          <div className="lumis-brand-hero-pills" aria-hidden="true">
            <span>Dermatology Tech</span><span>2026</span><span>Brand Identity</span>
          </div>
          <h1 id="lumis-brand-title" className="lumis-brand-logo">
            <img src={asset('hero-symbol.svg')} alt="" />
            <img src={asset('hero-wordmark.svg')} alt="Lumis" />
          </h1>
          <p className="lumis-brand-hero-tagline">Clarity for every skin</p>
        </div>
        <dl className="lumis-brand-details">
          <div><dt>Role</dt><dd>Brand Designer<br />Visual Designer<br />Brand Strategist</dd></div>
          <div><dt>Timeline</dt><dd>3 weeks</dd></div>
          <div><dt>Team</dt><dd>Solo Project</dd></div>
          <div><dt>Industry</dt><dd>Healthcare/Tech</dd></div>
          <div><dt>Skills</dt><dd>Strategy<br />Visual Identity<br />Brand Identity<br />AI visual generation</dd></div>
        </dl>
      </section>

      <section id="lumis-brand-story" className="lumis-brand-story" aria-labelledby="lumis-brand-story-title">
        <SectionIntro title="Lumis Story" id="lumis-brand-story-title">
          <p>Lumis is a brand that exists for people who have not felt at home in their own skin for years. It’s for those who have sought out solutions, but none actually addressed their skin conditions, either because of inaccessibility or the lack of representation and understanding of their skin tone.</p>
          <p>Lumis focuses on bringing experienced dermatologists from around the world together with modern technology to create faster workflows, more efficient diagnosis, and a more inclusive approach to dermatology across all skin tones.</p>
        </SectionIntro>
        <div className="lumis-brand-story-card">
          <p className="lumis-brand-story-where">Where<br />Tech</p>
          <figure className="lumis-brand-story-image"><img src={asset('story-tablet.png')} alt="A dermatologist examines a skin analysis on a tablet" loading="lazy" /></figure>
          <p className="lumis-brand-story-meets">Meets<br />Skincare</p>
          <p className="lumis-brand-story-est">Est. 2026<br />Lumiscare.com</p>
          <p className="lumis-brand-story-line">Clarity for<br />every skin.</p>
        </div>
      </section>

      <section id="lumis-brand-strategy" className="lumis-brand-strategy" aria-labelledby="lumis-brand-strategy-title">
        <SectionIntro title="Brand Strategy" id="lumis-brand-strategy-title">
          <p>We noticed three major issues within the dermatology sector:</p>
          <ul>
            <li>Dermatology, like almost every healthcare brand, felt clinical and unapproachable.</li>
            <li>Skin of colour, especially darker skin tones, was greatly underrepresented in dermatology.</li>
            <li>Dermatology was one of the healthcare sectors least involved in using modern technology to create faster and more efficient workflows.</li>
          </ul>
          <p>Knowing this, we built the brand strategy around three things: the vision, positioning, and the people Lumis was created for.</p>
        </SectionIntro>
        <div className="lumis-brand-strategy-pair">
          <div className="lumis-brand-promise">
            <p>Clarity<br />for every<br />skin.</p>
            <small>Lumis is a dermatology brand that is inclusive of all skin tone, especially to darker skin tones that have been often overlooked in the dermatology and beauty space.</small>
          </div>
          <figure className="lumis-brand-portrait"><img src={asset('strategy-portrait.png')} alt="Portrait of a woman with vitiligo" loading="lazy" /></figure>
        </div>
        <div className="lumis-brand-strategy-list" aria-label="Lumis brand strategy">
          {strategyItems.map((item, index) => <div className={`lumis-brand-strategy-item${openStrategy === index ? ' is-open' : ''}`} key={item.number}>
            <button type="button" aria-expanded={openStrategy === index} aria-controls={`lumis-brand-strategy-copy-${index}`}
              onClick={() => setOpenStrategy(index)}>
              <span className="lumis-brand-strategy-number"><i aria-hidden="true" />{item.number}</span>
              <span className="lumis-brand-strategy-name">{item.title}</span>
            </button>
            <div className="lumis-brand-strategy-copy" id={`lumis-brand-strategy-copy-${index}`} hidden={openStrategy !== index}>
              <span className="lumis-brand-strategy-bullet" aria-hidden="true" />
              <div>{(Array.isArray(item.copy) ? item.copy : [item.copy]).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            </div>
          </div>)}
        </div>
      </section>
      <LumisBrandSections />
    </main>
  </div>;
}
