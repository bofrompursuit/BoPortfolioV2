import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactCard, ContributeCard, ConnectCard } from "./cards";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_SRC = "/assets/video/hand-reveal.mp4";

// The cards are revealed once the video reaches this fraction of its duration,
// so the reveal lands with the render rather than waiting for the last frame.
const REVEAL_AT_FRACTION = 0.72;
// The cards must never depend on playback succeeding: blocked autoplay, a
// missing file or a browser without H.264 all fall back to this.
const REVEAL_FALLBACK_MS = 4000;

const CARDS = [
  {
    id: "contact",
    label: "Contact",
    blurb: "Start a conversation.",
    Card: ContactCard,
  },
  {
    id: "contribute",
    label: "Contribute",
    blurb: "Back the work.",
    Card: ContributeCard,
  },
  {
    id: "connect",
    label: "Connect",
    blurb: "Find me elsewhere.",
    Card: ConnectCard,
  },
];

export default function ConnectSection() {
  const videoRef = useRef(null);
  const cardsRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Playback: start when the stage scrolls into view, pause when it leaves.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

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
    const panels = cardsRef.current.querySelectorAll("[data-holo-card]");

    gsap.to(panels, {
      opacity: 1,
      y: 0,
      duration: reduce ? 0 : 0.9,
      stagger: reduce ? 0 : 0.14,
      ease: "power3.out",
      overwrite: true,
    });
  }, [revealed]);

  return (
    <>
      <div className="px-[clamp(20px,5vw,56px)] pt-[clamp(72px,12vh,140px)]">
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Contact &amp; Connect
        </h2>
        <p className="mt-3 max-w-2xl text-white/55">
          Three ways to reach me — start a project, back the work, or follow along.
        </p>
      </div>

      {/* Video stage */}
      <div className="relative mt-10 overflow-hidden">
        <video
          ref={videoRef}
          className="h-[min(46vh,420px)] w-full object-cover sm:h-[min(70vh,620px)]"
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

        {/* Scrim so the section below reads as one continuous surface */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/70 via-transparent to-[#0a0a0c]" />
      </div>

      {/* Holographic action cards */}
      <div
        ref={cardsRef}
        className="grid gap-6 px-[clamp(20px,5vw,56px)] pb-[clamp(72px,12vh,140px)] pt-[clamp(24px,5vh,56px)] md:grid-cols-3"
      >
        {CARDS.map(({ id, label, blurb, Card }) => (
          <HoloCard key={id} label={label} blurb={blurb}>
            <Card idPrefix={`connect-${id}`} />
          </HoloCard>
        ))}
      </div>
    </>
  );
}

function HoloCard({ label, blurb, children }) {
  return (
    <div
      data-holo-card
      style={{ opacity: 0, transform: "translateY(28px)" }}
      className="relative rounded-2xl bg-gradient-to-b from-cyan-300/60 via-cyan-400/15 to-fuchsia-400/35 p-px shadow-[0_0_50px_-18px_rgba(34,211,238,0.75)]"
    >
      <div className="relative h-full overflow-hidden rounded-2xl bg-[#05080c] p-6">
        <div className="mb-6 text-center">
          <p className="text-xl font-bold uppercase tracking-[0.16em] text-white sm:text-2xl">
            {label}
          </p>
          <p className="mt-2 text-sm text-white/55">{blurb}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
