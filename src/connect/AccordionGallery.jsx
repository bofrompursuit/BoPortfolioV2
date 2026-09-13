import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 300, damping: 30 };
const STACK_EASE = { duration: 0.45, ease: [0.22, 1, 0.36, 1] };
// Colour snaps in rather than easing, so the panel reads as "lit" the moment
// the pointer lands on it.
const TINT = { duration: 0.22, ease: "easeOut" };

const COLLAPSED_STRIP = 76; // px of visible spine on a closed desktop panel
const COLLAPSED_ROW = 88; // px of visible header on a closed mobile row

function useIsDesktop() {
  const query = "(min-width: 768px)";
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (event) => setIsDesktop(event.matches);
    mq.addEventListener("change", onChange);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export default function AccordionGallery({ panels }) {
  // One panel is open from the start: three grey spines with no content would
  // leave the section looking empty to anyone who never hovers, and gives a
  // touch visitor nothing to read before they tap.
  const [active, setActive] = useState(0);
  // Once a field inside a panel has focus the gallery latches open. Without
  // this, the pointer drifting over a neighbour collapses the form mid-sentence.
  const locked = useRef(false);
  const isDesktop = useIsDesktop();
  const reduce = useReducedMotion();

  const onHover = (index) => {
    if (isDesktop && !locked.current) setActive(index);
  };

  return (
    <div
      className={
        isDesktop
          ? "flex h-[min(78vh,640px)] gap-3"
          : "flex flex-col gap-3"
      }
    >
      {panels.map((panel, index) => {
        const isActive = index === active;
        const { id, label, blurb, statue, Card } = panel;

        return (
          <motion.section
            key={id}
            aria-label={label}
            onMouseEnter={() => onHover(index)}
            onFocus={() => {
              setActive(index);
              locked.current = true;
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                locked.current = false;
              }
            }}
            animate={
              isDesktop
                ? { flexGrow: isActive ? 6 : 1 }
                : { height: isActive ? "auto" : COLLAPSED_ROW }
            }
            transition={reduce ? { duration: 0 } : isDesktop ? SPRING : STACK_EASE}
            style={isDesktop ? { flexBasis: 0, minWidth: COLLAPSED_STRIP } : undefined}
            className="relative overflow-hidden rounded-2xl ring-1 ring-white/10 ring-inset"
          >
            {/* Museum backdrop: photograph over procedural marble. */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `${statue.photoLayer}${statue.marble}` }}
              animate={{
                filter: isActive ? "grayscale(0%) brightness(1)" : "grayscale(100%) brightness(0.8)",
              }}
              transition={reduce ? { duration: 0 } : TINT}
            />

            {/* Closed spine: the only thing showing when the panel is collapsed. */}
            <motion.button
              type="button"
              data-cursor-target
              aria-expanded={isActive}
              onClick={() => setActive(index)}
              animate={{ opacity: isActive ? 0 : 1 }}
              transition={reduce ? { duration: 0 } : TINT}
              style={{ pointerEvents: isActive ? "none" : "auto" }}
              className={
                isDesktop
                  ? "absolute inset-0 flex items-center justify-center bg-black/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  : "absolute inset-x-0 top-0 flex h-[88px] items-center justify-between gap-3 bg-black/45 px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              }
            >
              <span
                className="font-serif text-lg font-semibold uppercase tracking-[0.32em] text-white drop-shadow-md sm:text-xl"
                style={
                  isDesktop
                    ? { writingMode: "vertical-rl", transform: "rotate(180deg)" }
                    : undefined
                }
              >
                {label}
              </span>
              {!isDesktop && (
                <span aria-hidden="true" className="shrink-0 text-2xl font-light text-white/70">
                  +
                </span>
              )}
            </motion.button>

            {/* Open panel: glassmorphic sheet over the now-colour backdrop. */}
            <motion.div
              animate={{ opacity: isActive ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : TINT}
              style={{ pointerEvents: isActive ? "auto" : "none" }}
              // Collapsed panels are taken out of the tab order entirely, so a
              // keyboard visitor never lands inside a form they cannot see.
              inert={!isActive}
              aria-hidden={isActive ? undefined : "true"}
              className="relative h-full overflow-y-auto border border-white/20 bg-black/60 p-6 shadow-2xl backdrop-blur-md sm:p-8"
            >
              <header className="mb-6">
                <h3 className="font-serif text-2xl font-bold uppercase tracking-[0.18em] text-white drop-shadow-md sm:text-3xl">
                  {label}
                </h3>
                <p className="mt-2 font-serif text-base text-white/80">{blurb}</p>
              </header>

              <div className="mx-auto w-full max-w-md">
                <Card idPrefix={`connect-${id}`} />
              </div>
            </motion.div>
          </motion.section>
        );
      })}
    </div>
  );
}
