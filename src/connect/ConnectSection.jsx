import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactCard, ContributeCard, ConnectCard } from "./cards";
import AccordionGallery from "./AccordionGallery";
import CustomCursor from "./CustomCursor";
import { STATUES } from "./marble";
import VisionServices from "./VisionServices";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/assets/video/hand-reveal.mp4";

// The link waits for the footage to finish. No fraction, no early reveal: the
// reader watches the whole thing before being offered the way out. A video that
// never starts is the one exception, guarded below.
const NEVER_STARTED_MS = 6000;
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
  const orbRef = useRef(null);
  const cardsRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  // Playback has reached its reveal, so the orb dims and the link takes over.
  const [settled, setSettled] = useState(false);
  const [typed, setTyped] = useState("");
  const [videoFailed, setVideoFailed] = useState(false);

  // Playback: start when the stage scrolls into view, pause when it leaves.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    // Decorative footage: its audio track must never play.
    video.muted = true;
    video.volume = 0;

    const settle = () => setSettled(true);
    const fail = () => {
      setVideoFailed(true);
      settle();
    };

    video.addEventListener("error", fail);
    // The source may fail before this effect runs, and some browsers never fire
    // a bubbling error, so check the element's own state too.
    const checkSource = () => {
      if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail();
    };
    checkSource();
    const sourceTimer = setTimeout(checkSource, 1500);

    video.addEventListener("ended", settle);

    // Only when playback never got going — blocked autoplay, a missing file, no
    // H.264 — does the link appear without an "ended". Otherwise a visitor whose
    // video cannot play is stuck in a sphere with no way out.
    const fallbackTimer = setTimeout(() => {
      if (video.paused || video.error || video.currentTime === 0) settle();
    }, NEVER_STARTED_MS);

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
      clearTimeout(fallbackTimer);
      trigger.kill();
      video.removeEventListener("error", fail);
      video.removeEventListener("ended", settle);
    };
  }, []);

  // The orb unfurls as the section scrolls in.
  useEffect(() => {
    if (!orbRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(orbRef.current, { opacity: 1, scale: 1 });
      return undefined;
    }

    const tween = gsap.fromTo(
      orbRef.current,
      { opacity: 0, scale: 0.82 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: orbRef.current, start: "top 88%", once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
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

  // Types the link in once the footage has finished.
  useEffect(() => {
    if (!settled) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(CTA_TEXT);
      return undefined;
    }

    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(CTA_TEXT.slice(0, i));
      if (i >= CTA_TEXT.length) clearInterval(id);
    }, TYPE_MS);

    return () => clearInterval(id);
  }, [settled]);

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
      {/* Vision and services first: it follows the Work section directly, so the
          reader meets the positioning before the invitation to get in touch. */}
      <VisionServices />

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

      {/* Robot hand inside a sphere, stitched straight onto the cards above.
          A circular mask has to crop a 16:9 frame, so the footage is centred
          and the orb is sized as large as the viewport allows to keep as much
          of the reveal in frame as possible. */}
      <div className="orb-stage" ref={stageRef} data-settled={settled}>
        <div className="orb" ref={orbRef} style={{ opacity: 0 }}>
          <div className="orb-ring" aria-hidden="true" />

          <div className="orb-body">
            {videoFailed ? (
              <div className="orb-fallback" aria-hidden="true" />
            ) : (
              <video
                ref={videoRef}
                className="orb-video"
                src={VIDEO_SRC}
                autoPlay
                muted
                playsInline
                loop={false}
                preload="auto"
                aria-hidden="true"
              />
            )}

            <div className="orb-shade" aria-hidden="true" />
            <div className="orb-dim" aria-hidden="true" />
          </div>

          {/* Inside the orb, not the stage: the stage's padding is asymmetric,
              so centring against it put the link off the sphere's middle. */}
          <button
            type="button"
            className="orb-cta"
            data-cursor-target
            onClick={backToTop}
            aria-label="Click here to go back to home"
          >
            <span className="orb-cta-text" aria-hidden="true">
              {typed}
            </span>
            <span className="orb-cta-caret" aria-hidden="true" />
          </button>
        </div>
      </div>

      <CustomCursor />

    </>
  );
}
