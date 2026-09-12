# Bo — Portfolio V2

A modern, interactive portfolio built with plain HTML/CSS/JS, bundled with
[Vite](https://vitejs.dev/) and animated with [GSAP](https://gsap.com/) +
ScrollTrigger. The hero is a fullscreen video that scrubs, dims, and fades
its overlay copy as you scroll, then hands off into the rest of the page.

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
index.html              Markup for the whole single-page site
src/style.css            Styles (dark theme, responsive, reduced-motion aware)
src/main.js              GSAP ScrollTrigger-driven hero + reveal animations
public/assets/video/     Hero video lives here (intro.mp4)
public/assets/poster/    Optional poster frame for the hero video
vite.config.js           Build config (relative asset base, outputs to dist/)
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
