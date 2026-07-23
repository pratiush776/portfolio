/**
 * The four capability domains, listed as text rows on the landing page.
 * `line` is the domain; `sub` is the one-line voice under it.
 */
export type Capability = {
  id: string;
  line: string;
  sub: string;
};

export const capabilities: Capability[] = [
  {
    id: "full-stack",
    line: "Full-Stack Engineering",
    sub: "Interfaces, APIs, and data — shipped end to end.",
  },
  {
    id: "ai-llm",
    line: "AI & LLM Systems",
    sub: "RAG pipelines, agents, and real-time inference in production.",
  },
  {
    id: "design-motion",
    line: "Product Design & Motion",
    sub: "Design taste with engineering hands — UI, UX, and motion.",
  },
  {
    id: "data-infra",
    line: "Data & Infrastructure",
    sub: "Modeling, storage, and deployment that hold up.",
  },
];
