import Link from "next/link";
import type { Project } from "@/data/projects";
import { PaperTexture } from "@/components/decor/PaperTexture";
import { WorkPicture } from "./WorkPicture";

type WorkCardProps = {
  project: Project;
  index: number;
};

// Per-project accent colors for cinematic "color grading per scene".
// Eyeballed from each project's mood; swap to a `accent` field on the
// data schema once the user supplies one.
const ACCENTS: Record<string, string> = {
  nilink: "#7AA2D9",
  "lucid-tone": "#D4B074",
  "rag-legal-agent": "#9C7BC9",
  "whisk-it-all": "#E8956B",
  homedoc: "#5BA89F",
  roommates: "#7FB069",
  "whisk-it-all-card": "#D9C5A0",
};

export function WorkCard({ project, index }: WorkCardProps) {
  const heroSrc = project.hero?.src ?? project.logo;
  const heroKind = project.hero?.kind ?? "image";
  const number = String(index + 1).padStart(2, "0");
  const accent = ACCENTS[project.slug] ?? "#D4B074";

  return (
    <article
      className="work-card-v3"
      aria-label={project.title}
      style={{ ["--accent" as string]: accent }}
    >
      <div className="work-stage-v3">
        <div className="work-scene-v3">
          <div className="work-panel-v3">
            <PaperTexture opacity={0.35} blendMode="multiply" />

            <span className="work-panel-v3__chapter" aria-hidden>
              {number}
            </span>

            <div className="work-panel-v3__content">
              <header className="work-panel-v3__head">
                <span className="work-panel-v3__meta">
                  <span>{project.year}</span>
                  <span aria-hidden>·</span>
                  <span>{project.role}</span>
                </span>
                <h2 className="work-panel-v3__title">{project.title}</h2>
                <p className="work-panel-v3__subtitle">{project.description}</p>
                <p className="work-panel-v3__brief">
                  {project.context?.split("\n\n")[0] ?? project.fullDescription}
                </p>
              </header>

              <footer className="work-panel-v3__foot">
                <p className="work-panel-v3__credits" aria-label="Tech stack">
                  {project.techStack.slice(0, 8).join(" · ")}
                </p>
                <div className="work-panel-v3__ctas">
                  <Link
                    href={`/works/${project.slug}`}
                    className="work-panel-v3__cta"
                  >
                    <span>View case study</span>
                  </Link>
                  {project.links?.live && (
                    <a
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="work-panel-v3__cta work-panel-v3__cta--ghost"
                    >
                      <span>Live demo</span>
                      <span className="work-panel-v3__cta-arrow" aria-hidden>
                        ↗
                      </span>
                    </a>
                  )}
                </div>
              </footer>
            </div>
          </div>

          <div className="work-picture-v3">
            <div className="work-picture-v3__mat">
              <WorkPicture
                src={heroSrc}
                kind={heroKind}
                alt={`${project.title} preview`}
                title={project.title}
                posterFallback={project.logo}
                priority={index === 0}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
