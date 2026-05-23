import type { Metadata } from "next";
import { pierSans } from "@/lib/fonts";
import { projects } from "../../../data/projects";
import { WorksRowMotion } from "@/components/works/WorksRowMotion";
import { WorksFooter } from "@/components/works/WorksFooter";

export const metadata: Metadata = {
  title: "Works — Pratiush Karki",
  description:
    "Selected works by Pratiush Karki — case studies and snapshots across software engineering, design, and AI.",
};

export default function WorksIndexPage() {
  return (
    <main className="min-h-screen w-full bg-beige text-navy">
      <section className="mx-auto w-full max-w-6xl px-4 pt-28 pb-12 sm:px-6 md:pt-36">
        <p className="text-xs uppercase tracking-widest text-navy/60">
          Selected works
        </p>
        <h1
          className={`${pierSans.className} mt-3 text-4xl text-navy sm:text-5xl md:text-6xl`}
        >
          Works
        </h1>
        <p className="mt-4 max-w-2xl text-base text-navy/70 sm:text-lg">
          Case studies and snapshots from across software, design, and AI.
        </p>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {projects.map((project, i) => (
          <WorksRowMotion
            key={project.slug}
            slug={project.slug}
            index={i}
            title={project.title}
            description={project.description}
            role={project.role}
            year={project.year}
            techStack={project.techStack}
            hero={project.hero}
          />
        ))}
      </div>

      <WorksFooter />
    </main>
  );
}
