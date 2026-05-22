import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "../../../../data/projects";
import { CaseStudy } from "@/components/works/CaseStudy";

type RouteParams = { slug: string };

export function generateStaticParams(): RouteParams[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    return { title: "Not Found — Pratiush Karki" };
  }
  const ogImage =
    project.hero && project.hero.kind === "image"
      ? project.hero.src
      : project.logo;
  return {
    title: `${project.title} — Pratiush Karki`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Pratiush Karki`,
      description: project.description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    notFound();
  }
  return (
    <main className="min-h-screen w-full bg-beige text-navy">
      <CaseStudy project={project} />
    </main>
  );
}
