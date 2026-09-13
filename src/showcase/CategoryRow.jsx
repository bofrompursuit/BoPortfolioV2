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
              className="group w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left sm:w-[320px]"
            >
              <span className="relative block aspect-[16/10] overflow-hidden">
                <ShowcaseImage
                  src={item.image}
                  gradient={item.gradient}
                  alt={item.title}
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </span>

              <span className="block p-5">
                <span className="block text-base font-medium text-white">{item.title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-white/55">
                  {item.detail}
                </span>
                <span className="mt-4 block truncate text-xs text-white/35">
                  {new URL(item.url).host}
                </span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
