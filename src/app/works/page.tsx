import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pierSans } from "@/lib/fonts";
import { projects } from "../../../data/projects";
import { WorksRowMedia } from "@/components/works/WorksRowMedia";
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
        {projects.map((project, i) => {
          const num = String(i + 1).padStart(2, "0");
          return (
            <Link
              key={project.slug}
              href={`/works/${project.slug}`}
              className="group block border-t border-navy/15 py-10 md:py-16"
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
                  <div className="text-sm font-medium text-navy/50">{num}</div>
                  <h2
                    className={`${pierSans.className} mt-2 text-3xl text-navy sm:text-4xl md:text-5xl`}
                  >
                    {project.title}
                  </h2>
                  <p className="mt-3 text-base text-navy/75 sm:text-lg">
                    {project.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-navy/70">
                    <span className="rounded-full border border-navy/30 bg-beige px-3 py-1">
                      {project.role}
                    </span>
                    <span className="rounded-full border border-navy/30 bg-beige px-3 py-1">
                      {project.year}
                    </span>
                  </div>
                  {project.techStack?.length ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {project.techStack.slice(0, 6).map((t) => (
                        <li
                          key={t}
                          className="rounded-full border border-navy/20 bg-beige px-2.5 py-0.5 text-[11px] text-navy/80"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-navy">
                    View case study
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </div>
                </div>

                <div className="md:col-span-7">
                  {project.hero ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-navy/20 bg-navy/5 md:min-h-[60vh]">
                      <WorksRowMedia
                        media={project.hero}
                        title={project.title}
                        priority={i === 0}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-navy/20 bg-navy/5" />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <WorksFooter />
    </main>
  );
}
