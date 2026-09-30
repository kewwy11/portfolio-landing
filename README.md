# Grateful Erhis — Portfolio landing page

A responsive React landing page based on the [Figma design](https://www.figma.com/design/aeXUdTNliWZoSMl14fA5Pi/Portfolio?node-id=507-417), built with semantic HTML, plain CSS, JavaScript, and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://127.0.0.1:5173).

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

- `src/App.jsx`: page sections and interactions.
- `src/styles.css`: design tokens, layout, and responsive styles.
- `src/content.js`: projects, testimonials, service descriptions, email, and social URLs.
- `public/assets/`: local Figma images/icons and bundled fonts with their license files.

The design uses **Gind** for its display text. The supplied Gind font is served from `public/assets/fonts/Gind.otf` so visitors see the intended typeface; its accompanying `exFont-License.txt` is kept beside it. Poppins and DM Mono are also bundled for the other text.

The two lime project blocks are present in the supplied design and remain placeholders. No branding projects or social profile URLs were supplied, so the Branding filter shows an empty state and social names are plain text. Add verified content in `src/content.js`.

The contact form validates inputs and opens a prefilled email draft using `mailto:`. It requires the visitor to send the draft in their email app; it does not claim to send messages through a backend.

## Supplying videos

Put MP4 or WebM clips in `public/assets/videos/` and identify which headline, project, or contact slot each clip belongs to. Every slot is ready for a video in `src/content.js`; leave `video` empty for a still image. For a clip named `intro.mp4`, set its slot to `video: 'videos/intro.mp4'`. The reusable `src/Media.jsx` component supports silent looping, playback controls, inline mobile playback, reduced-motion preferences, and an image fallback on loading errors. Clip filenames can be assigned once the video files are supplied.

## GitHub

The project uses `main` with milestone commits and is hosted in the private [kewwy11/portfolio-landing](https://github.com/kewwy11/portfolio-landing) repository. To get another local copy:

```sh
git clone https://github.com/kewwy11/portfolio-landing.git
cd portfolio-landing
npm install
npm run dev
```
