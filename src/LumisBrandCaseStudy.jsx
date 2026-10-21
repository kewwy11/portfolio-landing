import React, { useEffect, useState } from 'react';
import LumisBrandSections from './LumisBrandSections.jsx';
import './lumis-brand-case-study.css';
import { LumisStoryMotion, LumisPortraitMotion, LumisStrategyMotion } from './LumisBrandMotion.jsx';

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
    copy: ['Our target audience was people of colour, particularly a younger to middle generation from around 16 to their late 50s.', 'So we paid attention to the language they use, the words they could relate to, and the visual direction of the brand to make Lumis feel more familiar, approachable, and relevant to them.'],
  },
  {
    number: '03', title: 'Positioning',
    copy: ['We positioned Lumis at the intersection of healthcare and skincare, especially for people of colour.', 'Warm and inviting enough to feel like a skincare brand, without compromising its credibility as a medical brand.'],
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
        <LumisStoryMotion />
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
          <LumisPortraitMotion />
        </div>
        <LumisStrategyMotion items={strategyItems} />
      </section>
      <LumisBrandSections />
    </main>
  </div>;
}
