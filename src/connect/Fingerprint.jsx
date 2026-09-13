import { useMemo } from "react";

/**
 * Procedural fingerprint whorl: concentric rings perturbed by a couple of sine
 * terms so the ridges read as a print rather than a target. Ridges draw on with
 * stroke-dashoffset as the camera zooms in.
 */
function ridgePath(radius, seed, squash) {
  const points = [];
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 36) {
    const wobble =
      Math.sin(a * 3 + seed) * radius * 0.035 +
      Math.sin(a * 5 - seed * 1.7) * radius * 0.018;
    const r = radius + wobble;
    points.push([Math.cos(a) * r, Math.sin(a) * r * squash]);
  }
  return `M ${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L ")} Z`;
}

export default function Fingerprint({ progress = 0, color = "#8ceaff" }) {
  const ridges = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        d: ridgePath(5 + i * 5.0, i * 1.31, 1.2),
        delay: i * 0.05,
      })),
    []
  );

  return (
    <svg viewBox="-60 -70 120 140" className="h-full w-full" aria-hidden="true">
      <g>
        {/* Plain <path>: framer-motion's motion.path takes over pathLength and
            would overwrite the dash offsets that draw the ridges on. */}
        {ridges.map((ridge, i) => (
          <path
            key={i}
            d={ridge.d}
            fill="none"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={Math.max(0, 1 - Math.max(0, progress - ridge.delay) * 1.8)}
            opacity={0.4 + progress * 0.6}
          />
        ))}
        {/* core */}
        <ellipse
          cx="0"
          cy="0"
          rx="4"
          ry="5"
          fill="none"
          stroke={color}
          strokeWidth="1.2"
          opacity={progress}
        />
      </g>
    </svg>
  );
}
