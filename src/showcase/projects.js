/**
 * Card copy is inferred from project names — review and replace with the real
 * descriptions. Image IDs are Unsplash placeholders; each item also carries a
 * `gradient` used as a fallback layer if the remote image fails to load.
 */

const unsplash = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2000&q=80`;

export const categories = [
  {
    id: "b2b",
    title: "B2B Builds",
    subtitle: "Technical Solutions & AI Production Tools",
    direction: "ltr",
    detailLabel: "What it does",
    items: [
      {
        title: "AdCraft+",
        url: "https://adcraft-ai-studio-7225.bolt.host",
        category: "B2B Builds",
        image: unsplash("1550859492-d5da9d8e45f3"),
        gradient: "linear-gradient(135deg, #4c1d95, #0a0a0c 70%)",
        detail:
          "AI ad-creative studio for generating, iterating on and exporting campaign-ready ad variations.",
      },
      {
        title: "RAIVALRY",
        url: "https://rivalry-insight-engine.lovable.app/",
        category: "B2B Builds",
        image: unsplash("1451187580459-43490279c0fa"),
        gradient: "linear-gradient(135deg, #0f3460, #0a0a0c 70%)",
        detail:
          "Competitive-intelligence engine that benchmarks rival brands and surfaces positioning gaps.",
      },
      {
        title: "justif.AI",
        url: "https://viral-snare-18430086.figma.site",
        category: "B2B Builds",
        image: unsplash("1462331940025-496dfbfc7564"),
        gradient: "linear-gradient(135deg, #1e3a8a, #0a0a0c 70%)",
        detail:
          "Decision-support tool that assembles evidence-backed justifications for campaign spend.",
      },
      {
        title: "SOCIAL STUDIO",
        url: "https://canonical-store-production.weweb.io/",
        category: "B2B Builds",
        image: unsplash("1557682224-5b8590cd9ec5"),
        gradient: "linear-gradient(135deg, #831843, #0a0a0c 70%)",
        detail:
          "Centralized production and scheduling workspace for brand social content.",
      },
      {
        title: "Assetify",
        url: "https://serene-clad-90305952.figma.site",
        category: "B2B Builds",
        image: unsplash("1518709268805-4e9042af2176"),
        gradient: "linear-gradient(135deg, #164e63, #0a0a0c 70%)",
        detail:
          "Brand asset library that keeps approved creative organized, searchable and on-spec.",
      },
    ],
  },
  {
    id: "passion",
    title: "Passion Projects + Partners",
    subtitle: "Personal Apps, Digital Experiences & Side Projects",
    direction: "rtl",
    detailLabel: "Tools & skills",
    items: [
      {
        title: "Hypeman",
        url: "https://hypeman-lemon.vercel.app/",
        category: "Passion Projects + Partners",
        image: unsplash("1470071459604-3b5ec3a7fe05"),
        gradient: "linear-gradient(135deg, #365314, #0a0a0c 70%)",
        detail: "React · Vercel · Web Audio API · Motion design",
      },
      {
        title: "Jonnyverse",
        url: "https://jonnyverse.vercel.app/",
        category: "Passion Projects + Partners",
        image: unsplash("1534796636912-3b95b3ab5986"),
        gradient: "linear-gradient(135deg, #312e81, #0a0a0c 70%)",
        detail: "Next.js · Three.js · Interactive storytelling · Vercel",
      },
      {
        title: "Fire Island Bingo",
        url: "https://write-unify-73848034.figma.site",
        category: "Passion Projects + Partners",
        image: unsplash("1419242902214-272b3f66ee7a"),
        gradient: "linear-gradient(135deg, #7c2d12, #0a0a0c 70%)",
        detail: "Figma Sites · Game state logic · Responsive UI",
      },
      {
        title: "123 Savoree powered by Nimble",
        url: "https://123-savoree.vercel.app/",
        category: "Passion Projects + Partners",
        image: unsplash("1441974231531-c6227db76b6e"),
        gradient: "linear-gradient(135deg, #14532d, #0a0a0c 70%)",
        detail: "React · API integration · E-commerce UX · Vercel",
      },
      {
        title: "Soarin' Mom&Daddy",
        url: "https://bofrompursuit.github.io/Soar/",
        category: "Passion Projects + Partners",
        image: unsplash("1506744038136-46273834b3fb"),
        gradient: "linear-gradient(135deg, #0c4a6e, #0a0a0c 70%)",
        detail: "HTML · CSS · JavaScript · GitHub Pages · CSS animation",
      },
    ],
  },
  {
    id: "collabo",
    title: 'Bo in Colla"BO"ration',
    subtitle: "Featured Teamwork, Award-Winning builds & Joint Ventures",
    direction: "ltr",
    detailLabel: "Built with",
    items: [
      {
        title: "Fanzone: Unlocked",
        url: "https://unlocked-zeta.vercel.app/",
        category: 'Bo in Colla"BO"ration',
        image: unsplash("1465101162946-4377e57745c3"),
        gradient: "linear-gradient(135deg, #581c87, #0a0a0c 70%)",
        detail: "Vercel · React · Figma",
      },
      {
        title: "Meet me in time",
        url: "https://stony-import-17203635.figma.site",
        category: 'Bo in Colla"BO"ration',
        image: unsplash("1493246507139-91e8fad9978e"),
        gradient: "linear-gradient(135deg, #155e75, #0a0a0c 70%)",
        detail: "Figma Sites · Framer Motion",
      },
      {
        title: "Choose Your Adventure NYC",
        url: "https://wake-bush-18609568.figma.site",
        category: 'Bo in Colla"BO"ration',
        image: unsplash("1502134249126-9f3755a50d78"),
        gradient: "linear-gradient(135deg, #1e1b4b, #0a0a0c 70%)",
        detail: "Figma Sites · Mapbox · Branching narrative",
      },
      {
        title: "Last Onboarder",
        url: "https://lastonboarder.lovable.app",
        category: 'Bo in Colla"BO"ration',
        image: unsplash("1504639725590-34d0984388bd"),
        gradient: "linear-gradient(135deg, #9d174d, #0a0a0c 70%)",
        detail: "Lovable · Supabase · React",
      },
      {
        title: "Amplif/AI Block Party App",
        url: "https://envoy-groove-15308077.figma.site",
        category: 'Bo in Colla"BO"ration',
        image: unsplash("1492684223066-81342ee5ff30"),
        gradient: "linear-gradient(135deg, #b45309, #0a0a0c 70%)",
        detail: "Figma Sites · AI APIs · Event tooling",
      },
    ],
  },
];
