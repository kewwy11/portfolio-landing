import React, { useEffect, useRef, useState } from 'react';
import { testimonials, services, heroMedia } from './content.js';
import Media from './Media.jsx';
import useRevealOnScroll from './useRevealOnScroll.js';
import RevealHeading from './RevealHeading.jsx';
import TypewriterText from './TypewriterText.jsx';
import ServiceAccordion from './ServiceAccordion.jsx';
import Header from './SiteHeader.jsx';
import Contact from './ContactSection.jsx';
import Footer from './SiteFooter.jsx';
import ProjectGallery from './ProjectGallery.jsx';

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

function HeroText({ children }) {
  return <span className="hero-text-window"><span className="hero-text">{children}</span></span>;
}

function Hero() {
  const [ready, setReady] = useState(false);
  const introPortrait = useRef(null);
  useEffect(() => {
    let mounted = true;
    // Reveal with the final font metrics and portrait, avoiding a font swap mid-motion.
    const fonts = ['400 100px Gind', '400 16px Poppins'].map(font =>
      document.fonts.load(font).catch(() => {}));
    const portrait = introPortrait.current?.decode().catch(() => {});
    Promise.all([...fonts, portrait]).then(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);
  return <section className={`hero${ready ? ' hero-ready' : ' hero-pending'}`} id="home" aria-labelledby="hero-heading">
    <Header />
    <div className="intro" id="about">
      <img ref={introPortrait} src={asset('imgEllipse1.png')} width="70" height="70" alt="Grateful Erhis" />
      <p>Hello, my name is Grateful Erhis. I am a visual designer, and these are the only three things you need to know about me.....</p>
    </div>
    <h1 id="hero-heading" className="hero-heading">
      <span className="hero-line"><HeroText>I love</HeroText> <Media {...heroMedia.pink} className="hero-inset" alt="Pink visual design reel" width="177" height="100" /> <HeroText>pink.</HeroText></span>
      <span className="hero-line"><HeroText>I am a design</HeroText> <Media {...heroMedia.design} className="hero-inset" alt="Design reel" width="177" height="100" /></span>
      <span className="hero-line"><HeroText>generalist. I create</HeroText></span>
      <span className="hero-line"><Media {...heroMedia.visuals} className="hero-inset" alt="Visual design reel" width="177" height="100" /> <HeroText>visuals <small>and code</small> for</HeroText></span>
      <span className="hero-line"><HeroText>Consumer products</HeroText></span>
    </h1>
    <div className="work-link"><TypewriterText as="span" duration={1800}>Welcome to Grateful’s world, scroll down</TypewriterText>
      <a href="#projects" aria-label="Go to projects"><span className="welcome-arrow"><img src={asset('imgFrame11.svg')} alt="" /></span></a>
    </div>
  </section>;
}

function Tools() {
  const logos = [
    ['imgWrapByRakibulism1.svg', 'Figma'], ['tools/openai.svg', 'OpenAI'],
    ['tools/jitter.svg', 'Jitter'], ['tools/codex.svg', 'Codex'],
    ['vscode.png', 'Visual Studio Code'], ['tools/claude.svg', 'Claude'],
    ['tools/adobe-creative-cloud.png', 'Adobe Creative Cloud'],
  ];
  return <div className="tools" aria-label="My creative toolkit"><div className="tools-track">
    {[0, 1, 2].map(copy => <div className="tools-group" key={copy} aria-hidden={copy > 0 ? true : undefined}>
      {logos.map(([file, label], i) => <div className={`tool tool-${i}`} key={`${file}-${i}`}>
        {label === 'Adobe Creative Cloud' ? <span className="tool-creative-cloud">
          <img src={asset(file)} alt={copy === 0 ? label : ''} width="37" height="36" />
          <img className="tool-cloud-mark" src={asset('tools/adobe-creative-cloud-mark.svg')} alt="" />
        </span> : <img src={asset(file)} alt={copy === 0 ? label : ''} />}
      </div>)}
    </div>)}
  </div></div>;
}

function Projects() {
  return <section id="projects" className="section projects" aria-labelledby="projects-heading">
    <ProjectGallery />
  </section>;
}

function TestimonialCard({ item, index }) {
  const { ref, revealed } = useRevealOnScroll();
  const avatar = useRef(null);
  const [imageReady, setImageReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    avatar.current?.decode().catch(() => {}).then(() => { if (mounted) setImageReady(true); });
    return () => { mounted = false; };
  }, [item.image]);
  return <div ref={ref} className="testimonial-slot"><figure data-image-ready={imageReady} className={`testimonial review-reveal${revealed && imageReady ? ' is-revealed' : ''}`} style={{ '--review-delay': `${index * 120}ms` }}>
    <blockquote>{item.quote}</blockquote>
    <figcaption><span className={`review-avatar${item.logo ? ' review-avatar-logo' : ''}`}><img ref={avatar} src={asset(item.image)} alt="" loading="eager" decoding="async" width={item.logo ? undefined : 50} height={item.logo ? undefined : 50} /></span>
      <span className="review-author"><strong>{item.name}</strong><span className="review-role">{item.role}</span></span>
    </figcaption>
  </figure></div>;
}

function Testimonials() {
  return <section id="proof" className="section testimonials" aria-labelledby="proof-heading">
    <RevealHeading id="proof-heading" lines={['Still in doubt?', 'Here’s proof...']} />
    <div className="testimonial-grid">{[testimonials[2], testimonials[0], testimonials[1]].map((item, index) => <TestimonialCard key={item.name} item={item} index={index} />)}</div>
  </section>;
}

function Services() {
  const [activeServiceId, setActiveServiceId] = useState(null);
  return <section className="section services" id="services" aria-labelledby="services-heading">
    <RevealHeading id="services-heading" lines={['Services for your', 'business...']} />
    <div className="service-list">{services.map((service, index) => <ServiceAccordion
      key={service.id} service={service} index={index}
      open={activeServiceId === service.id}
      onToggle={() => setActiveServiceId(previous => previous === service.id ? null : service.id)}
    />)}</div>
  </section>;
}

export default function LandingPage() {
  return <><a className="skip-link" href="#projects">Skip to projects</a><main><Hero /><Tools /><Projects /><Testimonials /><Services /><Contact /></main><Footer /></>;
}
