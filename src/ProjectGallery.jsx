import React, { useEffect, useState } from 'react';
import { projects, projectCategories } from './projects.js';
import { homeProjects } from './home-projects.js';
import Media from './Media.jsx';
import RevealHeading from './RevealHeading.jsx';
import './project-gallery.css';

export default function ProjectGallery({ page = false, headingId = 'projects-heading', ready = true }) {
  const [category, setCategory] = useState('UI/UX');
  const [touched, setTouched] = useState(false);
  const filtered = (page ? projects : homeProjects).filter(project => project.category === category);
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

  const selectCategory = label => {
    if (label === category) return;
    setTouched(true);
    setCategory(label);
  };

  return <div className="project-gallery">
    <div className="section-heading">
      <RevealHeading as={page ? 'h1' : 'h2'} id={headingId} ready={ready}>
        {page ? 'My projects' : 'Projects'}
      </RevealHeading>
      <div className="filters" role="group" aria-label="Filter projects" data-category={category} data-touched={touched}>
        <span className="filter-indicator" aria-hidden="true" />
        {projectCategories.map(label => <button key={label} type="button"
          aria-pressed={category === label} aria-controls={gridId}
          onClick={() => selectCategory(label)}>{label}</button>)}
      </div>
    </div>
    <div id={gridId} className="project-grid" aria-live="polite" aria-atomic="true" data-category={category}>
      {filtered.map((project, index) => {
        const height = page && category === 'UI/UX' ? 500 : project.height;
        const ImageWrapper = project.id === 'lumis' ? 'a' : 'div';
        return <article key={project.id} className={`project project-${index}`} data-project={project.id}
          style={{ '--project-height': `${height}px`, '--project-aspect': `670 / ${height}` }}>
          <ImageWrapper className={`project-image${project.hoverImage ? ' project-image-swap' : ''}${project.image || project.video ? '' : ' project-placeholder'}`}
            href={project.id === 'lumis' ? `${import.meta.env.BASE_URL}projects/lumis` : undefined}
            tabIndex={project.id !== 'lumis' && project.hoverImage ? 0 : undefined} role={project.id !== 'lumis' && project.hoverImage ? 'img' : undefined}
            aria-label={project.id === 'lumis' ? `View ${project.name} case study` : project.hoverImage ? `${project.name}: focus to preview another design` : undefined}>
            <Media image={project.image} video={project.video} alt={project.alt} loading={page && index < 2 ? 'eager' : 'lazy'} />
            {project.hoverImage && <img className="project-hover-image" src={`${import.meta.env.BASE_URL}assets/${project.hoverImage}`} alt={project.hoverAlt} loading="eager" decoding="async" aria-hidden="true" />}
          </ImageWrapper>
          <div className="project-caption">
            <RevealHeading as="h3" ready={ready}>{project.id === 'lumis' ? <a href={`${import.meta.env.BASE_URL}projects/lumis`}>{project.name}</a> : project.name}</RevealHeading>
            {project.tags.length > 0 && <ul className="tags" aria-label="Project type">
              {project.tags.map(tag => <li key={tag}>{tag}</li>)}
            </ul>}
          </div>
        </article>;
      })}
    </div>
  </div>;
}
