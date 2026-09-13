import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";

const RING = 26; // resting diameter
const HALO = 74; // diameter over an interactive target

/**
 * A ring that trails the pointer and blooms into a white halo over anything
 * marked data-cursor-target.
 *
 * It mounts only for a real mouse: coarse pointers have no cursor to decorate,
 * and reduced-motion users have asked not to be chased around the screen. The
 * native cursor is hidden by a class this component adds itself, so if the
 * script never runs the pointer is simply normal rather than missing.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hot, setHot] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 450, damping: 34, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 450, damping: 34, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setEnabled(fine.matches && !calm.matches);
    decide();
    fine.addEventListener("change", decide);
    calm.addEventListener("change", decide);
    return () => {
      fine.removeEventListener("change", decide);
      calm.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setHot(Boolean(event.target.closest?.("[data-cursor-target]")));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return createPortal(
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[200] rounded-full border border-white/70 mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: hot ? HALO : RING,
        height: hot ? HALO : RING,
        opacity: visible ? 1 : 0,
        backgroundColor: hot ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0)",
        boxShadow: hot
          ? "0 0 38px 8px rgba(255,255,255,0.55)"
          : "0 0 0 0 rgba(255,255,255,0)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />,
    document.body
  );
}
