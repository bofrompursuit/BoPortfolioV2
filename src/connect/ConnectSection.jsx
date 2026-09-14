import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactCard, ContributeCard, ConnectCard } from "./cards";
import AccordionGallery from "./AccordionGallery";
import CustomCursor from "./CustomCursor";
import { STATUES } from "./marble";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/assets/video/reveal-v2.mp4";

const TYPE_MS = 55; // per character

// Rendered with white-space: pre-line, so each \n lands as its own centred
// line as the characters type in.
const CTA_TEXT = "click\nhere\nto\ngo\nback\nto\nHOME//";

const PANELS = [
  {
    id: "contact",
    label: "Contact",
    blurb: "Start a conversation.",
    statue: STATUES.contact,
    Card: ContactCard,
  },
  {
    id: "contribute",
    label: "Contribute",
    blurb: "Back the work.",
    statue: STATUES.contribute,
    Card: ContributeCard,
  },
  {
    id: "connect",
    label: "Connect",
    blurb: "Find me elsewhere.",
    statue: STATUES.connect,
    Card: ConnectCard,
  },
];

function backToTop() {
  // Honours the same preference the rest of the page does; scroll-behavior on
  // <html> would otherwise smooth-scroll someone who asked for no motion.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

export default function ConnectSection() {
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const cardsRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [videoFailed, setVideoFailed] = useState(false);

  // Playback: loops continuously (like the hero video), starts when the stage
  // scrolls into view, pauses when it leaves. There is no "ended" state to wait
  // on any more — the corner overlay is always there, footer-style.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    // Decorative footage: its audio track must never play.
    video.muted = true;
    video.volume = 0;

    const fail = () => setVideoFailed(true);

    video.addEventListener("error", fail);
    // The source may fail before this effect runs, and some browsers never fire
    // a bubbling error, so check the element's own state too.
    const checkSource = () => {
      if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail();
    };
    checkSource();
    const sourceTimer = setTimeout(checkSource, 1500);

    const trigger = ScrollTrigger.create({
      trigger: video,
      start: "top 80%",
      end: "bottom top",
      onEnter: () => video.play().catch(() => {}),
      onEnterBack: () => video.play().catch(() => {}),
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    });

    return () => {
      clearTimeout(sourceTimer);
      trigger.kill();
      video.removeEventListener("error", fail);
    };
  }, []);

  // The frame unfurls as the section scrolls in, then the corner link types
  // itself in — no longer gated on the video ending, since it now loops.
  useEffect(() => {
    if (!frameRef.current) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      gsap.set(frameRef.current, { opacity: 1, scale: 1 });
      setTyped(CTA_TEXT);
      return undefined;
    }

    let typingId;
    const startTyping = () => {
      let i = 0;
      typingId = setInterval(() => {
        i += 1;
        setTyped(CTA_TEXT.slice(0, i));
        if (i >= CTA_TEXT.length) clearInterval(typingId);
      }, TYPE_MS);
    };

    const tween = gsap.fromTo(
      frameRef.current,
      { opacity: 0, scale: 0.94 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: "power3.out",
        onStart: startTyping,
        scrollTrigger: { trigger: frameRef.current, start: "top 88%", once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      clearInterval(typingId);
    };
  }, []);

  // Belt and braces: if the reader scrolls to the cards before the video has
  // got there, reveal them anyway.
  useEffect(() => {
    if (!cardsRef.current) return undefined;
    const trigger = ScrollTrigger.create({
      trigger: cardsRef.current,
      start: "top 85%",
      onEnter: () => setRevealed(true),
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!revealed || !cardsRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(cardsRef.current, {
      opacity: 1,
      y: 0,
      duration: reduce ? 0 : 0.9,
      ease: "power3.out",
      overwrite: true,
    });
  }, [revealed]);

  return (
    <>
      <div className="px-[clamp(20px,5vw,56px)] pt-[clamp(40px,6vh,76px)]">
        {/* Header only — the navbar link stays "Contact" so #connect still
            matches what the visitor clicked. */}
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Stay in touch
        </h2>
        <p className="mt-3 max-w-2xl text-white/55">
          Three ways to reach me &mdash; start a project, back the work, or follow along.
        </p>
      </div>

      {/* Accordion gallery */}
      <div
        ref={cardsRef}
        style={{ opacity: 0, transform: "translateY(28px)" }}
        className="px-[clamp(20px,5vw,56px)] pt-[clamp(20px,3vh,36px)]"
      >
        <AccordionGallery panels={PANELS} />
      </div>

      {/* Reveal footage, stitched straight onto the cards above. A square 1:1
          crop on desktop that fills the available width, full-bleed like the
          hero video; on 9:16 mobile it goes fullscreen (see .reveal-frame).
          The footer (copyright + ambient toggle) is baked into this section's
          bottom-right corner instead of living as a separate element. */}
      <div className="reveal-stage" ref={stageRef}>
        <div className="reveal-frame" ref={frameRef} style={{ opacity: 0 }}>
          {videoFailed ? (
            <div className="reveal-fallback" aria-hidden="true" />
          ) : (
            <video
              ref={videoRef}
              className="reveal-video"
              src={VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          )}

          {/* Blends the crop into the page background and darkens the corner
              behind the overlay text so it stays legible over bright footage. */}
          <div className="reveal-vignette" aria-hidden="true" />

          <div className="reveal-overlay">
            <p className="reveal-copyright">
              &copy; <span data-year></span> Bo Moldenhauer. All rights reserved.
            </p>

            <button
              className="music-toggle"
              data-music-toggle
              type="button"
              aria-pressed="false"
              aria-label="Play ambient background music"
            >
              <span className="music-bars" aria-hidden="true"><i></i><i></i><i></i></span>
              <span data-music-label>Ambient off</span>
            </button>

            <button
              type="button"
              className="reveal-cta"
              data-cursor-target
              onClick={backToTop}
              aria-label="Click here to go back to home"
            >
              <span className="reveal-cta-text" aria-hidden="true">
                {typed}
              </span>
              <span className="reveal-cta-caret" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <CustomCursor />

    </>
  );
}
