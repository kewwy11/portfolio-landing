import React, { useEffect, useState } from 'react';
import Header from './SiteHeader.jsx';
import Contact from './ContactSection.jsx';
import Footer from './SiteFooter.jsx';
import RevealHeading from './RevealHeading.jsx';
import AboutStory from './AboutStory.jsx';
import './about.css';

const experience = [
  ['Intern-Junior Designer', 'Software Business Solution Consulting (SBSC)', '2024-2025'],
  ['Lead Designer', 'Careerontrack AI', '2024-2025'],
  ['Brand Designer', 'Beacon Trust', '2025'],
  ['Visual Designer', 'Freelance', '2025-2026'],
];

export default function AboutPage() {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    Promise.all(['400 96px Gind', '400 24px Poppins'].map(font => document.fonts.load(font).catch(() => {})))
      .then(() => { if (mounted) setFontsReady(true); });
    return () => { mounted = false; };
  }, []);
  return <div className="about-page">
    <a className="skip-link" href="#about-story">Skip to about content</a>
    <main id="about" aria-labelledby="about-heading">
      <div className="about-heading">
        <Header />
        <RevealHeading as="h1" id="about-heading" ready={fontsReady}>More about me...</RevealHeading>
      </div>
      <section className="about-intro" aria-labelledby="about-question">
        <RevealHeading id="about-question" ready={fontsReady} lines={['Remember', 'the best', 'day of', 'your life?']} />
        <picture className="about-portrait-frame">
          <source media="(max-width: 760px)" srcSet={`${import.meta.env.BASE_URL}assets/about-portrait-mobile.png`} />
          <img className="about-portrait" src={`${import.meta.env.BASE_URL}assets/about-portrait.png`}
            alt="Grateful Erhis wearing a black shirt against a pink background" width="670" height="721" />
        </picture>
      </section>
      <AboutStory ready={fontsReady} />
      <section className="about-experience" aria-labelledby="experience-heading">
        <RevealHeading id="experience-heading">Experience</RevealHeading>
        <ul className="experience-list" aria-label="Professional experience">
          {experience.map(([role, company, years]) => <li className="experience-row" key={company}>
            <p className="experience-role">{role}</p>
            <p className="experience-company">{company}</p>
            <p className="experience-years">{years}</p>
          </li>)}
        </ul>
      </section>
      <Contact />
    </main>
    <Footer />
  </div>;
}
