// Left flank — "Approach" as a voice block, not an equal-weight list.
// `lead` is the focal sentence; `traits` are the demoted supporting set.
export const approach = {
  lead: "I turn unclear ideas into products people actually use.",
  traits: [
    { title: "Clarity", note: "If it needs explaining, I rebuild it." },
    { title: "Ownership", note: "I stay until the edges are smooth." },
    { title: "Cadence", note: "Small, steady, in your hands sooner." },
    { title: "Empathy", note: "I write for whoever inherits this." },
  ],
} as const;

export const technicalSpecs = [
  {
    key: "interfaces",
    title: "Interfaces",
    note: "From a Figma frame to a shipped component.",
    proof: "Polished dashboards, landing pages, and product flows.",
    tools: ["TypeScript", "React", "Next.js", "Tailwind", "Motion", "GSAP", "Figma"],
  },
  {
    key: "systems",
    title: "Systems",
    note: "APIs, data, and the glue that keeps them honest.",
    proof: "Auth, role logic, database flows, and backend structure.",
    tools: ["Node", "Express", "FastAPI", "Python", "SQL", "NoSQL"],
  },
  {
    key: "delivery",
    title: "Delivery",
    note: "Containerized, versioned, deployed, observed.",
    proof: "Clean handoff from local build to production.",
    tools: ["Docker", "Git", "Vercel", "Supabase"],
  },
  {
    key: "intelligence",
    title: "Intelligence",
    note: "LLM features and the retrieval that grounds them.",
    proof: "Practical AI features built around real user needs.",
    tools: ["LLaMA", "Ollama", "ChromaDB"],
  },
] as const;

export type Approach = typeof approach;
export type ApproachTrait = (typeof approach.traits)[number];
export type TechnicalSpec = (typeof technicalSpecs)[number];
