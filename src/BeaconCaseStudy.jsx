import BeaconLogoReveal from './BeaconLogoReveal';
import BeaconBackgroundVideo from './BeaconBackgroundVideo';
import React, { useEffect, useState } from 'react';
import './beacon-case-study.css';
import BeaconColorSystem from './BeaconColorSystem';
import BeaconSocialGrid from './BeaconSocialGrid';
import BeaconApplication from './BeaconApplication';
import BeaconAboutMotion from './BeaconAboutMotion';
import { BeaconLogoShowcase, BeaconTypography } from './BeaconBrandMotion';
import ResponsiveComposition from './ResponsiveComposition.jsx';

const base = import.meta.env.BASE_URL;
const sections = ['Hero', 'About', 'The Logo', 'The Visual System', 'The Application'];

function BeaconStoryHeader({ index }) {
  return <>
    <img className="beacon-story-progress" src={`${base}assets/beacon/story-progress-${index}.svg`} alt="" />
    <div className="beacon-story-header">
      <img className="beacon-story-avatar" src={`${base}assets/beacon/story-avatar${index === 5 ? '-alt' : ''}.svg`} alt="" />
      <span className="beacon-story-account">Beacon Trust <img src={`${base}assets/beacon/story-verified.svg`} alt="Verified" /></span>
      <span className="beacon-story-time">{' · 10h'}</span>
      <span className="beacon-story-actions"><img src={`${base}assets/beacon/story-more.svg`} alt="" /><img src={`${base}assets/beacon/story-close.svg`} alt="" /></span>
    </div>
  </>;
}

function BeaconStorySet({ duplicate = false }) {
  return <div className="beacon-story-set" aria-hidden={duplicate || undefined}>
    <article className="beacon-story-card beacon-story-blue">
      <BeaconStoryHeader index={1} />
      <div className="beacon-story-borrow-lettering"><img src={`${base}assets/beacon/story-borrow-lettering.svg`} alt="Did you know you can borrow against your car and still drive it?" /></div>
      <span className="beacon-story-pill"><img src={`${base}assets/beacon/story-link.svg`} alt="" />See how it works</span>
    </article>
    <article className="beacon-story-card beacon-story-testimonial">
      <img className="beacon-story-background" src={`${base}assets/beacon/story-person.png`} alt="Beacon Trust customer" />
      <BeaconStoryHeader index={2} />
      <blockquote><p>I’ve been a beacon customer for the past 2<br />years and the experience has been marvellous.<br />They valued my watch on a Tuesday<br />morning. I had the money before lunch. Never<br />experienced this type of swiftness elsewhere.</p><footer><strong>Ejiro Erhis</strong><span>Talent acquisition manager</span></footer></blockquote>
    </article>
    <article className="beacon-story-card beacon-story-dark">
      <BeaconStoryHeader index={3} />
      <div className="beacon-story-stat"><img src={`${base}assets/beacon/story-stat-lettering.svg`} alt="90%" /><p>of our customers receive<br />their cash on the same day.</p></div>
      <span className="beacon-story-pill"><img src={`${base}assets/beacon/story-link.svg`} alt="" />Get a free valuation</span>
    </article>
    <article className="beacon-story-card beacon-story-photo">
      <img className="beacon-story-background" src={`${base}assets/beacon/story-assets.png`} alt="A Beacon Trust customer" />
      <BeaconStoryHeader index={4} />
      <div className="beacon-story-assets-lettering"><img src={`${base}assets/beacon/story-assets-lettering.svg`} alt="Your assets should work as hard as you" /></div>
    </article>
    <article className="beacon-story-card beacon-story-notification">
      <BeaconBackgroundVideo className="beacon-story-background" src={`${base}assets/beacon/story-home.mp4`} autoPlay loop muted playsInline preload="metadata" aria-label="A couple celebrating their new home" />
      <BeaconStoryHeader index={5} />
      <div className="beacon-story-toast"><div className="beacon-story-toast-mark"><img src={`${base}assets/beacon/story-notification-mark.svg`} alt="" /></div><div><div className="beacon-story-toast-heading"><strong>Beacon Trust</strong><span>now</span></div><p>Your loan has been approved. ₦4,500,000 is on its way.</p></div></div>
    </article>
  </div>;
}

export default function BeaconCaseStudy() {
  const [activeSection, setActiveSection] = useState('beacon-hero');

  useEffect(() => {
    const ids = ['beacon-hero', 'beacon-about', 'beacon-the-logo', 'beacon-the-visual-system', 'beacon-the-application'];
    const update = () => {
      const threshold = Math.min(window.innerHeight * .35, 240);
      setActiveSection(ids.reduce((current, id) => document.getElementById(id)?.getBoundingClientRect().top <= threshold ? id : current, ids[0]));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  return <div className="beacon-case-study">
    <a className="skip-link" href="#beacon-hero">Skip to case study</a>
    <aside className="beacon-sidebar">
      <a className="beacon-back" href={`${base}projects`} aria-label="Back to projects"><img src={`${base}assets/lumis/back-arrow.svg`} alt="" />Back</a>
      <nav aria-label="Case study sections">
        {sections.map((label, index) => <a key={label} className={activeSection === (index === 0 ? 'beacon-hero' : `beacon-${label.toLowerCase().replaceAll(' ', '-')}`) ? 'beacon-section-active' : ''}
          href={index === 0 ? '#beacon-hero' : `#beacon-${label.toLowerCase().replaceAll(' ', '-')}`}
          aria-current={activeSection === (index === 0 ? 'beacon-hero' : `beacon-${label.toLowerCase().replaceAll(' ', '-')}`) ? 'location' : undefined}>{label}</a>)}
      </nav>
    </aside>

    <main className="beacon-content">
      <section id="beacon-hero" className="beacon-hero" aria-labelledby="beacon-title">
        <div className="beacon-hero-art">
          <BeaconBackgroundVideo className="beacon-hero-video" src={`${base}assets/beacon/hero-dinner.mp4`} poster={`${base}assets/beacon/hero-dinner.png`} autoPlay loop muted playsInline preload="metadata" aria-label="Friends laughing together around a dinner table" />
          <div className="beacon-hero-top" aria-hidden="true">
            <span>Building futures together</span>
            <span>Finance built on community</span>
          </div>
          <h1 id="beacon-title" className="beacon-title"><img src={`${base}assets/beacon/beacon-trust-title.svg`} alt="Beacon Trust" /></h1>
        </div>

        <dl className="beacon-details">
          <div><dt>Role</dt><dd>Brand Designer<br />Visual Designer</dd></div>
          <div><dt>Timeline</dt><dd>3 weeks</dd></div>
          <div><dt>Team</dt><dd>1 designer,<br />2 Founders</dd></div>
          <div><dt>Industry</dt><dd>Finance</dd></div>
          <div><dt>Skills</dt><dd>Strategy<br />Visual Identity<br />Brand Identity</dd></div>
        </dl>
      </section>
      <section id="beacon-about" className="beacon-about" aria-labelledby="beacon-about-title">
        <div className="beacon-about-intro">
          <h2 id="beacon-about-title">About Beacon Trust</h2>
          <p>Beacon Trust is a modern financial company that helps individuals and small businesses move forward. We make loans easy to access, clear from start to finish, and shaped by the communities we serve. No hidden terms, no confusing steps, just honest support when you need it.</p>
        </div>
        <ResponsiveComposition width={1127} height={811} className="beacon-about-composition"><BeaconAboutMotion /></ResponsiveComposition>
      </section>
      <section id="beacon-the-logo" className="beacon-logo-section" aria-labelledby="beacon-logo-title">
        <div className="beacon-section-intro">
          <h2 id="beacon-logo-title">The Logo</h2>
          <p>Our logo is a symbol of connection and support. Everyone has a place here, whatever their financial background or goals. The shapes: Helping hands, representing a community reaching out with support. The center represents you and your community. Everything we do revolves around being a beacon of support and financial growth.</p>
        </div>
        <BeaconLogoShowcase />
        <BeaconLogoReveal />
      </section>
      <section id="beacon-the-visual-system" className="beacon-visual-system" aria-labelledby="beacon-visual-title">
        <div className="beacon-section-intro beacon-visual-intro">
          <h2 id="beacon-visual-title">The Visual System</h2>
          <div><p>For the visual system, we started with the colour. Beacon Blue leads everything, a deep electric blue that carries trust without falling into the navy every other bank already owns. Against it is an amber colour, a warm accent that matters in a layout, and a light lavender that gives the system somewhere quiet to breathe. The typography pairs a high-contrast serif with a clean geometric sans, so the brand can sound editorial and human in its headlines while staying plain and functional everywhere else. Numbers always take the serif, which gives figures the weight they need to carry a whole post on their own.</p><p>The Photography style moves the brand away from the coins, handshakes, and boardrooms that fintech usually reaches for. Instead we looked at the lives the money is actually for: friends celebrating together, shop owners standing in their own doorways, handymen/women deep in their work, and so on. Light does the rest, falling across surfaces and picking out the quiet moments in between, which gives the set a warmth that ties back to the name.</p><p>The social system turns all of this into something a small team can actually run. Six templates cover everything the brand posts, from statement cards to stat cards, asset spotlights, testimonials, and a how-it-works carousel. The result is a brand that looks consistent at a glance but never repeats itself twice in a row.</p></div>
        </div>
        <div className="beacon-visual-display">
        <BeaconTypography />
        <ResponsiveComposition width={1127} height={780} className="beacon-stories-composition"><div className="beacon-story-strip" aria-label="Beacon Trust social media story designs">
          <div className="beacon-story-track"><BeaconStorySet /><BeaconStorySet duplicate /></div>
        </div></ResponsiveComposition>
        <BeaconColorSystem />
        <BeaconSocialGrid />
        </div>
      </section>
      <BeaconApplication />
    </main>
  </div>;
}
