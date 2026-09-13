/**
 * Museum backdrops for the accordion panels.
 *
 * Each panel layers a photograph over a procedural marble field. The photo IDs
 * are UNVERIFIED placeholders — this build has no network access to check them,
 * so swap them for real classical-statue photography before launch. The marble
 * underneath is generated from an SVG filter, so a panel whose photo 404s still
 * reads as carved stone rather than a flat colour.
 */

const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

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
    `radial-gradient(ellipse at 30% 18%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 55%)`,
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
    marble: marbleBackdrop({ seed: 7, from: "#f4f2ee", mid: "#cfcac1", to: "#8b857d" }),
  },
  contribute: {
    statue: "Venus de Milo",
    photoLayer: photoLayer("1608248543803-ba4f8c70ae0b"),
    marble: marbleBackdrop({ seed: 19, from: "#f6f3ef", mid: "#d4cec4", to: "#8f8880" }),
  },
  connect: {
    statue: "Apollo Belvedere",
    photoLayer: photoLayer("1610414897281-1e3a1f4d4b9f"),
    marble: marbleBackdrop({ seed: 31, from: "#f2f0ed", mid: "#cbc6bd", to: "#867f77" }),
  },
};
