import React, { useEffect } from 'react';
import LandingPage from './LandingPage.jsx';
import AboutPage from './AboutPage.jsx';
import { isAboutPage } from './navigation.js';

export default function App() {
  const about = isAboutPage();
  useEffect(() => {
    document.title = about ? 'About — Grateful Erhis' : 'Grateful Erhis — Visual Designer';
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
  }, [about]);
  return about ? <AboutPage /> : <LandingPage />;
}
