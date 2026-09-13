/**
 * Museum backdrops for the accordion panels.
 *
 * Each panel layers a photograph over a procedural marble field. The photo IDs
 * are UNVERIFIED placeholders — this build has no network access to check them,
 * so swap them for real classical-statue photography before launch. The marble
 * underneath is generated from an SVG filter, so a panel whose photo 404s still
 * reads as carved stone rather than a flat colour.
 */

// sat=-100 renders the crop black-and-white at the CDN, and the tall crop keeps
// the close-up cinematic rather than showing the whole gallery around the piece.
const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=entropy&w=1400&h=2000&q=85&sat=-100`;

/** Fractal veining, tinted by the gradient it sits on. */
function veining(seed) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='560'>` +
    `<filter id='v'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.013 0.045' numOctaves='4' seed='${seed}'/>` +
    `<feColorMatrix type='saturate' values='0'/>` +
    `<feComponentTransfer><feFuncA type='linear' slope='0.55'/></feComponentTransfer>` +
    `</filter>` +
    `<rect width='100%' height='100%' filter='url(%23v)'/>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
}

/** Stacked background-image value: veining over a lit marble gradient. */
export function marbleBackdrop({ seed, from, mid, to }) {
  return [
    veining(seed),
    `radial-gradient(ellipse at 30% 18%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 55%)`,
    `linear-gradient(168deg, ${from} 0%, ${mid} 46%, ${to} 100%)`,
  ].join(", ");
}

/**
 * A background-image layer for the photograph. A layer whose URL fails to load
 * is simply skipped by the browser and the marble underneath shows through, so
 * the fallback costs no JavaScript and no error handling.
 */
const photoLayer = (id) => `url("${unsplash(id)}"), `;

export const STATUES = {
  contact: {
    statue: "Michelangelo's David",
    photoLayer: photoLayer("1568667256549-094345857637"),
    marble: marbleBackdrop({ seed: 7, from: "#f2f2f2", mid: "#c9c9c9", to: "#7e7e7e" }),
  },
  contribute: {
    statue: "Venus de Milo",
    photoLayer: photoLayer("1608248543803-ba4f8c70ae0b"),
    marble: marbleBackdrop({ seed: 19, from: "#f5f5f5", mid: "#cecece", to: "#848484" }),
  },
  connect: {
    statue: "Apollo Belvedere",
    photoLayer: photoLayer("1610414897281-1e3a1f4d4b9f"),
    marble: marbleBackdrop({ seed: 31, from: "#efefef", mid: "#c4c4c4", to: "#7a7a7a" }),
  },
};
