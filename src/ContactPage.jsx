import React, { useEffect, useState } from 'react';
import Header from './SiteHeader.jsx';
import Footer from './SiteFooter.jsx';
import Contact from './ContactSection.jsx';
import RevealHeading from './RevealHeading.jsx';
import FaqSection from './FaqSection.jsx';
import { contactHeading } from './contact.js';
import './contact-page.css';

export default function ContactPage() {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    Promise.all(['400 96px Gind', '400 32px Poppins', '400 16px DM Mono']
      .map(font => document.fonts.load(font).catch(() => {})))
      .then(() => { if (mounted) setFontsReady(true); });
    return () => { mounted = false; };
  }, []);

  return <div className="contact-page">
    <a className="skip-link" href="#contact">Skip to contact form</a>
    <main id="contact-page" className="contact-shell" aria-labelledby="contact-page-heading">
      <Header />
      <RevealHeading as="h1" id="contact-page-heading" ready={fontsReady}
        lines={['Have any question?', 'Don’t be a stranger...']} />
      <Contact heading={contactHeading} />
      <FaqSection />
    </main>
    <Footer />
  </div>;
}
