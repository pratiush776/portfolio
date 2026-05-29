export const softSkills = [
  { title: "Clarity", note: "In writing, in decisions, in code." },
  { title: "Ownership", note: "Boring parts included." },
  { title: "Cadence", note: "Shipping beats polishing." },
  { title: "Empathy", note: "For users and the next maintainer." },
] as const;

export const technicalSpecs = [
  {
    key: "interfaces",
    title: "Interfaces",
    note: "From a Figma frame to a shipped component.",
    tools: ["TypeScript", "React", "Next.js", "Tailwind", "Motion", "GSAP", "Figma"],
  },
  {
    key: "systems",
    title: "Systems",
    note: "APIs, data, and the glue that keeps them honest.",
    tools: ["Node", "Express", "FastAPI", "Python", "SQL", "NoSQL"],
  },
  {
    key: "delivery",
    title: "Delivery",
    note: "Containerized, versioned, deployed, observed.",
    tools: ["Docker", "Git", "Vercel", "Supabase"],
  },
  {
    key: "intelligence",
    title: "Intelligence",
    note: "LLM features and the retrieval that grounds them.",
    tools: ["LLaMA", "Ollama", "ChromaDB"],
  },
] as const;

export type SoftSkill = (typeof softSkills)[number];
export type TechnicalSpec = (typeof technicalSpecs)[number];
