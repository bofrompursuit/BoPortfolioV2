import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ContactCard, ContributeCard, ConnectCard } from "./cards";
import AccordionGallery from "./AccordionGallery";
import CustomCursor from "./CustomCursor";
import { STATUES } from "./marble";

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
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Contact &amp; Connect
        </h2>
        <p className="mt-3 max-w-2xl text-white/55">
          Three ways to reach me — start a project, back the work, or follow along.
        </p>
      </div>

      {/* Video stage */}
      <div className="relative mt-6 overflow-hidden">
        <video
          ref={videoRef}
          className="h-[min(42vh,380px)] w-full bg-[#0a0a0c] object-contain sm:h-[min(60vh,540px)] lg:object-cover"
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

      {/* Positioning copy, in the same rhythm as every other section block */}
      <div className="grid gap-8 px-[clamp(20px,5vw,56px)] pt-[clamp(32px,5vh,56px)] md:grid-cols-2 md:gap-12">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Operational Vision &amp; Mission
          </h3>
          <p className="mt-3 max-w-prose text-white/60">
            Bo is a FinTech Solutions Architect and AI Product Engineer who loves bridging
            high-level finance with cutting-edge tech. Let&rsquo;s connect.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Technical DNA + Services
          </h3>
          <p className="mt-3 max-w-prose text-white/60">
            I build automated workflows and smart AI tools that optimize budgets, eliminate
            operational bottlenecks, and help engineering and finance teams grow together.
            Feel free to ask.
          </p>
        </div>
      </div>

      {/* Accordion gallery */}
      <div
        ref={cardsRef}
        style={{ opacity: 0, transform: "translateY(28px)" }}
        className="px-[clamp(20px,5vw,56px)] pb-[clamp(48px,7vh,88px)] pt-[clamp(20px,3vh,36px)]"
      >
        <AccordionGallery panels={PANELS} />
      </div>

      <CustomCursor />

    </>
  );
}
