import React, { useEffect } from 'react';
import LandingPage from './LandingPage.jsx';
import AboutPage from './AboutPage.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import ContactPage from './ContactPage.jsx';
import LumisCaseStudy from './LumisCaseStudy.jsx';
import FrenchCakeCaseStudy from './FrenchCakeCaseStudy.jsx';
import LumisBrandCaseStudy from './LumisBrandCaseStudy.jsx';
import BeaconCaseStudy from './BeaconCaseStudy.jsx';
import { isAboutPage, isProjectsPage, isContactPage } from './navigation.js';

export default function App() {
  const lumis = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/lumis`;
  const frenchCake = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/french-cake`;
  const lumisBrand = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/lumis-brand`;
  const beacon = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/beacon-trust`;
  const about = isAboutPage();
  const projects = isProjectsPage();
  const contact = isContactPage();
  useEffect(() => {
    document.title = lumisBrand ? 'Lumis Brand Identity — Grateful Erhis' : beacon ? 'Beacon Trust — Grateful Erhis' : lumis ? 'Lumis Dermatologists â€” Grateful Erhis' : about ? 'About â€” Grateful Erhis'
      : projects ? 'Projects â€” Grateful Erhis'
        : contact ? 'Contact â€” Grateful Erhis' : 'Grateful Erhis â€” Visual Designer';
    if (!window.location.hash) return;
    let mounted = true;
    let frame;
    // Cross-page anchors need their React content and final font metrics first.
    document.fonts.ready.then(() => {
      if (!mounted) return;
      frame = requestAnimationFrame(() => {
        let id;
        try { id = decodeURIComponent(window.location.hash.slice(1)); }
        catch { return; }
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    });
    return () => { mounted = false; cancelAnimationFrame(frame); };
  }, [about, projects, contact, lumis, lumisBrand, beacon]);
  return frenchCake ? <FrenchCakeCaseStudy /> : lumisBrand ? <LumisBrandCaseStudy /> : beacon ? <BeaconCaseStudy /> : lumis ? <LumisCaseStudy /> : about ? <AboutPage /> : projects ? <ProjectsPage /> : contact ? <ContactPage /> : <LandingPage />;
}
