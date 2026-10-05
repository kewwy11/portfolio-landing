# Grateful Erhis — Portfolio

A responsive React portfolio based on the [Figma design](https://www.figma.com/design/aeXUdTNliWZoSMl14fA5Pi/Portfolio?node-id=507-417), built with semantic HTML, plain CSS, JavaScript, and Vite. Home, About, Projects, and Contact each have their own page component and share the navigation and footer.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://127.0.0.1:5173).

About is available at `/about`, Projects at `/projects`, and Contact at `/contact`.

```sh
npm run build
npm run preview
```

The production build is written to `dist/`.

## Browser checks

```sh
npx playwright install chromium
npm test
```

Checks cover desktop, tablet, and mobile widths; loaded images; horizontal overflow; navigation; project filters; expandable services; and the inquiry form. Screenshots are saved to the ignored `test-results/` directory.

## Content and assets

- `src/App.jsx` and `src/navigation.js`: page routing and navigation links.
- `src/LandingPage.jsx`, `src/AboutPage.jsx`, `src/ProjectsPage.jsx`, and `src/ContactPage.jsx`: individual pages.
- `src/ProjectGallery.jsx` and `src/projects.js`: the shared project gallery and its content.
- `src/ContactSection.jsx`: the shared inquiry form; `src/FaqSection.jsx` and `src/contact.js`: the Contact page FAQ and its Figma content.
- `src/styles.css`: design tokens, layout, and responsive styles.
- `src/content.js`: testimonials, service descriptions, email, social URLs, and shared media settings.
- `public/assets/`: local Figma images/icons and bundled fonts with their license files.

The design uses **Gind** for its display text. The supplied Gind font is served from `public/assets/fonts/Gind.otf` so visitors see the intended typeface; its accompanying `exFont-License.txt` is kept beside it. Poppins and DM Mono are also bundled for the other text.

Both project tabs match the supplied designs: UI/UX includes Lumis Dermatologists and Piggyvest, and Branding includes Lumis and Beacon Trust. The two lime blocks in each tab are present in Figma. Update project content in `src/projects.js`. Social profile URLs can be added in `src/content.js`; unconfigured social names remain plain text.

The contact form validates inputs and opens a prefilled email draft using `mailto:`. It requires the visitor to send the draft in their email app; it does not claim to send messages through a backend.

## Supplying videos

Put MP4 or WebM clips in `public/assets/videos/` and identify which headline, project, or contact slot each clip belongs to. Shared media slots are configured in `src/content.js` and project slots in `src/projects.js`; leave `video` empty for a still image. For a clip named `intro.mp4`, set its slot to `video: 'videos/intro.mp4'`. The reusable `src/Media.jsx` component supports silent looping, playback controls, inline mobile playback, reduced-motion preferences, and an image fallback on loading errors. Clip filenames can be assigned once the video files are supplied.

## GitHub

The project uses `main` with milestone commits and is hosted in the private [kewwy11/portfolio-landing](https://github.com/kewwy11/portfolio-landing) repository. To get another local copy:

```sh
git clone https://github.com/kewwy11/portfolio-landing.git
cd portfolio-landing
npm install
npm run dev
```
