export const email = 'erhisohwodegratefulruki@gmail.com';

export const navigation = [
  ['Home', 'home'], ['About', 'about'], ['Projects', 'projects'],
  ['Services', 'services'], ['Contact', 'contact'],
];

export const menuNavigation = [
  ['Home', 'home'], ['About', 'about'], ['Projects', 'projects'],
  ['Services', 'services'], ['Proof', 'proof'], ['Let’s Talk', 'contact'],
];

// Add uploaded files from public/assets/videos/ to the video fields. Leave a
// video blank when that slot should remain a still image.
export const heroMedia = {
  pink: { image: 'hero-pink.png', video: '' },
  design: { image: 'hero-design.png', video: '' },
  visuals: { image: 'hero-visuals.png', video: '' },
};

export const contactMedia = { image: 'contact.png', video: '' };

export const projects = [
  { id: 'lumis', name: 'Lumis Dermatologists', image: 'imgFrame14.png', video: '', alt: 'Lumis dermatology dashboard displayed on a laptop', category: 'UI/UX' },
  { id: 'piggyvest', name: 'Piggyvest', image: 'imgFrame15.png', video: '', alt: 'Piggyvest mobile finance interface displayed on a phone', category: 'UI/UX' },
  { id: 'lumis-concept-1', name: 'Lumis Dermatologists', image: '', video: '', alt: 'Lumis Dermatologists project', category: 'UI/UX' },
  { id: 'lumis-concept-2', name: 'Lumis Dermatologists', image: '', video: '', alt: 'Lumis Dermatologists project', category: 'UI/UX' },
];

export const testimonials = [
  {
    quote: 'I met Grateful through a recommendation from her former colleague. She started out as a freelancer redesigning Careerontrack Landing page, but she didn’t just redesign, she walked me through what the issues where and why it didn’t help the product we were trying to build. Her role eventually became permanent in the company as she became our lead designer.',
    name: 'Samuel Olu', role: 'CEO, Careerontrack AI',
  },
  {
    quote: 'Grateful started out as an intern in our company, but she was exceptional. While other interns kept handling minor tasks, she asked for lead roles on projects and never wavered when she saw the work load. She always asked questions an made sure she gave her input on design decisions. For her first project she worked closely with the devs until the project was completed. She is a talent that honestly only keeps getting better',
    name: 'Ibrahim Adekunle', role: 'Lead Designer - SBSC',
  },
  {
    quote: 'No doubt she is a talented individual that understands design. She created our brand and visual identity, from something that was barely a brief. She hoped on the call with I and my co-founder and had us explain the vision we had for the brand and in less than two weeks, we had a fully fleshed brand identity that has made us stand out in the finance space.',
    name: 'Jesse A.', role: 'Co-founder - Beacon Trust',
  },
];

export const services = [
  {
    id: 'strategy', name: 'Strategy', title: ['Creative', 'Direction'],
    paragraphs: [
      'Before I design anything, I define the structure, message, and visual direction of the site. Every page gets a clear purpose, so the final result feels focused and easy to understand.',
      'I look at your brand, audience, content, and goals, then turn all of it into one simple creative direction that guides the rest of the project.',
    ],
    milestones: ['Project Discovery', 'Competitor Research', 'Product structure', 'Creative Direction'],
  },
  {
    id: 'branding', name: 'Branding', title: ['Brand & Visual', 'identity'],
    paragraphs: [
      'When creating a brand and visual identity for a business, I focus less on the aesthetics and more on what founders/business owners want their product to feel like when users come across it.',
      'One of the key goals is to make a logo that stands out among the competition, a visual identity that sells the message of the brand. I also make sure I help brands curate their social media to invite their target audience.',
    ],
    milestones: ['Logo & Marks', 'Colour & type system', 'Brand guidelines', 'social templates'],
  },
  {
    id: 'product-design', name: 'Product Design', title: ['Websites, Apps &', 'dashboards'],
    paragraphs: [
      'I focus on B2C companies because I love working with products that directly interact with consumers.',
      'I create websites that catch the attention of consumers in the first 7second of their visit cause that’s how long you have to keep them\nI create app onboarding experiences that don’t wear them out before they get to experience the product.',
      'And finally, I create dashboards that actually give consumers insight to their data/activities rather than confuse them.',
    ],
    milestones: ['wireframe', 'ui design', 'prototype', 'design system'],
  },
  {
    id: 'development', name: 'Development', title: ['FROM DESIGN TO LIVE PRODUCT'],
    paragraphs: [
      'I take projects end to end, from design through to development, using AI tools like Claude and Codex to iterate faster and tighten the build.',
      'It also means I speak the same language as seasoned developers at hand-off, and stay involved right through to launch.',
    ],
    milestones: ['responsive build', 'component library', 'hand-off documentation', 'Launch support'],
  },
  {
    id: 'graphics', name: 'Graphics', title: ['POSTERS & PERSONAL WORK'],
    paragraphs: [
      "From time to time I make sport, film, and creative posters. It's personal work, and it keeps my eye sharp and my tools sharper.",
      "It's also where most of my taste comes from, and those instincts go straight back into the visuals I make for brands.",
    ],
    milestones: ['poster design', 'campaign design', 'social graphics', 'Typography and photography exploration'],
  },
];

// Add verified profile URLs here when available. Unconfigured accounts are
// displayed as text rather than linking visitors to unrelated profiles.
export const socials = [
  { name: 'X (Twitter)', url: '' }, { name: 'LinkedIn', url: '' },
  { name: 'Instagram', url: '' }, { name: 'Pinterest', url: '' },
  { name: 'Behance', url: '' },
];
