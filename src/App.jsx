import React, { useEffect, useRef, useState } from 'react';
import { email, navigation, menuNavigation, projects, testimonials, services, socials, heroMedia, contactMedia } from './content.js';
import Media from './Media.jsx';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  const menuOverlay = useRef(null);
  const closeButton = useRef(null);
  const menuSocials = [
    ['X (Twitter)', 'x.svg'], ['LinkedIn', 'linkedin.svg'],
    ['Instagram', 'instagram.svg'], ['Behance', 'behance.svg'],
    ['Pinterest', 'pinterest.svg'],
  ];
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === 'Tab') {
        const focusable = [...menuOverlay.current.querySelectorAll('button, a[href]')];
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
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  return <header className="header">
    <a href="#home" className="wordmark" aria-label="Grateful Erhis, home">Grateful Erhis</a>
    <button ref={menuButton} className="menu-button" aria-label="Open navigation" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(true)}>
      <img src={asset('imgFrame2.svg')} alt="" />
    </button>
    {open && <div ref={menuOverlay} className="menu-overlay" role="dialog" aria-modal="true" aria-label="Site menu">
      <button ref={closeButton} className="menu-close" aria-label="Close navigation" onClick={() => { setOpen(false); menuButton.current?.focus(); }}>
        <img src={asset('menu/close.svg')} alt="" />
      </button>
      <div className="menu-overlay-inner">
        <nav id="main-navigation" className="menu-navigation" aria-label="Main navigation">
          {menuNavigation.map(([label, id], index) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
            <span className="menu-link-label">{label}</span><span className="menu-link-number" aria-hidden="true">0{index + 1}</span>
          </a>)}
        </nav>
        <div className="menu-socials" aria-label="Social media">
          {menuSocials.map(([name, icon]) => {
            const url = socials.find((social) => social.name === name)?.url;
            const image = <img src={asset(`menu/${icon}`)} alt={name} />;
            return url ? <a key={name} className="menu-social" href={url} target="_blank" rel="noreferrer">{image}</a>
              : <span key={name} className="menu-social">{image}</span>;
          })}
        </div>
        <p className="menu-copyright">©2026 Grateful Erhis</p>
      </div>
    </div>}
  </header>;
}

function Hero() {
  return <section className="hero" id="home" aria-labelledby="hero-heading">
    <Header />
    <div className="intro" id="about">
      <img src={asset('imgEllipse1.png')} width="70" height="70" alt="Grateful Erhis" />
      <p>Hello, my name is Grateful Erhis. I am a visual designer, and these are the only three things you need to know about me.....</p>
    </div>
    <h1 id="hero-heading" className="hero-heading">
      <span className="hero-line">I love <Media {...heroMedia.pink} className="hero-inset" alt="Pink visual design reel" width="177" height="100" /> pink.</span>
      <span className="hero-line">I am a design <Media {...heroMedia.design} className="hero-inset" alt="Design reel" width="177" height="100" /></span>
      <span className="hero-line">generalist. I create</span>
      <span className="hero-line"><Media {...heroMedia.visuals} className="hero-inset" alt="Visual design reel" width="177" height="100" /> Amazing visuals</span>
      <span className="hero-line"><small>and code</small> that converts</span>
    </h1>
    <div className="work-link"><span>I’ve talked the talk, now let me walk the walk</span>
      <a href="#projects" aria-label="Go to projects"><img src={asset('imgFrame11.svg')} alt="" /></a>
    </div>
  </section>;
}

function Tools() {
  const logos = [
    ['imgWrapByRakibulism1.svg', 'Figma'], ['imgWrapByRakibulism.svg', 'Adobe'],
    ['imgJitterLogoSvg.svg', 'Jitter'], ['imgWrapByRakibulism2.svg', 'Codex'],
    ['imgWrapByRakibulism3.svg', 'Claude'], ['vscode.png', 'Visual Studio Code'],
    ['imgWrapByRakibulism3.svg', 'Claude'], ['imgWrapByRakibulism3.svg', 'Claude'],
  ];
  return <div className="tools" aria-label="My creative toolkit"><div className="tools-track">
    {logos.map(([file, label], i) => <div className={`tool tool-${i}`} key={`${file}-${i}`}><img src={asset(file)} alt={label} /></div>)}
  </div></div>;
}

function Projects() {
  const [category, setCategory] = useState('UI/UX');
  const filtered = projects.filter((project) => project.category === category);
  return <section id="projects" className="section projects" aria-labelledby="projects-heading">
    <div className="section-heading"><h2 id="projects-heading">Projects</h2>
      <div className="filters" role="group" aria-label="Filter projects">
        {['UI/UX', 'Branding'].map((label) => <button key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
      </div>
    </div>
    <div className="project-grid" aria-live="polite">
      {filtered.length ? filtered.map((project, index) => <article key={project.id} className={`project project-${index}`}>
        <div className={`project-image ${project.image || project.video ? '' : 'project-placeholder'}`}>
          <Media image={project.image} video={project.video} alt={project.alt} loading="lazy" />
        </div>
        <div className="project-caption"><h3>{project.name}</h3><ul className="tags" aria-label="Project type"><li>Web</li><li>Dashboard</li></ul></div>
      </article>) : <div className="empty-projects"><h3>More good things on the way.</h3><p>Branding projects are coming soon.</p><a href="#contact">Let’s create something together ↗</a></div>}
    </div>
  </section>;
}

function Testimonials() {
  return <section id="proof" className="section testimonials" aria-labelledby="proof-heading">
    <h2 id="proof-heading">Still in doubt?<br />Here’s proof...</h2>
    <div className="testimonial-grid">{testimonials.map((item) => <figure className="testimonial" key={item.name}>
      <blockquote>{item.quote}</blockquote><figcaption><img src={asset('imgEllipse2.svg')} alt="" loading="lazy" /><span><strong>{item.name}</strong><span>{item.role}</span></span></figcaption>
    </figure>)}</div>
  </section>;
}

function Services() {
  return <section className="section services" id="services" aria-labelledby="services-heading">
    <h2 id="services-heading">Services for your<br />business...</h2>
    <div className="service-list">{services.map(([name, description], index) => <details className="service" key={name}>
      <summary><span className="service-label"><span className="square" /><span className="service-number">0{index + 1}</span><span>{name}</span></span><img className="service-plus" src={asset('imgPlusSmall1.svg')} alt="" /></summary>
      <p>{description}</p>
    </details>)}</div>
  </section>;
}

function Contact() {
  const [status, setStatus] = useState('');
  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.get('name')}`);
    const body = encodeURIComponent(`Hello Grateful,\n\n${form.get('inquiry')}\n\nFrom: ${form.get('name')}\nEmail: ${form.get('email')}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setStatus('Your email app will open with your inquiry. Send it there to get in touch, or email me using the link below.');
  }
  return <section className="section contact" id="contact" aria-labelledby="contact-heading">
    <div className="contact-copy"><h2 id="contact-heading">Want to scale your business with a website or an app that converts, create a memorable brand, find your target market, or give your product an entirely different direction? Don’t be a stranger.</h2>
      <form onSubmit={submit}>
        <label htmlFor="email"><span className="square" />Email Address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="robinhood@gmail.com" required maxLength="254" />
        <label htmlFor="name"><span className="square" />Name</label><input id="name" name="name" autoComplete="name" placeholder="Jane Doe" required maxLength="100" />
        <label htmlFor="inquiry"><span className="square" />Inquiry</label><textarea id="inquiry" name="inquiry" rows="1" placeholder="I need a website" required maxLength="2000" />
        <button className="talk-button" type="submit"><span>Let’s talk</span><img src={asset('imgEllipse6.svg')} alt="" /></button>
        <p className="form-status" role="status">{status}</p>
      </form>
    </div>
    <Media {...contactMedia} className="contact-image" alt="A close-up of the Piggyvest mobile interface in hand" loading="lazy" width="732" height="602" />
  </section>;
}

function Footer() {
  return <footer className="footer">
    <div className="footer-brand"><p className="footer-heading">Growing B2C<br />startups and<br />businesses</p><div className="footer-email"><p>Reach out to me via email</p><a href={`mailto:${email}`}>{email}</a></div></div>
    <div className="footer-right"><div className="footer-columns">
      <div className="location"><h3>Location</h3><p>Currently based in Lagos, Nigeria. Open to remote roles or relocation</p></div>
      <nav aria-label="Footer navigation"><h3>Quick Links</h3>{navigation.map(([label, id]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav>
      <div><h3>Social Media</h3>{socials.map(({name, url}) => url ? <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a> : <span className="social-label" key={name}>{name}</span>)}</div>
    </div><small>©2026 Grateful Erhis</small></div>
  </footer>;
}

export default function App() {
  return <><a className="skip-link" href="#projects">Skip to projects</a><main><Hero /><Tools /><Projects /><Testimonials /><Services /><Contact /></main><Footer /></>;
}
