# Bo — Portfolio V2

A modern, interactive portfolio bundled with [Vite](https://vitejs.dev/).
The page shell is plain HTML/CSS animated with [GSAP](https://gsap.com/) +
ScrollTrigger; the Featured Systems & Code showcase is a React island built
with Tailwind CSS and Framer Motion.

The hero is a fullscreen video that scrubs and dims as you scroll. The hero
copy stays hidden until the intro video reaches its name card, then reveals
on a slow stagger.

## Tuning the hero reveal

`HERO_REVEAL_AT_SECONDS` in `src/main.js` is the timestamp (in seconds) at
which the video shows "Bo Moldenhauer — Product Engineer". The copy reveals
at that moment. The current value is a best guess against a 10.01s cut —
adjust it to match the actual frame. If the video can't play at all (blocked
autoplay, missing file, a browser without H.264), the copy reveals anyway via
a fallback timer so it is never stuck hidden.

## Contact & Connect section

`src/connect/` is a scroll-driven sticky sequence: a robotic hand appears,
projects a "Keep on scrolling." holographic card that disintegrates, then the
camera orbits and zooms to three fingertips, revealing fingerprints that carry
the CONTACT / CONTRIBUTE / CONNECT cards. Every card is also rendered in an
always-visible "All channels" grid below the cinematic, so nothing is trapped
behind an animation (this is also what reduced-motion users get).

**Two placeholders to fill in** (`src/connect/cards.jsx`):

- `CONTACT_EMAIL` is still `hello@example.com`. The form has no backend — it
  composes a `mailto:` from the fields. Point it at your real address, or swap
  the submit handler for a form endpoint (Formspree, Getform, etc.).
- `VENMO_HANDLE` / `VENMO_URL` assume `venmo.com/u/beau_moldenhauer`. The QR
  code encodes that URL, so verify it resolves before sharing.

The hand in `RoboticHand.jsx` is a stylized SVG stand-in, not the reference
render. `FINGERTIPS` drives both the camera framing and the hotspot positions,
so a real image can be layered into the same box using those coordinates.

## Showcase content

`src/showcase/projects.js` holds the three categories and their five projects
each. **The card descriptions are inferred from project names and should be
replaced with real copy.** Each item also carries a `gradient` that renders
behind its image, so a failed or blocked image still looks intentional.

## Adding the intro video

The intro video needs to be exported as an actual `.mp4` file and placed at:

```
public/assets/video/intro.mp4
```

The URL you shared (`flow.google.com/project/.../edit/...`) is a link to the
**Google Flow project editor**, not a direct video file — it's behind Google
auth and isn't something this environment can fetch or download
automatically. To use that video:

1. Open the project in Google Flow.
2. Export/download the final cut as an `.mp4`.
3. Save it as `public/assets/video/intro.mp4` in this repo (and, optionally,
   a poster frame as `public/assets/poster/hero-poster.jpg`).
4. Commit and push.

Until a real file is added, the hero automatically falls back to a gradient
background (see `.hero-video-fallback` in `src/style.css`) so the layout
never breaks — this was verified locally (see below).

## Development

```bash
npm install
npm run dev       # start local dev server (http://localhost:5173)
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

## Project structure

```
index.html                        Markup for the page shell
src/style.css                     Dark theme, responsive, reduced-motion aware
src/tailwind.css                  Tailwind entry (loaded before style.css)
src/main.js                       Hero video, reveal timing, GSAP, React mount
src/showcase/projects.js          Category + project data (edit copy here)
src/showcase/FeaturedShowcase.jsx Section header + the three category rows
src/showcase/CategoryRow.jsx      Auto-scrolling marquee of project cards
src/showcase/FullscreenShowcase.jsx  Full-screen slider + glass thumbnail nav
src/showcase/ShowcaseImage.jsx    Image with a gradient fallback layer
public/assets/video/              Hero video lives here (intro.mp4)
vite.config.js                    Build config (React, Tailwind, outputs dist/)
```

## Deployment

The project builds to a fully static `dist/` folder, so it deploys to any
static host:

- **Vercel**: `vercel --prod` (or connect the repo in the Vercel dashboard —
  framework preset "Vite", build command `npm run build`, output `dist`).
- **Netlify**: build command `npm run build`, publish directory `dist`.
- **GitHub Pages / any static host**: run `npm run build` and upload the
  contents of `dist/`.

Run `npm run build` locally first to confirm the production bundle compiles
cleanly before deploying.
