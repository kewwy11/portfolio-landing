import React, { useEffect, useRef, useState } from 'react';
import { email, navigation, projects, testimonials, services, socials } from './content.js';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

function Header() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open]);
  return <header className="header">
    <a href="#home" className="wordmark" aria-label="Grateful Erhis, home">Grateful Erhis</a>
    <button ref={menuButton} className="menu-button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
      {open ? <span className="close-icon" aria-hidden="true">×</span> : <img src={asset('imgFrame2.svg')} alt="" />}
    </button>
    {open && <nav id="main-navigation" className="menu" aria-label="Main navigation">
      {navigation.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}<span aria-hidden="true">↗</span></a>)}
    </nav>}
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
      <span className="hero-line">I love <img className="hero-inset" src={asset('hero-pink.png')} alt="" width="177" height="100" /> pink.</span>
      <span className="hero-line">I am a design <img className="hero-inset" src={asset('hero-design.png')} alt="" width="177" height="100" /></span>
      <span className="hero-line">generalist. I create</span>
      <span className="hero-line"><img className="hero-inset" src={asset('hero-visuals.png')} alt="" width="177" height="100" /> Amazing visuals</span>
      <span className="hero-line"><small>and code</small> that converts</span>
    </h1>
    <a className="work-link" href="#projects">I’ve talked the talk, now let me walk the walk <img src={asset('imgFrame11.svg')} alt="" /></a>
  </section>;
}

function Tools() {
  const logos = [
    ['imgWrapByRakibulism1.svg', 'Design tool'], ['imgWrapByRakibulism.svg', 'Figma'],
    ['imgJitterLogoSvg.svg', 'Jitter'], ['imgWrapByRakibulism2.svg', 'Design tool'],
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
        <div className={`project-image ${project.image ? '' : 'project-placeholder'}`}>
          {project.image && <img src={asset(project.image)} alt={project.alt} loading="lazy" />}
        </div>
        <div className="project-caption"><h3>{project.name}</h3><ul className="tags" aria-label="Project type"><li>Web</li><li>Dashboard</li></ul></div>
      </article>) : <div className="empty-projects"><h3>More good things on the way.</h3><p>Branding projects are coming soon.</p><a href="#contact">Let’s create something together ↗</a></div>}
    </div>
  </section>;
}

function Testimonials() {
  return <section className="section testimonials" aria-labelledby="proof-heading">
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
    <img className="contact-image" src={asset('contact.png')} alt="A close-up of the Piggyvest mobile interface in hand" loading="lazy" width="732" height="602" />
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
