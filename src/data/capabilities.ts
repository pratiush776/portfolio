/**
 * The three capability domains, each a claim linked to the project that proves it. `line` is
 * the domain, `sub` a one-line gloss, and `proof` the work that demonstrates it — its `slug` must
 * match an entry in `works` (the AI/LLM proof is a secondary case work, still reachable), and
 * `label` names that work.
 */
export type Capability = {
  id: string;
  line: string;
  sub: string;
  proof: { slug: string; label: string };
};

export const capabilities: Capability[] = [
  {
    id: "full-stack",
    line: "Full-stack product engineering",
    sub: "Interfaces, APIs, data, and deploy — shipped end to end.",
    proof: { slug: "nilink", label: "NILINK" },
  },
  {
    id: "ai-llm",
    line: "AI & LLM systems",
    sub: "RAG pipelines, agents, and real-time inference in production.",
    proof: { slug: "private-law-rag", label: "Private Law RAG Agent" },
  },
  {
    id: "design-motion",
    line: "Design & motion",
    sub: "Design taste with engineering hands — UI, UX, and motion.",
    proof: { slug: "whisk-it-all", label: "Whisk It All" },
  },
];
