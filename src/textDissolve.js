/**
 * Scroll-driven particle dissolve for text overlays.
 *
 * Each target's text is rasterized to an offscreen canvas, sampled into
 * particles, and redrawn every frame from a single scroll progress value.
 * Particles are grouped into delay buckets by x position so the text shatters
 * left-to-right, and so alpha is a per-bucket state change rather than a
 * per-particle one.
 *
 * Pass `trackScroll: false` for targets inside a pinned section, where the
 * element stays put in the viewport while the page scrolls underneath.
 */

import gsap from "gsap";

const SAMPLE_STEP = 4; // px between samples — lower is denser and slower
const PARTICLE_SIZE = 3; // slightly wider than the step, so the text reads solid at rest
const RISE = 150; // px the particles drift upward across the dissolve
const SPREAD_X = 70;
const SPREAD_Y = 55;
const BUCKETS = 12;
const MAX_DELAY = 0.35; // last bucket starts this far into the scroll
const DOM_FADE_UNTIL = 0.18; // the real text crossfades out over this much scroll

const FLOATS_PER_PARTICLE = 5; // x0, y0, dx, dy, seed

function textOf(element, style) {
  const text = element.textContent.trim();
  return style.textTransform === "uppercase" ? text.toUpperCase() : text;
}

function rasterize(element) {
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return null;

  const style = getComputedStyle(element);
  if (parseFloat(style.opacity) < 0.05) return null;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(rect.width);
  canvas.height = Math.ceil(rect.height);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if ("letterSpacing" in ctx) {
    ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
  }
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(textOf(element, style), 0, canvas.height / 2);

  return {
    rect,
    color: style.color,
    pixels: ctx.getImageData(0, 0, canvas.width, canvas.height),
  };
}

function sampleToBuckets({ rect, color, pixels }) {
  const { data, width, height } = pixels;
  const buckets = Array.from({ length: BUCKETS }, () => []);

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      if (data[(y * width + x) * 4 + 3] < 128) continue;

      const bucket = Math.min(BUCKETS - 1, Math.floor((x / width) * BUCKETS));
      buckets[bucket].push(
        rect.left + x,
        rect.top + y,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * Math.PI * 2
      );
    }
  }

  return buckets
    .map((values, i) => ({
      color,
      delay: (i / BUCKETS) * MAX_DELAY,
      points: Float32Array.from(values),
    }))
    .filter((group) => group.points.length > 0);
}

export function createTextDissolve(elements, { trackScroll = true } = {}) {
  const targets = [...elements];
  if (!targets.length) return { update() {}, destroy() {} };

  let canvas = null;
  let ctx = null;
  let groups = null;
  let captureScrollY = 0;

  function ensureCanvas() {
    if (canvas) return;

    canvas = document.createElement("canvas");
    canvas.className = "text-dissolve-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(window.innerWidth * dpr);
    canvas.height = Math.ceil(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function build() {
    const captured = targets.map(rasterize).filter(Boolean);

    // Nothing visible yet (the copy reveals only once the video hits its name
    // card). Leave groups null so the next scroll update tries again.
    if (!captured.length) {
      groups = null;
      return;
    }

    // The reveal tween also drives these elements; the dissolve takes
    // ownership of their opacity and transform from here.
    targets.forEach((el) => {
      gsap.killTweensOf(el);
      gsap.set(el, { opacity: 1, y: 0 });
    });

    groups = captured.flatMap(sampleToBuckets);
    captureScrollY = window.scrollY;
    ensureCanvas();
  }

  function restore() {
    if (groups) {
      targets.forEach((el) => {
        el.style.opacity = "1";
      });
      if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    groups = null; // rebuilt on the next scroll down, with fresh positions
  }

  function draw(progress) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const scrollDelta = trackScroll ? window.scrollY - captureScrollY : 0;

    for (const group of groups) {
      const local = Math.min(
        Math.max((progress - group.delay) / (1 - group.delay), 0),
        1
      );
      if (local >= 1) continue;

      // Spread accelerates, but the upward drift stays near-linear so the
      // rising gesture reads from the very start of the scroll.
      const eased = local * local;
      const rise = RISE * local;
      ctx.globalAlpha = 1 - local;
      ctx.fillStyle = group.color;

      const { points } = group;
      for (let i = 0; i < points.length; i += FLOATS_PER_PARTICLE) {
        const turbulence = Math.sin(points[i + 4] + local * 6) * 10 * eased;
        const x = points[i] + points[i + 2] * SPREAD_X * eased + turbulence;
        const y =
          points[i + 1] -
          scrollDelta -
          rise +
          points[i + 3] * SPREAD_Y * eased;

        ctx.fillRect(x, y, PARTICLE_SIZE, PARTICLE_SIZE);
      }
    }

    ctx.globalAlpha = 1;
  }

  function update(progress) {
    if (progress <= 0) {
      restore();
      return;
    }

    if (!groups) build();
    if (!groups) return;

    const domAlpha = 1 - Math.min(progress / DOM_FADE_UNTIL, 1);
    targets.forEach((el) => {
      el.style.opacity = String(domAlpha);
    });

    draw(progress);
  }

  function destroy() {
    window.removeEventListener("resize", resizeCanvas);
    canvas?.remove();
    canvas = null;
    ctx = null;
    groups = null;
  }

  return { update, destroy };
}
