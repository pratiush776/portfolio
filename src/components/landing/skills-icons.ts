import type { ComponentType, SVGProps } from "react";
import {
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiFramer,
  SiGreensock,
  SiFigma,
  SiNodedotjs,
  SiExpress,
  SiFastapi,
  SiPython,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiGit,
  SiVercel,
  SiSupabase,
  SiOllama,
  SiMeta,
} from "react-icons/si";
import { Boxes } from "lucide-react";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

// Each tool string in skills-data maps to a brand glyph (Simple Icons via
// react-icons) — with two lucide fallbacks for marks Simple Icons doesn't carry
// (Meta's Llama, ChromaDB). Keep this in sync with `technicalSpecs[].tools`.
export const toolIcons: Record<string, Icon> = {
  TypeScript: SiTypescript,
  React: SiReact,
  "Next.js": SiNextdotjs,
  Tailwind: SiTailwindcss,
  Motion: SiFramer,
  GSAP: SiGreensock,
  Figma: SiFigma,
  Node: SiNodedotjs,
  Express: SiExpress,
  FastAPI: SiFastapi,
  Python: SiPython,
  SQL: SiPostgresql,
  NoSQL: SiMongodb,
  Docker: SiDocker,
  Git: SiGit,
  Vercel: SiVercel,
  Supabase: SiSupabase,
  LLaMA: SiMeta,
  Ollama: SiOllama,
  ChromaDB: Boxes,
};
