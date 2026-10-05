import React, { useEffect, useState } from 'react';
import Header from './SiteHeader.jsx';
import Footer from './SiteFooter.jsx';
import ProjectGallery from './ProjectGallery.jsx';
import './projects.css';

export default function ProjectsPage() {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    Promise.all(['400 96px Gind', '400 16px Poppins', '600 20px Poppins']
      .map(font => document.fonts.load(font).catch(() => {})))
      .then(() => { if (mounted) setFontsReady(true); });
    return () => { mounted = false; };
  }, []);

  return <div className="projects-page">
    <a className="skip-link" href="#projects-page-heading-grid">Skip to projects</a>
    <main id="projects" className="projects-shell" aria-labelledby="projects-page-heading">
      <Header />
      <ProjectGallery page headingId="projects-page-heading" ready={fontsReady} />
    </main>
    <Footer />
  </div>;
}
