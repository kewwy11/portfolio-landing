import React, { useEffect, useRef, useState } from 'react';
import { menuNavigation, socials } from './content.js';
import { navigationHref } from './navigation.js';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const menuOverlay = useRef(null);
  const closeButton = useRef(null);
  const menuSocials = [
    ['X (Twitter)', 'x.svg'], ['LinkedIn', 'linkedin.svg'],
    ['Instagram', 'instagram.svg'], ['Behance', 'behance.svg'],
    ['Pinterest', 'pinterest.svg'],
  ];
  const dismissMenu = () => {
    setOpen(false);
    menuButton.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => closeButton.current?.focus({ preventScroll: true }));
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        dismissMenu();
      }
      if (event.key === 'Tab') {
        const focusable = [...menuOverlay.current.querySelectorAll('button, a[href], [tabindex="0"]')];
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [open]);
  return <header className="header">
    <a href={navigationHref('home')} className="wordmark" aria-label="Grateful Erhis, home">Grateful Erhis</a>
    <button ref={menuButton} className="menu-button" aria-label="Open navigation" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(true)}>
      <img src={asset('imgFrame2.svg')} alt="" />
    </button>
    <div className={`menu-layer${open ? ' is-open' : ''}`} inert={!open} aria-hidden={!open}>
    <div className="menu-backdrop" aria-hidden="true" onClick={dismissMenu} />
    <div className="menu-panel">
    <div className="menu-curve" aria-hidden="true"><div className="menu-curve-shape" /></div>
    <div ref={menuOverlay} className="menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu">
      <button ref={closeButton} className="menu-close" aria-label="Close navigation" onClick={dismissMenu}>
        <img src={asset('menu/close.svg')} alt="" />
      </button>
      <div className="menu-overlay-inner">
        <nav id="main-navigation" className="menu-navigation" aria-label="Main navigation">
          {menuNavigation.map(([label, id], index) => <a key={id} href={navigationHref(id)} onClick={() => setOpen(false)}>
            <span className="menu-link-copy"><img className="menu-link-arrow" src={asset('menu/arrow.svg')} alt="" /><span className="menu-link-label">{label}</span></span>
            <span className="menu-link-number" aria-hidden="true"><span className="menu-number-track"><span>0{index + 1}</span><span>0{index + 1}</span></span></span>
          </a>)}
        </nav>
        <div className="menu-socials" aria-label="Social media">
          {menuSocials.map(([name, icon]) => {
            const url = socials.find((social) => social.name === name)?.url;
            const contents = <><img src={asset(`menu/${icon}`)} alt="" /><span className="menu-social-tooltip" aria-hidden="true">{name}</span></>;
            return url ? <a key={name} className="menu-social" aria-label={name} href={url} target="_blank" rel="noopener noreferrer">{contents}</a>
              : <span key={name} className="menu-social" role="img" aria-label={name} tabIndex={0}>{contents}</span>;
          })}
        </div>
        <p className="menu-copyright">©2026 Grateful Erhis</p>
      </div>
    </div></div></div>
  </header>;
}
