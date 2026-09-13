/**
 * Stylized chrome robotic hand, palm up — a stand-in drawn to match the
 * reference photo's look (banded chrome, deep shadows, cyan palm projection).
 *
 * To swap in a real render: drop an <img> into the same box in
 * ConnectExperience and keep these viewBox coordinates, since FINGERTIPS drives
 * both the camera framing and the fingerprint hotspots.
 */

// Fingertip anchors in viewBox space — one per action card.
export const FINGERTIPS = [
  { id: "contact", x: 196, y: 300 },
  { id: "contribute", x: 168, y: 372 },
  { id: "connect", x: 178, y: 444 },
];

// base -> joint -> joint -> tip, plus base/tip thickness
const FINGERS = [
  { pts: [[330, 306], [286, 300], [240, 297], [196, 300]], w: [34, 26] },
  { pts: [[334, 372], [284, 366], [228, 367], [168, 372]], w: [36, 27] },
  { pts: [[338, 430], [290, 428], [236, 434], [178, 444]], w: [34, 25] },
  { pts: [[344, 486], [306, 486], [262, 492], [214, 506]], w: [28, 20] },
];

function Finger({ pts, w, dim }) {
  const [wBase, wTip] = w;
  const segments = pts.slice(0, -1).map((p, i) => {
    const t0 = i / (pts.length - 1);
    const t1 = (i + 1) / (pts.length - 1);
    return {
      a: p,
      b: pts[i + 1],
      w0: wBase + (wTip - wBase) * t0,
      w1: wBase + (wTip - wBase) * t1,
    };
  });

  return (
    <g opacity={dim ? 0.45 : 1}>
      {segments.map((s, i) => {
        const width = (s.w0 + s.w1) / 2;
        const d = `M ${s.a[0]} ${s.a[1]} L ${s.b[0]} ${s.b[1]}`;
        return (
          <g key={i}>
            {/* underside shadow */}
            <path d={d} stroke="#0c0f13" strokeWidth={width} strokeLinecap="round" fill="none" transform="translate(0,4)" />
            {/* body */}
            <path d={d} stroke="url(#chrome)" strokeWidth={width} strokeLinecap="round" fill="none" />
            {/* top specular band */}
            <path
              d={d}
              stroke="url(#spec)"
              strokeWidth={width * 0.3}
              strokeLinecap="round"
              fill="none"
              transform={`translate(0,${-width * 0.24})`}
            />
            {/* dark contact edge */}
            <path
              d={d}
              stroke="#161a1f"
              strokeOpacity="0.85"
              strokeWidth={width * 0.14}
              strokeLinecap="round"
              fill="none"
              transform={`translate(0,${width * 0.3})`}
            />
          </g>
        );
      })}

      {/* knuckle joints between segments */}
      {pts.slice(1, -1).map((p, i) => {
        const r = (wBase + (wTip - wBase) * ((i + 1) / (pts.length - 1))) * 0.46;
        return (
          <g key={`j${i}`}>
            <circle cx={p[0]} cy={p[1]} r={r} fill="url(#joint)" />
            <circle cx={p[0]} cy={p[1]} r={r * 0.5} fill="#0e1115" />
            <circle cx={p[0]} cy={p[1] - r * 0.25} r={r * 0.22} fill="#e9eef4" opacity="0.65" />
          </g>
        );
      })}

      {/* fingertip pad — the fingerprint sits on this */}
      <ellipse
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        rx={wTip * 0.52}
        ry={wTip * 0.6}
        fill="url(#pad)"
      />
    </g>
  );
}

export default function RoboticHand({ activeIndex = -1 }) {
  return (
    <svg viewBox="0 0 900 620" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        {/* banded chrome: dark / bright / dark reads far more metallic than a linear ramp */}
        <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c646e" />
          <stop offset="18%" stopColor="#eef2f7" />
          <stop offset="34%" stopColor="#98a1ac" />
          <stop offset="52%" stopColor="#333940" />
          <stop offset="70%" stopColor="#b9c2cc" />
          <stop offset="86%" stopColor="#666e79" />
          <stop offset="100%" stopColor="#1a1e23" />
        </linearGradient>
        <linearGradient id="spec" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="palmGrad" x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#aeb7c2" />
          <stop offset="30%" stopColor="#767f8a" />
          <stop offset="62%" stopColor="#2b3037" />
          <stop offset="100%" stopColor="#12151a" />
        </linearGradient>
        <radialGradient id="joint">
          <stop offset="0%" stopColor="#dfe5ec" />
          <stop offset="62%" stopColor="#6d7681" />
          <stop offset="100%" stopColor="#191d22" />
        </radialGradient>
        <radialGradient id="pad">
          <stop offset="0%" stopColor="#c9d2dc" />
          <stop offset="75%" stopColor="#7b848f" />
          <stop offset="100%" stopColor="#3a4048" />
        </radialGradient>
        <radialGradient id="palmGlow">
          <stop offset="0%" stopColor="#7fe6ff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#7fe6ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="forearm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7d8792" />
          <stop offset="22%" stopColor="#dde3ea" />
          <stop offset="46%" stopColor="#59616b" />
          <stop offset="74%" stopColor="#9aa3ae" />
          <stop offset="100%" stopColor="#14181c" />
        </linearGradient>
      </defs>

      {/* forearm */}
      <path d="M 626 336 Q 764 306 900 274 L 900 468 Q 764 444 626 428 Z" fill="url(#forearm)" />
      {[350, 372, 398].map((y, i) => (
        <path
          key={y}
          d={`M 660 ${y} Q 780 ${y - 18} 900 ${y - 36}`}
          stroke="#0d1014"
          strokeOpacity={0.5 - i * 0.1}
          strokeWidth="3"
          fill="none"
        />
      ))}

      {/* wrist actuator */}
      <circle cx="640" cy="388" r="56" fill="url(#joint)" />
      <circle cx="640" cy="388" r="34" fill="#0f1216" />
      <circle cx="640" cy="388" r="16" fill="url(#chrome)" />
      <circle cx="640" cy="366" r="6" fill="#eef3f8" opacity="0.7" />

      {/* palm — angular plate rather than a blob */}
      <path
        d="M 330 300 L 372 282 Q 470 262 556 292 Q 626 322 628 392 Q 626 466 552 502 Q 452 536 372 506 L 336 484 Q 300 392 330 300 Z"
        fill="url(#palmGrad)"
      />
      {/* palm panel lines */}
      <path d="M 372 282 Q 396 392 372 506" stroke="#0b0e12" strokeOpacity="0.7" strokeWidth="3" fill="none" />
      <path d="M 556 292 Q 584 392 552 502" stroke="#0b0e12" strokeOpacity="0.55" strokeWidth="3" fill="none" />
      <path d="M 348 306 Q 330 392 352 480" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="7" fill="none" />

      {/* palm projector */}
      <circle cx="470" cy="392" r="92" fill="url(#palmGlow)" />
      {[34, 56, 78].map((r, i) => (
        <circle
          key={r}
          cx="470"
          cy="392"
          r={r}
          fill="none"
          stroke="#8ceaff"
          strokeOpacity={0.55 - i * 0.13}
          strokeWidth="1.5"
          strokeDasharray={i === 1 ? "6 10" : undefined}
        />
      ))}
      <circle cx="470" cy="392" r="9" fill="#8ceaff" opacity="0.55" />

      {/* thumb — rises from the palm's upper edge, clear of the index finger */}
      <Finger pts={[[402, 330], [366, 286], [332, 254], [300, 232]]} w={[36, 26]} dim={activeIndex >= 0} />

      {/* fingers */}
      {FINGERS.map((f, i) => (
        <Finger key={i} pts={f.pts} w={f.w} dim={activeIndex >= 0 && activeIndex !== i} />
      ))}
    </svg>
  );
}
