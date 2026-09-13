import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PANORAMA } from "./marble";

const VIDEO_SRC = "/assets/video/vision-pan.mp4";

// Dimmed at the edges of the pass, fully legible through the middle. The floor
// is what the copy reads at when the section is entering or leaving.
const FLOOR = 0.34;
// How sharply the lift ramps: 2.6 means full legibility across the middle ~38%
// of the pass rather than only at the exact centre.
const RAMP = 2.6;

// "Operational Vision & Mission" now lives in its own wave banner inside the
// Work section (index.html); this panoramic block carries the rest.
const BLOCKS = [
  {
    title: "Technical DNA + Services",
    body: "I build automated workflows and smart AI tools that optimize budgets, eliminate operational bottlenecks, and help engineering and finance teams grow together. Feel free to ask.",
  },
];

export default function VisionServices() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    // Reduced motion gets the legible end state outright rather than a value
    // that changes under them as they scroll.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--scroll-lift", "1");
      return undefined;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const distanceFromCentre = Math.abs(self.progress - 0.5) * RAMP;
        const lift = FLOOR + (1 - FLOOR) * Math.min(1, Math.max(0, 1 - distanceFromCentre));
        el.style.setProperty("--scroll-lift", lift.toFixed(3));
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section ref={sectionRef} className="vision" aria-label="Vision and services">
      {/* Marble stands in until the panoramic footage is added, and still shows
          at the video's edges on screens the footage cannot fill. */}
      <div className="vision-fallback" style={{ backgroundImage: PANORAMA }} aria-hidden="true" />

      <video
        className="vision-video"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div className="vision-scrim" aria-hidden="true" />

      <div className="vision-copy">
        {BLOCKS.map(({ title, body }) => (
          <div key={title} className="vision-block">
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
