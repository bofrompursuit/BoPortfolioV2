import "./tailwind.css";
import "./style.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountShowcase } from "./showcase/mount.jsx";
import { mountConnect } from "./connect/mount.jsx";
import { createFooterMusic } from "./footerMusic.js";

gsap.registerPlugin(ScrollTrigger);

// Seconds into intro.mp4 at which the name card lands — tune to match the cut.
const HERO_REVEAL_AT_SECONDS = 7.2;
// If the video never starts (blocked autoplay, missing file, no codec support),
// the hero copy still has to appear.
const HERO_REVEAL_FALLBACK_MS = 3000;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

document.querySelector("[data-year]").textContent = new Date().getFullYear();

/* ---------- Header background on scroll ---------- */
const header = document.querySelector("[data-header]");
ScrollTrigger.create({
  start: 60,
  onUpdate: (self) => {
    header.classList.toggle("is-scrolled", self.scroll() > 40);
  },
});

/* ---------- Hero copy: slow reveal once the video shows the name card ---------- */
let heroRevealed = false;

function revealHeroCopy() {
  if (heroRevealed) return;
  heroRevealed = true;

  gsap.to("[data-hero-reveal]", {
    opacity: 1,
    y: 0,
    duration: 1.6,
    stagger: 0.45,
    ease: "power2.out",
  });
}

/* ---------- Hero video: play/pause, mute toggle, fallback ---------- */
const video = document.querySelector("[data-hero-video]");
const fallback = document.querySelector("[data-hero-fallback]");
const heroSection = document.querySelector("[data-hero]");
const heroVideoWrap = document.querySelector("[data-hero-video-wrap]");

if (video) {
  // The hero video is decorative; its audio track must never play.
  video.muted = true;
  video.volume = 0;

  const showFallback = () => {
    fallback.classList.add("is-visible");
    revealHeroCopy();
  };

  video.addEventListener("error", showFallback);
  // The <source> may 404 before this script runs (or the error event can be
  // missed in some browsers), so also poll the element's own error state.
  const checkForMissingSource = () => {
    if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      showFallback();
    }
  };
  checkForMissingSource();
  setTimeout(checkForMissingSource, 1500);

  video.addEventListener("timeupdate", () => {
    if (video.currentTime >= HERO_REVEAL_AT_SECONDS) revealHeroCopy();
  });
  video.addEventListener("ended", revealHeroCopy);

  setTimeout(() => {
    if (video.paused || video.error || video.currentTime === 0) revealHeroCopy();
  }, HERO_REVEAL_FALLBACK_MS);

  video.play().catch(() => {
    // Autoplay can be blocked; the fallback timer still reveals the copy.
  });

  // Pause the video once the hero scrolls out of view to save resources.
  ScrollTrigger.create({
    trigger: heroSection,
    start: "top bottom",
    end: "bottom top",
    onEnter: () => video.play().catch(() => {}),
    onLeave: () => video.pause(),
    onEnterBack: () => video.play().catch(() => {}),
    onLeaveBack: () => video.pause(),
  });
} else {
  revealHeroCopy();
}

/* ---------- Scroll-driven hero transition ---------- */
if (!prefersReducedMotion && heroVideoWrap) {
  gsap.timeline({
    scrollTrigger: {
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  })
    .to(heroVideoWrap, { scale: 1.12, filter: "brightness(0.55)", ease: "none" }, 0)
    .to("[data-hero] .hero-content", { y: -80, opacity: 0, ease: "none" }, 0)
    .to("[data-hero] .scroll-cue", { opacity: 0, ease: "none" }, 0);
}

/* ---------- Vision banner waves: freeze the ambient drift for reduced motion ---------- */
if (prefersReducedMotion) {
  document.querySelector(".vision-banner-waves")?.pauseAnimations();
}

/* ---------- Mount the React islands ---------- */
const showcaseRoot = document.getElementById("showcase-root");
if (showcaseRoot) mountShowcase(showcaseRoot);

const connectRoot = document.getElementById("connect-root");
if (connectRoot) mountConnect(connectRoot);

/* ---------- Footer ambient music (synthesised, starts paused) ---------- */
const musicToggle = document.querySelector("[data-music-toggle]");
if (musicToggle) {
  const music = createFooterMusic();
  const label = musicToggle.querySelector("[data-music-label]");

  musicToggle.addEventListener("click", async () => {
    const nowPlaying = await music.toggle();
    musicToggle.classList.toggle("is-playing", nowPlaying);
    musicToggle.setAttribute("aria-pressed", String(nowPlaying));
    musicToggle.setAttribute(
      "aria-label",
      nowPlaying ? "Mute ambient background music" : "Play ambient background music"
    );
    if (label) label.textContent = nowPlaying ? "Ambient on" : "Ambient off";
  });
}
