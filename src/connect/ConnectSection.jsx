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

// The cards are revealed once the video reaches this fraction of its duration,
// so the reveal lands with the render rather than waiting for the last frame.
const REVEAL_AT_FRACTION = 0.72;
// The cards must never depend on playback succeeding: blocked autoplay, a
// missing file or a browser without H.264 all fall back to this.
const REVEAL_FALLBACK_MS = 4000;

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

export default function ConnectSection() {
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const scrimRef = useRef(null);
  const cardsRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Playback: start when the stage scrolls into view, pause when it leaves.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    // Decorative footage: its audio track must never play.
    video.muted = true;
    video.volume = 0;

    const reveal = () => setRevealed(true);
    const fail = () => {
      setVideoFailed(true);
      reveal();
    };

    video.addEventListener("error", fail);
    // The source may fail before this effect runs, and some browsers never fire
    // a bubbling error, so check the element's own state too.
    const checkSource = () => {
      if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) fail();
    };
    checkSource();
    const sourceTimer = setTimeout(checkSource, 1500);

    const onTime = () => {
      if (video.duration && video.currentTime >= video.duration * REVEAL_AT_FRACTION) reveal();
    };
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", reveal);

    // Whatever happens to the video, the cards show up.
    const fallbackTimer = setTimeout(reveal, REVEAL_FALLBACK_MS);

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
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", reveal);
    };
  }, []);

  // The stage darkens as it scrolls away, the way the hero does.
  useEffect(() => {
    if (!stageRef.current || !scrimRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const tween = gsap.to(scrimRef.current, {
      opacity: 0.88,
      ease: "none",
      scrollTrigger: {
        trigger: stageRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

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
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Contact
        </h2>
        <p className="mt-3 max-w-2xl text-white/55">
          Three ways to reach me &mdash; start a project, back the work, or follow along.
        </p>
      </div>

      {/* Accordion gallery */}
      <div
        ref={cardsRef}
        style={{ opacity: 0, transform: "translateY(28px)" }}
        className="px-[clamp(20px,5vw,56px)] pb-[clamp(40px,6vh,72px)] pt-[clamp(20px,3vh,36px)]"
      >
        <AccordionGallery panels={PANELS} />
      </div>

      {/* Immersive video stage: a full-viewport panel like the hero, edge to
          edge, that darkens as it scrolls away.

          object-contain, not cover. The footage is 16:9 and a phone held
          upright is not, so filling the viewport would mean cropping the
          holographic card off again — the exact complaint this replaced. The
          frame is shown whole on black instead, which letterboxes on portrait
          screens and is the deliberate trade for never cropping or stretching. */}
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden bg-black"
        // Full viewport wherever the frame can actually fill it — desktop,
        // tablet, any landscape screen. On a portrait phone a 16:9 frame shown
        // whole can only ever occupy about a quarter of the height, so the
        // stage shrinks to the frame plus breathing room instead of pinning to
        // 100svh and leaving three quarters of the screen black.
        style={{ height: "min(100svh, calc(100vw * 9 / 16 + 25svh))" }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          src={VIDEO_SRC}
          autoPlay
          muted
          playsInline
          loop={false}
          preload="auto"
          aria-hidden="true"
        />

        {/* Gradient stand-in, shown only if the video cannot play */}
        {videoFailed && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#16283a,#0a0a0c_70%)]" />
        )}

        {/* Scrubbed by scroll position, so the stage dims as it leaves */}
        <div
          ref={scrimRef}
          className="pointer-events-none absolute inset-0 bg-[#0a0a0c]"
          style={{ opacity: 0 }}
        />

        {/* Hands off to the section below as one continuous surface */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#0a0a0c]" />
      </div>

      <CustomCursor />

    </>
  );
}
