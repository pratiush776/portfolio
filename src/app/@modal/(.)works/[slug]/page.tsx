import { notFound } from "next/navigation";
import { projects, type Project } from "../../../../../data/projects";
import { ModalSheet } from "@/components/works/ModalSheet";
import type { SiblingLink } from "@/components/works/SiblingNav";

type RouteParams = { slug: string };

function toSibling(p: Project): SiblingLink {
  return {
    slug: p.slug,
    title: p.title,
    hero: p.hero,
  };
}

export default async function InterceptedCaseStudyPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    notFound();
  }
  const index = projects.findIndex((p) => p.slug === project.slug);
  const total = projects.length;
  const prevProject =
    projects[(index - 1 + total) % total] ?? projects[total - 1];
  const nextProject = projects[(index + 1) % total] ?? projects[0];

  return (
    <ModalSheet
      project={project}
      prev={toSibling(prevProject)}
      next={toSibling(nextProject)}
    />
  );
}
