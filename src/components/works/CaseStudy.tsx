import { projects, type Project } from "../../../data/projects";
import { CaseStudyDeep } from "./CaseStudyDeep";
import { CaseStudySnapshot } from "./CaseStudySnapshot";
import type { SiblingLink } from "./SiblingNav";

type CaseStudyProps = {
  project: Project;
};

function toSibling(p: Project): SiblingLink {
  return {
    slug: p.slug,
    title: p.title,
    hero: p.hero,
  };
}

export function CaseStudy({ project }: CaseStudyProps) {
  const index = projects.findIndex((p) => p.slug === project.slug);
  const total = projects.length;
  const prevProject =
    projects[(index - 1 + total) % total] ?? projects[total - 1];
  const nextProject = projects[(index + 1) % total] ?? projects[0];
  const prev = toSibling(prevProject);
  const next = toSibling(nextProject);

  if (project.caseStudyType === "deep") {
    return <CaseStudyDeep project={project} prev={prev} next={next} />;
  }
  return <CaseStudySnapshot project={project} prev={prev} next={next} />;
}
