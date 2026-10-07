import React, { useEffect, useLayoutEffect, useRef, useState, useTransition } from 'react';
import { gsap } from 'gsap';
import { projects, projectCategories } from './projects.js';
import { homeProjects } from './home-projects.js';
import Media from './Media.jsx';
import RevealHeading from './RevealHeading.jsx';
import './project-gallery.css';

export default function ProjectGallery({ page = false, headingId = 'projects-heading', ready = true }) {
  const [category, setCategory] = useState('UI/UX');
  const [displayedCategory, setDisplayedCategory] = useState('UI/UX');
  const [pending, startTransition] = useTransition();
  const indicator = useRef(null);
  const filtered = (page ? projects : homeProjects).filter(project => project.category === displayedCategory);
  const gridId = `${headingId}-grid`;

  useEffect(() => {
    // Warm decoded images before either a hover or a category change needs them.
    const images = (page ? projects : homeProjects).flatMap(project => [project.image, project.hoverImage]).filter(Boolean);
    for (const file of new Set(images)) {
      const image = new Image();
      image.decoding = 'async';
      image.src = `${import.meta.env.BASE_URL}assets/${file}`;
      image.decode().catch(() => {});
    }
  }, [page]);

  useLayoutEffect(() => {
    const element = indicator.current;
    const destination = category === 'Branding' ? 100 : 0;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let motion;
    const settle = () => {
      motion?.kill();
      gsap.set(element, { xPercent: destination, scaleX: 1 });
    };
    if (preference.matches || Number(gsap.getProperty(element, 'xPercent')) === destination) settle();
    else {
      motion = gsap.timeline();
      // Travel starts immediately; stretching briefly leaves a visible trailing edge.
      // Killing a previous timeline retains its current transform for smooth reversals.
      motion.to(element, { xPercent: destination, duration: .6, ease: 'power3.out' }, 0)
        .to(element, { scaleX: 1.2, duration: .18, ease: 'sine.out' }, 0)
        .to(element, { scaleX: 1, duration: .42, ease: 'power2.out' }, .18);
    }
    preference.addEventListener('change', settle);
    return () => { motion?.kill(); preference.removeEventListener('change', settle); };
  }, [category]);

  const selectCategory = label => {
    setCategory(label);
    startTransition(() => setDisplayedCategory(label));
  };

  return <div className="project-gallery">
    <div className="section-heading">
      <RevealHeading as={page ? 'h1' : 'h2'} id={headingId} ready={ready}>
        {page ? 'My projects' : 'Projects'}
      </RevealHeading>
      <div className="filters" role="group" aria-label="Filter projects" data-category={category}>
        <span ref={indicator} className="filter-indicator" aria-hidden="true" />
        {projectCategories.map(label => <button key={label} type="button"
          aria-pressed={category === label} aria-controls={gridId}
          onClick={() => selectCategory(label)}>{label}</button>)}
      </div>
    </div>
    <div id={gridId} className="project-grid" aria-live="polite" aria-atomic="true" aria-busy={pending} data-category={displayedCategory}>
      {filtered.map((project, index) => {
        const height = page && displayedCategory === 'UI/UX' ? 500 : project.height;
        return <article key={project.id} className={`project project-${index}`} data-project={project.id}
          style={{ '--project-height': `${height}px`, '--project-aspect': `670 / ${height}` }}>
          <div className={`project-image${project.hoverImage ? ' project-image-swap' : ''}${project.image || project.video ? '' : ' project-placeholder'}`}
            tabIndex={project.hoverImage ? 0 : undefined} role={project.hoverImage ? 'img' : undefined}
            aria-label={project.hoverImage ? `${project.name}: focus to preview another design` : undefined}>
            <Media image={project.image} video={project.video} alt={project.alt} loading={page && index < 2 ? 'eager' : 'lazy'} />
            {project.hoverImage && <img className="project-hover-image" src={`${import.meta.env.BASE_URL}assets/${project.hoverImage}`} alt={project.hoverAlt} loading="eager" decoding="async" aria-hidden="true" />}
          </div>
          <div className="project-caption">
            <RevealHeading as="h3" ready={ready}>{project.name}</RevealHeading>
            {project.tags.length > 0 && <ul className="tags" aria-label="Project type">
              {project.tags.map(tag => <li key={tag}>{tag}</li>)}
            </ul>}
          </div>
        </article>;
      })}
    </div>
  </div>;
}
