/**
 * THE FOUR CAPABILITY DOMAINS — the C2 chapter's content (Phase 2).
 *
 * Each domain is one bold line in the narrative flow (CapabilityList) AND one icon SET the TechDNA
 * helix wears while that line is active: the current set drains off the bottom, the next pours in from
 * the top (the established flow-through language). One line active at a time; the list is a spine.
 *
 * The rung SHAPE is shared with TechDNA — a base pair of two related tools riding opposite strands.
 * The `Node` shape and its `T()` helper live HERE (moved from TechDNA) so the roster and the helix
 * that renders it read from one source; TechDNA imports the sets and dresses its shared node pool.
 */

// A logo node. `pad` = the mark's size as a fraction of its circular chip (default 0.58 via the CSS
// .tech-dna-v4__logo rule). Square / full-bleed marks read oversized inside the round chip, so they
// carry an explicit smaller fraction, written once as a static inline size on the <img>.
export type Node = { name: string; src: string; pad?: number };

// One base pair: [strand A, strand B] — two related tools sharing a rung.
export type CapabilityRung = readonly [Node, Node];

export type Capability = {
  id: string;
  line: string; // the bold list line (sentence case, no numbering, no eyebrow)
  sub: string; // the muted sub-caption — the active line's voice, not permanent furniture
  rungs: CapabilityRung[];
};

// `pad` overrides for square / full-bleed marks (they'd read oversized in the round chip otherwise).
// Same logic the Phase-1 RUNGS table used (JS/TS/SQL/Docker) extended to the new square marks
// (Kubernetes, Streamlit — both full-bleed logos).
const T = (name: string, file: string, pad?: number): Node => ({
  name,
  src: `/tech_logos/${file}`,
  ...(pad !== undefined ? { pad } : {}),
});

// Reused node singletons so a mark that recurs across rungs/sets is literally the same object (and the
// DISGUISED-REPEAT rule below is checked against identity, not a re-typed string).
const REACT = T("React", "REACT.svg");
const NEXT = T("Next.js", "NEXTJS.svg");
const TS = T("TypeScript", "TYPESCRIPT.svg", 0.5);
const JS = T("JavaScript", "JAVASCRIPT.svg", 0.5);
const NODE = T("Node.js", "NODE.svg");
const EXPRESS = T("Express", "EXPRESS.svg");
const PYTHON = T("Python", "PYTHON.svg");
const DJANGO = T("Django", "DJANGO.svg");
const HTML = T("HTML", "HTML.svg");
const CSS = T("CSS", "CSS.svg");
const TAILWIND = T("Tailwind", "TAILWIND.svg");
const SASS = T("Sass", "SASS.svg");
const MONGODB = T("MongoDB", "MONGODB.svg");
const SQL = T("SQL", "SQL.svg", 0.5);
const FIREBASE = T("Firebase", "FIREBASE.svg");
const FIRESTORE = T("Firestore", "FIRESTORE.svg");
const DOCKER = T("Docker", "docker.png", 0.5);
const KUBERNETES = T("Kubernetes", "kubernetes.png", 0.5);
const OPENAI = T("OpenAI", "OPENAI.svg");
const CHROMA = T("ChromaDB", "chroma.png");
const NEDB = T("NeDB", "NEDB.svg");
const LLAMA = T("LLaMA", "ILLAMA.svg");
const GROQ = T("Groq", "GROQ.svg");
const DEEPSEEK = T("DeepSeek", "DEEPSEEK.svg");
const STREAMLIT = T("Streamlit", "streamlit.png", 0.5);
const FIGMA = T("Figma", "FIGMA.svg");
const ILLUSTRATOR = T("Illustrator", "ILLUSTRATOR.svg");
const GSAP = T("GSAP", "GSAP.svg");
const FRAMER = T("Framer", "Framer.svg");
const GITHUB = T("GitHub", "GITHUB.svg");

/* DISGUISED-REPEAT rule (AI & LLM Systems, Product Design & Motion): a domain with a small tool roster
 * would leave the helix half-empty, so a mark may repeat within a set ONLY when it reappears ≥3 rungs
 * after its first seat, PAIRED WITH A DIFFERENT PARTNER, on the OPPOSITE strand — so the eye reads a
 * fuller helix, never the same pair twice. Marked inline below. */

export const capabilities: Capability[] = [
  {
    id: "full-stack",
    line: "Full-Stack Engineering",
    sub: "Interfaces, APIs, and data — shipped end to end.",
    rungs: [
      [REACT, NEXT],
      [TS, JS],
      [NODE, EXPRESS],
      [PYTHON, DJANGO],
      [HTML, CSS],
      [TAILWIND, SASS],
      [MONGODB, SQL],
      [FIREBASE, DOCKER],
    ],
  },
  {
    id: "ai-llm",
    line: "AI & LLM Systems",
    sub: "RAG pipelines, agents, and real-time inference in production.",
    rungs: [
      [OPENAI, CHROMA],
      [LLAMA, GROQ],
      [PYTHON, STREAMLIT],
      [DEEPSEEK, DOCKER],
      [CHROMA, LLAMA], // disguised repeats: Chroma (rung 0→4, new partner, opposite strand),
      [GROQ, OPENAI], //  LLaMA/Groq/OpenAI all ≥3 rungs from their first seat, on the other strand
    ],
  },
  {
    id: "design-motion",
    line: "Product Design & Motion",
    sub: "Design taste with engineering hands — UI, UX, and motion.",
    rungs: [
      [FIGMA, ILLUSTRATOR],
      [GSAP, FRAMER],
      [CSS, TAILWIND],
      [REACT, NEXT],
      [FRAMER, FIGMA], // disguised repeats: Framer (1→4)/Figma (0→4)/Illustrator (0→5)/GSAP (1→5),
      [ILLUSTRATOR, GSAP], //  each ≥3 rungs on, new partner, opposite strand
    ],
  },
  {
    id: "data-infra",
    line: "Data & Infrastructure",
    sub: "Modeling, storage, and deployment that hold up.",
    rungs: [
      [MONGODB, SQL],
      [FIREBASE, FIRESTORE],
      [CHROMA, NEDB],
      [DOCKER, KUBERNETES],
      [GITHUB, FIREBASE], // Firebase reappears (rung 1→4, new partner, opposite strand) — same rule
    ],
  },
];
