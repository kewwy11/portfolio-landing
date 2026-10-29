import React, { useEffect, useState } from 'react';
import { projects, projectCategories } from './projects.js';
import { useRef } from 'react';
import { homeProjects } from './home-projects.js';
import Media from './Media.jsx';
import RevealHeading from './RevealHeading.jsx';
import './project-gallery.css';

export default function ProjectGallery({ page = false, headingId = 'projects-heading', ready = true }) {
  const [category, setCategory] = useState(() => new URLSearchParams(window.location.search).get('category') === 'branding' ? 'Branding' : 'UI/UX');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [touched, setTouched] = useState(false);
  const filtered = (page ? projects : homeProjects).filter(project => project.category === category);
  const gridId = `${headingId}-grid`;

  useEffect(() => {
    const dismiss = event => { if (!menuRef.current?.contains(event.target)) setMenuOpen(false); };
    const escape = event => { if (event.key === 'Escape' && menuRef.current?.contains(document.activeElement)) { setMenuOpen(false); menuRef.current?.querySelector('button')?.focus(); } };
    const restore = () => setCategory(new URLSearchParams(window.location.search).get('category') === 'branding' ? 'Branding' : 'UI/UX');
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    window.addEventListener('popstate', restore);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); window.removeEventListener('popstate', restore); };
  }, []);

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

  const selectCategory = label => {
    setMenuOpen(false);
    if (label === category) return;
    setTouched(true);
    setCategory(label);
    const url = new URL(window.location.href);
    url.searchParams.set('category', label === 'Branding' ? 'branding' : 'uiux');
    window.history.replaceState(null, '', url);
  };

  return <div className="project-gallery">
    <div className="section-heading">
      <RevealHeading as={page ? 'h1' : 'h2'} id={headingId} ready={ready}>
        {page ? 'My projects' : 'Projects'}
      </RevealHeading>
      <div ref={menuRef} className="mobile-project-filter" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false); }}>
        <button type="button" className="mobile-filter-toggle" aria-label={`Filter projects: ${category}`} aria-expanded={menuOpen} aria-controls={`${gridId}-filter`} onClick={() => setMenuOpen(open => !open)}>
          {category}<img src={`${import.meta.env.BASE_URL}assets/home/filter-chevron.svg`} alt="" />
        </button>
        {menuOpen && <div className="mobile-filter-options" id={`${gridId}-filter`} role="group" aria-label="Project categories">
          {projectCategories.map(label => <button key={label} type="button" aria-pressed={category === label} aria-controls={gridId} onClick={() => { selectCategory(label); menuRef.current?.querySelector('button')?.focus(); }}>{label}</button>)}
        </div>}
      </div>
      <div className="filters" role="group" aria-label="Filter projects" data-category={category} data-touched={touched}>
        <span className="filter-indicator" aria-hidden="true" />
        {projectCategories.map(label => <button key={label} type="button"
          aria-pressed={category === label} aria-controls={gridId}
          onClick={() => selectCategory(label)}>{label}</button>)}
      </div>
    </div>
    <div id={gridId} className="project-grid" aria-live="polite" aria-atomic="true" data-category={category}>
      {filtered.map((project, index) => {
        const height = page ? 500 : project.height;
        const href = project.id === 'beacon-trust' ? `${import.meta.env.BASE_URL}projects/beacon-trust` : project.id === 'lumis' ? `${import.meta.env.BASE_URL}projects/lumis` : project.id === 'lumis-brand' ? `${import.meta.env.BASE_URL}projects/lumis-brand`
          : project.id === 'piggyvest' ? 'https://www.behance.net/gallery/231953873/Piggyvest-Case-Study' : undefined;
        const external = project.id === 'piggyvest';
        const ImageWrapper = href ? 'a' : 'div';
        return <article key={project.id} className={`project project-${index}`} data-project={project.id}
          style={{ '--project-height': `${height}px`, '--project-aspect': `670 / ${height}` }}>
          <ImageWrapper className={`project-image${project.hoverImage ? ' project-image-swap' : ''}${project.image || project.video ? '' : ' project-placeholder'}`}
            href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
            tabIndex={!href && project.hoverImage ? 0 : undefined} role={!href && project.hoverImage ? 'img' : undefined}
            aria-label={href ? `View ${project.name} case study${external ? ' on Behance (opens in a new tab)' : ''}` : project.hoverImage ? `${project.name}: focus to preview another design` : undefined}>
            <Media image={project.image} video={project.video} alt={project.alt} loading={page && index < 2 ? 'eager' : 'lazy'} />
            {project.hoverImage && <img className="project-hover-image" src={`${import.meta.env.BASE_URL}assets/${project.hoverImage}`} alt={project.hoverAlt} loading="eager" decoding="async" aria-hidden="true" />}
          </ImageWrapper>
          <div className="project-caption">
            <RevealHeading as="h3" ready={ready}>{href ? <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{project.name}</a> : project.name}</RevealHeading>
            {project.tags.length > 0 && <ul className="tags" aria-label="Project type">
              {project.tags.map(tag => <li key={tag}>{tag}</li>)}
            </ul>}
          </div>
        </article>;
      })}
    </div>
  </div>;
}

