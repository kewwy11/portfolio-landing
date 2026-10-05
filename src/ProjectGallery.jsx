import React, { useState } from 'react';
import { projects, projectCategories } from './projects.js';
import Media from './Media.jsx';
import RevealHeading from './RevealHeading.jsx';
import './project-gallery.css';

export default function ProjectGallery({ page = false, headingId = 'projects-heading', ready = true }) {
  const [category, setCategory] = useState('UI/UX');
  const filtered = projects.filter(project => project.category === category);
  const gridId = `${headingId}-grid`;

  return <div className="project-gallery">
    <div className="section-heading">
      <RevealHeading as={page ? 'h1' : 'h2'} id={headingId} ready={ready}>
        {page ? 'My projects' : 'Projects'}
      </RevealHeading>
      <div className="filters" role="group" aria-label="Filter projects">
        {projectCategories.map(label => <button key={label} type="button"
          aria-pressed={category === label} aria-controls={gridId}
          onClick={() => setCategory(label)}>{label}</button>)}
      </div>
    </div>
    <div id={gridId} className="project-grid" aria-live="polite" aria-atomic="true" data-category={category}>
      {filtered.map((project, index) => {
        const height = page && category === 'UI/UX' ? 500 : project.height;
        return <article key={project.id} className={`project project-${index}`} data-project={project.id}
          style={{ '--project-height': `${height}px`, '--project-aspect': `670 / ${height}` }}>
          <div className={`project-image${project.image || project.video ? '' : ' project-placeholder'}`}>
            <Media image={project.image} video={project.video} alt={project.alt} loading={page && index < 2 ? 'eager' : 'lazy'} />
          </div>
          <div className="project-caption">
            <RevealHeading as="h3" ready={ready}>{project.name}</RevealHeading>
            <ul className="tags" aria-label="Project type">
              {project.tags.map(tag => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
        </article>;
      })}
    </div>
  </div>;
}
