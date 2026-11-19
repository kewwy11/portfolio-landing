export const email = 'erhisohwodegratefulruki@gmail.com';

export const navigation = [
  ['Home', 'home'], ['Resume', 'resume'], ['Projects', 'projects'],
  ['Services', 'services'], ['Contact', 'contact'],
];

export const menuNavigation = [
  ['Home', 'home'], ['Resume', 'resume'], ['Projects', 'projects'],
  ['Services', 'services'], ['Let’s Talk', 'contact'],
];

export const heroMedia = {
  pink: { image: 'videos/pink-reel-poster.jpg', video: 'videos/pink-reel.mp4' },
  design: { image: 'videos/hero-design.gif', video: '' },
  visuals: { image: 'videos/visual-reel-poster.jpg', video: 'videos/visual-reel.mp4' },
};

export const contactMedia = { image: 'videos/visual-reel-poster.jpg', video: 'videos/visual-reel.mp4' };

export { projects } from './projects.js';

export const testimonials = [
  {
    quote: 'I met Grateful through a recommendation from a former colleague of hers. She started out as a freelancer redesigning the Careerontrack landing page, but she didn’t just redesign it. She walked me through what the issues were and why the page wasn’t helping the product we were trying to build. She eventually joined the company permanently as our lead designer.',
    name: 'Samuel Olu', role: 'CEO, Careerontrack AI', image: 'home/review-samuel.png',
  },
  {
    quote: 'Grateful joined us as an intern but quickly stood out. While others handled smaller tasks, she asked to lead projects and never shied away from demanding workloads. She asked questions, contributed to design decisions, and worked closely with developers until her first project was completed. She’s a talent who keeps getting better.',
    name: 'Ibrahim Adekunle', role: 'Lead Designer - SBSC', image: 'home/review-ibrahim.png',
  },
  {
    quote: 'There’s no doubt that she is a talented individual who understands design. She created our brand and visual identity from something that was barely a brief. She hopped on a call with my co-founder and me and had us explain our vision for the brand. In less than two weeks, we had a fully developed brand identity that has helped us stand out in the finance space.',
    name: 'Jesse A.', role: 'Co-founder - Beacon Trust', image: 'home/review-beacon.svg', logo: true,
  },
];

export const services = [
  {
    id: 'strategy', name: 'Strategy', title: ['Creative', 'Direction'], image: 'services/strategy.png',
    paragraphs: [
      'Before I design anything, I define the structure, message, and visual direction of the site. Every page gets a clear purpose, so the final result feels focused and easy to understand.',
      'I look at your brand, audience, content, and goals, then turn all of it into one simple creative direction that guides the rest of the project.',
    ],
    milestones: ['Project Discovery', 'Competitor Research', 'Product structure', 'Creative Direction'],
  },
  {
    id: 'branding', name: 'Branding', title: ['Brand & Visual', 'identity'], image: 'services/branding.png',
    paragraphs: [
      'When creating a brand and visual identity for a business, I focus less on the aesthetics and more on what founders/business owners want their product to feel like when users come across it.',
      'One of the key goals is to make a logo that stands out among the competition, a visual identity that sells the message of the brand. I also make sure I help brands curate their social media to invite their target audience.',
    ],
    milestones: ['Logo & Marks', 'Colour & type system', 'Brand guidelines', 'social templates'],
  },
  {
    id: 'product-design', name: 'Product Design', title: ['Websites, Apps &', 'dashboards'], image: 'services/product-design.png',
    paragraphs: [
      'I focus on B2C companies because I love working with products that directly interact with consumers.',
      'I create websites that catch the attention of consumers in the first 7second of their visit cause that’s how long you have to keep them\nI create app onboarding experiences that don’t wear them out before they get to experience the product.',
      'And finally, I create dashboards that actually give consumers insight to their data/activities rather than confuse them.',
    ],
    milestones: ['wireframe', 'ui design', 'prototype', 'design system'],
  },
  {
    id: 'development', name: 'Development', title: ['FROM DESIGN TO LIVE PRODUCT'], image: 'services/development.png',
    paragraphs: [
      'I take projects end to end, from design through to development, using AI tools like Claude and Codex to iterate faster and tighten the build.',
      'It also means I speak the same language as seasoned developers at hand-off, and stay involved right through to launch.',
    ],
    milestones: ['responsive build', 'component library', 'hand-off documentation', 'Launch support'],
  },
  {
    id: 'graphics', name: 'Graphics', title: ['POSTERS & PERSONAL WORK'], image: 'services/graphics.png',
    paragraphs: [
      "From time to time I make sport, film, and creative posters. It's personal work, and it keeps my eye sharp and my tools sharper.",
      "It's also where most of my taste comes from, and those instincts go straight back into the visuals I make for brands.",
    ],
    milestones: ['poster design', 'campaign design', 'social graphics', 'Typography and photography exploration'],
  },
];

export const socials = [
  { name: 'GitHub', url: 'https://github.com/kewwy11' },
  { name: 'X (Twitter)', url: 'https://x.com/des1gn_princess' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/grateful-erhis-343a9629a/?isSelfProfile=true' },
  { name: 'Instagram', url: 'https://www.instagram.com/erhisgrateful/' },
  { name: 'Pinterest', url: 'https://www.pinterest.com/Designgirlyyy/' },
  { name: 'Behance', url: 'https://www.behance.net/gratefulerhisoh' },
];
