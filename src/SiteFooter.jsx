import React from 'react';
import { email, navigation, socials } from './content.js';
import RevealHeading from './RevealHeading.jsx';
import { navigationHref } from './navigation.js';

export default function Footer() {
  return <footer className="footer">
    <div className="footer-brand"><RevealHeading as="p" className="footer-heading" lines={['Growing B2C', 'startups and', 'businesses']} /><div className="footer-email"><p>Reach out to me via email</p><a href={`mailto:${email}`}>{email}</a></div></div>
    <div className="footer-right"><div className="footer-columns">
      <div className="footer-column location"><RevealHeading as="h3">Location</RevealHeading><p>Currently based in Lagos, Nigeria.<br />Open to remote roles or relocation</p></div>
      <nav className="footer-column" aria-label="Footer navigation"><RevealHeading as="h3">Quick links</RevealHeading><div className="footer-links">{navigation.map(([label, id]) => <a href={navigationHref(id)} key={id}>{label}</a>)}</div></nav>
      <div className="footer-column"><RevealHeading as="h3">Social media</RevealHeading><div className="footer-links">{socials.map(({name, url}) => {
        const label = name === 'X (Twitter)' ? 'X(Twitter)' : name;
        return url ? <a key={name} href={url} target="_blank" rel="noreferrer">{label}</a> : <span className="social-label" key={name}>{label}</span>;
      })}</div></div>
    </div><small>©2026 Grateful Erhis</small></div>
  </footer>;
}
