import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTextDissolve } from "../textDissolve.js";
import RoboticHand, { FINGERTIPS } from "./RoboticHand";
import Fingerprint from "./Fingerprint";
import { ContactCard, ContributeCard, ConnectCard } from "./cards";

gsap.registerPlugin(ScrollTrigger);

const VIEWBOX = { w: 900, h: 620 };

const STATIONS = [
  {
    id: "contact",
    label: "Contact",
    blurb: "Start a conversation.",
    range: [0.36, 0.58],
    Card: ContactCard,
  },
  {
    id: "contribute",
    label: "Contribute",
    blurb: "Back the work.",
    range: [0.58, 0.78],
    Card: ContributeCard,
  },
  {
    id: "connect",
    label: "Connect",
    blurb: "Find me elsewhere.",
    range: [0.78, 1],
    Card: ConnectCard,
  },
];

const HOLO_IN = [0.08, 0.2]; // card projects from the palm
const HOLO_OUT = [0.2, 0.34]; // and then disintegrates

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
const remap = (v, [a, b]) => clamp01((v - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Camera framing per station: how far to zoom, and where to park the fingertip. */
function cameraFor(progress, isNarrow) {
  const shiftX = isNarrow ? 0 : -0.16;
  const shiftY = isNarrow ? -0.18 : 0;

  // Wide establishing shot until the first station begins.
  const start = { scale: 1, fx: 0.5, fy: 0.5, rotate: 0, shiftX: 0, shiftY: 0 };

  let from = start;
  let to = start;
  let t = 0;

  if (progress < STATIONS[0].range[0]) {
    t = 0;
  } else {
    for (let i = 0; i < STATIONS.length; i += 1) {
      const [a, b] = STATIONS[i].range;
      const tip = FINGERTIPS[i];
      const target = {
        scale: 3.1,
        fx: tip.x / VIEWBOX.w,
        fy: tip.y / VIEWBOX.h,
        rotate: (i - 1) * 2.5, // slight orbit swing between fingers
        shiftX,
        shiftY,
      };

      if (progress >= a && progress <= b) {
        const prevTip = FINGERTIPS[i - 1];
        from =
          i === 0
            ? start
            : {
                scale: 3.1,
                fx: prevTip.x / VIEWBOX.w,
                fy: prevTip.y / VIEWBOX.h,
                rotate: (i - 2) * 2.5,
                shiftX,
                shiftY,
              };
        to = target;
        // Move during the first 45% of a station, then hold steady to read.
        t = easeInOut(remap(progress, [a, lerp(a, b, 0.45)]));
        break;
      }

      if (progress > b) {
        from = target;
        to = target;
        t = 1;
      }
    }
  }

  const scale = lerp(from.scale, to.scale, t);
  const fx = lerp(from.fx, to.fx, t);
  const fy = lerp(from.fy, to.fy, t);
  const rotate = lerp(from.rotate, to.rotate, t);
  const sx = lerp(from.shiftX, to.shiftX, t);
  const sy = lerp(from.shiftY, to.shiftY, t);

  return {
    scale,
    rotate,
    x: (-scale * (fx - 0.5) + sx) * 100,
    y: (-scale * (fy - 0.5) + sy) * 100,
  };
}

export default function ConnectExperience() {
  const wrapperRef = useRef(null);
  const holoTextRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduceMotion) return undefined;

    const dissolve = createTextDissolve([holoTextRef.current], { trackScroll: false });

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setProgress(self.progress);
        dissolve.update(remap(self.progress, HOLO_OUT));
      },
    });

    return () => {
      trigger.kill();
      dissolve.destroy();
    };
  }, [reduceMotion]);

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 860;
  const camera = reduceMotion ? { scale: 1, rotate: 0, x: 0, y: 0 } : cameraFor(progress, isNarrow);
  const activeIndex = STATIONS.findIndex(
    (s) => progress >= s.range[0] && progress <= s.range[1]
  );

  const holoIn = remap(progress, HOLO_IN);
  const holoGone = remap(progress, HOLO_OUT);

  const jumpToStation = (i) => {
    const el = wrapperRef.current;
    if (!el) return;
    const [a, b] = STATIONS[i].range;
    const mid = lerp(a, b, 0.65);
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * mid;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      <div className="px-[clamp(20px,5vw,56px)] pt-[clamp(72px,12vh,140px)]">
        <h2 className="text-[clamp(1.8rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
          Contact &amp; Connect
        </h2>
        <p className="mt-3 max-w-2xl text-white/50">
          Follow the hand. Each fingerprint opens a different way to reach me.
        </p>
      </div>

      {/* Cinematic: sticky stage driven by the scroll distance of the wrapper */}
      <div ref={wrapperRef} className="relative" style={{ height: reduceMotion ? "auto" : "460vh" }}>
        <div
          className={`${reduceMotion ? "relative" : "sticky top-0"} flex h-screen items-center justify-center overflow-hidden`}
        >
          {/* hand + camera */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{
                width: "118%",
                aspectRatio: `${VIEWBOX.w} / ${VIEWBOX.h}`,
                transform: `translate(${camera.x}%, ${camera.y}%) scale(${camera.scale}) rotate(${camera.rotate}deg)`,
                transformOrigin: "center center",
                willChange: "transform",
              }}
            >
              <RoboticHand activeIndex={reduceMotion ? -1 : activeIndex} />

              {/* fingerprints sit in the same coordinate space as the hand */}
              {FINGERTIPS.map((tip, i) => {
                const station = STATIONS[i];
                const reveal = reduceMotion ? 1 : remap(progress, [station.range[0], lerp(...station.range, 0.5)]);
                return (
                  <div
                    key={tip.id}
                    className="absolute"
                    style={{
                      left: `${(tip.x / VIEWBOX.w) * 100}%`,
                      top: `${(tip.y / VIEWBOX.h) * 100}%`,
                      width: "3.6%",
                      transform: "translate(-50%, -50%)",
                      opacity: reveal,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => jumpToStation(i)}
                      aria-label={`Jump to ${station.label}`}
                      className="block w-full cursor-pointer"
                      style={{ aspectRatio: "120 / 140" }}
                    >
                      <Fingerprint progress={reveal} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holographic "Keep on scrolling." card projected from the palm */}
          {!reduceMotion && (
            <div
              className="pointer-events-none absolute left-1/2 top-[11%] z-10 -translate-x-1/2"
              style={{
                opacity: holoIn * (1 - holoGone),
                transform: `translate(-50%, ${lerp(28, 0, holoIn)}px) scale(${lerp(0.9, 1, holoIn)})`,
              }}
            >
              <div className="relative px-10 py-5">
                <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-cyan-300/70" />
                <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-cyan-300/70" />
                <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-cyan-300/70" />
                <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-cyan-300/70" />
                <div className="absolute inset-0 rounded-sm border border-cyan-300/20 bg-cyan-300/5 backdrop-blur-[2px]" />
                <p
                  ref={holoTextRef}
                  className="relative text-[clamp(1.1rem,2.6vw,1.9rem)] font-medium tracking-tight text-cyan-50"
                >
                  Keep on scrolling.
                </p>
              </div>
            </div>
          )}

          {/* Active action card */}
          {!reduceMotion &&
            STATIONS.map((station, i) => {
              const t = remap(progress, [lerp(...station.range, 0.28), lerp(...station.range, 0.52)]);
              const out = remap(progress, [lerp(...station.range, 0.92), station.range[1]]);
              const visible = progress >= station.range[0] && progress <= station.range[1] + 0.02;
              if (!visible) return null;

              return (
                <div
                  key={station.id}
                  className="absolute z-20 w-[min(92vw,380px)] max-[860px]:bottom-8 max-[860px]:left-1/2 max-[860px]:-translate-x-1/2 min-[861px]:right-[6vw] min-[861px]:top-1/2 min-[861px]:-translate-y-1/2"
                  style={{ opacity: t * (1 - out * 0.85) }}
                >
                  <HoloPanel label={station.label} blurb={station.blurb} enter={t}>
                    <station.Card idPrefix={`stage-${station.id}`} />
                  </HoloPanel>
                </div>
              );
            })}
        </div>
      </div>

      {/* Always-available copies, so nothing is trapped behind the animation */}
      <div className="px-[clamp(20px,5vw,56px)] pb-[clamp(72px,12vh,140px)] pt-[clamp(32px,6vh,64px)]">
        <p className="mb-6 text-[0.7rem] uppercase tracking-[0.2em] text-white/35">
          All channels
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {STATIONS.map((station) => (
            <HoloPanel key={station.id} label={station.label} blurb={station.blurb} enter={1}>
              <station.Card idPrefix={`all-${station.id}`} />
            </HoloPanel>
          ))}
        </div>
      </div>
    </>
  );
}

function HoloPanel({ label, blurb, enter = 1, children }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#05080c]/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-xl"
      style={{ transform: `translateY(${(1 - enter) * 18}px)` }}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="mb-4">
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-cyan-200/80">{label}</p>
        <p className="mt-1 text-sm text-white/45">{blurb}</p>
      </div>
      {children}
    </div>
  );
}
