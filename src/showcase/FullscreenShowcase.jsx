import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import ShowcaseImage from "./ShowcaseImage";

const EASE = [0.65, 0, 0.35, 1];
const TRANSITION = { duration: 1.5, ease: EASE };

/**
 * Thumbnail height drives every other proportion in the nav container, so it is
 * derived from the width the whole strip is allowed to occupy (80vw): padding
 * (0.15h each side) + gaps (0.15h) + the active thumb (1.3h) + the square ones.
 */
const thumbHeightFor = (width, count) => {
  const factor = 0.15 * 2 + 0.15 * (count - 1) + 1.3 + (count - 1);
  return Math.max(32, Math.floor(Math.min(104, (width * 0.78) / factor)));
};

function useThumbHeight(count) {
  const [height, setHeight] = useState(() => thumbHeightFor(window.innerWidth, count));

  useEffect(() => {
    const onResize = () => setHeight(thumbHeightFor(window.innerWidth, count));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [count]);

  return height;
}

export default function FullscreenShowcase({ category, startIndex = 0, onClose }) {
  const items = category.items;
  const [index, setIndex] = useState(startIndex);
  const closeRef = useRef(null);
  const thumbHeight = useThumbHeight(items.length);

  const gap = thumbHeight * 0.15;
  const containerRadius = thumbHeight * 0.18;
  const thumbRadius = thumbHeight * 0.1;

  const go = useCallback(
    (delta) => setIndex((i) => (i + delta + items.length) % items.length),
    [items.length]
  );

  useEffect(() => {
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const active = items[index];

  // Portalled to body: the showcase section is its own stacking context, which
  // would otherwise trap this overlay beneath the fixed site header.
  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${category.title} showcase`}
      className="fixed inset-0 z-[100] h-screen w-screen overflow-hidden rounded-none bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Full-screen background, cross-faded in sync with the thumbnail strip */}
      <AnimatePresence initial={false}>
        <motion.div
          key={active.url}
          className="absolute inset-0 rounded-none"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={TRANSITION}
        >
          <ShowcaseImage
            src={active.image}
            gradient={active.gradient}
            alt=""
            className="rounded-none"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/70" />

      {/* Category title/subtitle + active project details, above the centered
          thumbnail strip. The category header sits in the lower-middle of the
          screen, directly above the project name, rather than pinned to the
          very top. */}
      <div
        className="absolute inset-x-0 z-10 px-5 text-center sm:px-8"
        style={{ top: `calc(50% - ${thumbHeight * 1.4}px)`, transform: "translateY(-100%)" }}
      >
        <div className="mx-auto mb-2 sm:mb-3">
          <p className="mx-auto text-[0.7rem] uppercase tracking-[0.2em] text-white/60">
            {category.title}
          </p>
          <p className="mx-auto mt-1 text-sm text-white/45">{category.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.url}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {active.title}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              {active.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating glassmorphism thumbnail navigation */}
      <div
        className="absolute left-1/2 top-1/2 z-10 flex max-w-[80vw] -translate-x-1/2 -translate-y-1/2 items-center border border-white/10 bg-white/10 backdrop-blur-xl"
        style={{
          gap: `${gap}px`,
          padding: `${gap}px`,
          borderRadius: `${containerRadius}px`,
        }}
      >
        {items.map((item, i) => {
          const isActive = i === index;
          return (
            <motion.button
              key={item.url}
              onClick={() => setIndex(i)}
              aria-label={`Show ${item.title}`}
              aria-current={isActive}
              className="relative shrink-0 overflow-hidden"
              style={{ height: `${thumbHeight}px`, borderRadius: `${thumbRadius}px` }}
              animate={{
                width: isActive ? thumbHeight * 1.3 : thumbHeight,
                opacity: isActive ? 1 : 0.55,
              }}
              transition={TRANSITION}
              whileHover={{ opacity: 1 }}
            >
              <ShowcaseImage src={item.image} gradient={item.gradient} alt={item.title} />
              {isActive && (
                <motion.span
                  layoutId="thumb-ring"
                  className="absolute inset-0 border-2 border-white/80"
                  style={{ borderRadius: `${thumbRadius}px` }}
                  transition={TRANSITION}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Visit link + arrows, below the centered strip */}
      <div
        className="absolute inset-x-0 z-10 flex flex-col items-center gap-5 px-5"
        style={{ top: `calc(50% + ${thumbHeight * 1.4}px)` }}
      >
        <a
          href={active.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/85"
        >
          Visit {active.title}
        </a>

        <div className="flex items-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Previous project"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            ←
          </button>
          <span className="text-xs tabular-nums text-white/60">
            {index + 1} / {items.length}
          </span>
          <button
            onClick={() => go(1)}
            aria-label="Next project"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            →
          </button>
        </div>

        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close showcase"
          className="rounded-full border border-white/15 bg-white/10 px-6 py-2.5 text-sm text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </motion.div>,
    document.body
  );
}
