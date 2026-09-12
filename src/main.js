import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

/* ---------- Hero video: play/pause, mute toggle, fallback ---------- */
const video = document.querySelector("[data-hero-video]");
const fallback = document.querySelector("[data-hero-fallback]");
const muteToggle = document.querySelector("[data-mute-toggle]");
const muteIcon = document.querySelector("[data-mute-icon]");
const heroSection = document.querySelector("[data-hero]");
const heroVideoWrap = document.querySelector("[data-hero-video-wrap]");

if (video) {
  const showFallback = () => fallback.classList.add("is-visible");

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

  video.play().catch(() => {
    // Autoplay can be blocked; the poster/fallback still reads fine.
  });

  muteToggle?.addEventListener("click", () => {
    video.muted = !video.muted;
    muteToggle.setAttribute("aria-pressed", String(!video.muted));
    muteIcon.textContent = video.muted ? "🔇" : "🔊";
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

/* ---------- Fade-in for hero intro copy ---------- */
gsap.to("[data-fade]", {
  opacity: 1,
  y: 0,
  duration: 1,
  stagger: 0.12,
  delay: 0.3,
  ease: "power2.out",
});

/* ---------- Reveal-on-scroll for section content ---------- */
document.querySelectorAll("[data-reveal]").forEach((el, i) => {
  if (prefersReducedMotion) {
    el.classList.add("is-visible");
    return;
  }

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    onEnter: () => el.classList.add("is-visible"),
  });
});
