import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import ShowcaseImage from "./ShowcaseImage";

const SPEED = 42; // px per second

export default function CategoryRow({ category, onOpen }) {
  const trackRef = useRef(null);
  const paused = useRef(false);
  const x = useMotionValue(0);
  const [halfWidth, setHalfWidth] = useState(0);
  const reduceMotion = useReducedMotion();

  // The track renders the item list twice, so wrapping at half its width loops seamlessly.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => setHalfWidth(track.scrollWidth / 2);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || paused.current || !halfWidth) return;

    const direction = category.direction === "ltr" ? 1 : -1;
    let next = x.get() + (delta / 1000) * SPEED * direction;

    if (next <= -halfWidth) next += halfWidth;
    if (next >= 0) next -= halfWidth;

    x.set(next);
  });

  const cards = [...category.items, ...category.items];

  return (
    <div className="py-6 sm:py-8">
      <div className="px-[clamp(20px,5vw,56px)]">
        <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {category.title}
        </h3>
        <p className="mt-1 text-sm text-white/50">{category.subtitle}</p>
      </div>

      <div
        className="mt-4 overflow-hidden sm:mt-5"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        <motion.div ref={trackRef} className="flex w-max gap-5 px-[clamp(20px,5vw,56px)]" style={{ x }}>
          {cards.map((item, i) => (
            <motion.button
              key={`${item.url}-${i}`}
              onClick={() => onOpen(i % category.items.length)}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              aria-label={`Open ${item.title} in the ${category.title} showcase`}
              className="group relative w-[280px] shrink-0 overflow-hidden rounded-2xl text-left ring-1 ring-white/10 ring-inset sm:w-[320px]"
            >
              {/* Full-bleed media: no padding, no panel, nothing to letterbox. */}
              <span className="relative block aspect-[4/5] w-full overflow-hidden">
                <ShowcaseImage
                  src={item.image}
                  gradient={item.gradient}
                  alt={item.title}
                  className="transition-transform duration-700 group-hover:scale-105"
                />

                {/* Scrim: keeps white copy legible over any photograph. The midpoint
                    sits at 65% so the dark end actually covers the text band below. */}
                <span className="pointer-events-none absolute inset-0 block bg-gradient-to-t from-black/85 via-black/40 via-65% to-transparent" />

                <span className="absolute bottom-0 left-0 block w-full p-4">
                  <span className="block text-base font-semibold text-white drop-shadow-md">
                    {item.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-white/85 drop-shadow-md">
                    {item.detail}
                  </span>
                  <span className="mt-2.5 block truncate text-xs text-white/65 drop-shadow-md">
                    {new URL(item.url).host}
                  </span>
                </span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
