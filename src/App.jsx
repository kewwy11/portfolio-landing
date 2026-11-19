import React, { useEffect } from 'react';
import LandingPage from './LandingPage.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import ContactPage from './ContactPage.jsx';
import LumisCaseStudy from './LumisCaseStudy.jsx';
import FrenchCakeCaseStudy from './FrenchCakeCaseStudy.jsx';
import LumisBrandCaseStudy from './LumisBrandCaseStudy.jsx';
import BeaconCaseStudy from './BeaconCaseStudy.jsx';
import { isResumePage, isProjectsPage, isContactPage, resumePdfHref } from './navigation.js';

export default function App() {
  const lumis = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/lumis`;
  const frenchCake = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/french-cake`;
  const lumisBrand = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/lumis-brand`;
  const beacon = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/beacon-trust`;
  const resume = isResumePage();
  const projects = isProjectsPage();
  const contact = isContactPage();
  useEffect(() => {
    if (resume) {
      window.location.replace(resumePdfHref);
      return;
    }
    document.title = frenchCake ? 'The French Cake Company — Grateful Erhis'
      : lumisBrand ? 'Lumis Brand Identity — Grateful Erhis' : beacon ? 'Beacon Trust — Grateful Erhis' : lumis ? 'Lumis Dermatologists â€” Grateful Erhis'
      : projects ? 'Projects — Grateful Erhis'
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
  }, [resume, projects, contact, lumis, lumisBrand, beacon, frenchCake]);
  if (resume) return null;
  return frenchCake ? <FrenchCakeCaseStudy /> : lumisBrand ? <LumisBrandCaseStudy /> : beacon ? <BeaconCaseStudy /> : lumis ? <LumisCaseStudy /> : projects ? <ProjectsPage /> : contact ? <ContactPage /> : <LandingPage />;
}
