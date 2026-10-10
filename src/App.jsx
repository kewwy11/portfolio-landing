import React, { useEffect } from 'react';
import LandingPage from './LandingPage.jsx';
import AboutPage from './AboutPage.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import ContactPage from './ContactPage.jsx';
import LumisCaseStudy from './LumisCaseStudy.jsx';
import { isAboutPage, isProjectsPage, isContactPage } from './navigation.js';

export default function App() {
  const lumis = window.location.pathname.replace(/\/+$/, '') === `${import.meta.env.BASE_URL}projects/lumis`;
  const about = isAboutPage();
  const projects = isProjectsPage();
  const contact = isContactPage();
  useEffect(() => {
    document.title = lumis ? 'Lumis Dermatologists — Grateful Erhis' : about ? 'About — Grateful Erhis'
      : projects ? 'Projects — Grateful Erhis'
        : contact ? 'Contact — Grateful Erhis' : 'Grateful Erhis — Visual Designer';
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
  }, [about, projects, contact, lumis]);
  return lumis ? <LumisCaseStudy /> : about ? <AboutPage /> : projects ? <ProjectsPage /> : contact ? <ContactPage /> : <LandingPage />;
}
