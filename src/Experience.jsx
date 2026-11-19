import React, { useId, useState } from 'react';
import AccordionPanel from './AccordionPanel.jsx';
import RevealHeading from './RevealHeading.jsx';
import TalkButton from './TalkButton.jsx';
import { resumePdfHref } from './navigation.js';
import './experience.css';

const asset = name => `${import.meta.env.BASE_URL}assets/experience-${name}.svg`;

const experiences = [
  {
    title: 'Visual Designer',
    role: 'Freelance',
    dates: '2025 – Present',
    description: 'Worked with businesses across fintech, telecommunications, and consumer services to design digital products and brand experiences. Projects range from subscription and payment systems to brand identities, digital campaigns, and responsive websites.',
    skills: ['Product design', 'AI-native design', 'Brand identity', 'Brand & business strategy'],
  },
  {
    title: 'Careerontrack AI',
    role: 'Lead Product Designer',
    dates: '2024 – 2025',
    href: 'https://www.careerontrack.ai/',
    description: 'Led the design of AI-powered career products, including a résumé scanner, interview preparation platform, and conversational career assistant. Worked with stakeholders and developers to turn user problems into product features that improved engagement and reduced support workload.',
    skills: ['Product design', 'AI-native design', 'Experience design', 'Leadership'],
  },
  {
    title: 'Beacon Trust',
    role: 'Brand Designer',
    dates: '2025',
    description: "Developed a visual identity system for a growing financial services brand, translating the founders' vision into a consistent identity across digital communications, marketing campaigns, and customer touchpoints.",
    skills: ['Branding', 'Graphic design', 'Creative direction'],
  },
  {
    title: 'Software Business Solution Consulting',
    role: 'Product Designer',
    dates: '2024 – 2025',
    href: 'https://www.quick-retail.com/',
    description: 'Designed e-commerce platforms and business management tools, simplifying customer ordering experiences and improving how businesses manage inventory, sales, and everyday operations. Collaborated with designers and developers to deliver solutions for real business needs.',
    skills: ['Product design', 'User interface design', 'User experience design'],
  },
];

function ExperienceRow({ experience, open, onToggle }) {
  const id = useId();
  const { title, role, dates, href, description, skills } = experience;
  const titleId = `experience-title-${id}`;
  const panelId = `experience-panel-${id}`;

  return <article className={`experience-row${open ? ' is-open' : ''}`}>
    <div className="experience-row-header">
      <div className="experience-role">
        <h3 id={titleId}>
          {href ? <a href={href}>{title}<span className="experience-company-arrow">
            <img src={asset('arrow')} alt="" />
          </span></a> : title}
        </h3>
        <p>{role}</p>
      </div>
      <p className="experience-date">{dates}</p>
      <button type="button" className="experience-toggle" aria-expanded={open} aria-controls={panelId}
        aria-label={`Details for ${title}`} onClick={onToggle}>
        <img src={asset('plus')} alt="" />
        <img src={asset('close')} alt="" />
      </button>
    </div>
    <AccordionPanel id={panelId} labelledBy={titleId} open={open}>
      <div className="experience-details">
        <p className="experience-description">{description}</p>
        <div>
          <p className="experience-skills-label">Core skills</p>
          <ul className="experience-skills">
            {skills.map(skill => <li key={skill}>{skill}</li>)}
          </ul>
        </div>
      </div>
    </AccordionPanel>
  </article>;
}

export default function Experience() {
  const [active, setActive] = useState(null);
  return <section className="section experience" id="experience" aria-labelledby="experience-heading">
    <div className="experience-heading">
      <RevealHeading id="experience-heading">Experience</RevealHeading>
      <TalkButton as="a" className="experience-resume" href={resumePdfHref} target="_blank" rel="noopener">
        View Resume
      </TalkButton>
    </div>
    <div className="experience-list">
      {experiences.map(experience => <ExperienceRow key={experience.title} experience={experience}
        open={active === experience.title}
        onToggle={() => setActive(current => current === experience.title ? null : experience.title)} />)}
    </div>
  </section>;
}
