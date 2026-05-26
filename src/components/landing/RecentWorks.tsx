"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";

const FEATURED_SLUGS = ["nilink", "lucid-tone", "whisk-it-all"] as const;

function getFeatured(): Project[] {
  return FEATURED_SLUGS.map((slug) =>
    projects.find((p) => p.slug === slug),
  ).filter((p): p is Project => Boolean(p));
}

function Thumb({
  project,
  hovered,
}: {
  project: Project;
  hovered: boolean;
}) {
  const videoSrc =
    project.hero?.kind === "video" ? project.hero.src : null;
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  if (hovered && videoSrc && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (!mounted) return;
    const v = ref.current;
    if (!v) return;
    if (hovered) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered, mounted]);

  return (
    <div
      className="recent-works-v3__thumb-brand"
      data-ready={ready ? "true" : undefined}
      aria-hidden
    >
      <span className="recent-works-v3__thumb-brand-mark">
        <Image
          src={project.logo}
          alt=""
          fill
          sizes="(max-width: 900px) 40vw, 160px"
        />
      </span>
      <span className="recent-works-v3__thumb-brand-label">
        {project.title}
      </span>
      {mounted && videoSrc && (
        <video
          ref={ref}
          className="recent-works-v3__thumb-video"
          src={videoSrc}
          preload="auto"
          muted
          playsInline
          loop
          onCanPlay={() => setReady(true)}
        />
      )}
    </div>
  );
}

function Row({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <li className="recent-works-v3__item">
      <Link
        href={`/works/${project.slug}`}
        className="recent-works-v3__row"
        data-hover={hovered ? "true" : undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div className="recent-works-v3__row-inner">
          <span className="recent-works-v3__index" aria-hidden>
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="recent-works-v3__col-a">
            <h3 className="recent-works-v3__row-title">{project.title}</h3>
            <p className="recent-works-v3__row-meta">
              {project.techStack.slice(0, 3).join(" · ")}
            </p>
          </div>

          <div className="recent-works-v3__col-b">
            <span className="recent-works-v3__year">{project.year}</span>
            <span className="recent-works-v3__role">{project.role}</span>
          </div>

          <div className="recent-works-v3__thumb">
            <Thumb project={project} hovered={hovered} />
          </div>
        </div>
      </Link>
    </li>
  );
}

export function RecentWorks() {
  const featured = getFeatured();
  const years = featured.map((p) => p.year);
  const yearRange =
    years.length > 0
      ? `${Math.min(...years)} — ${Math.max(...years)}`
      : null;

  return (
    <section className="recent-works-v3" aria-labelledby="recent-works-title">
      <div className="recent-works-v3__inner">
        <header className="recent-works-v3__head">
          {yearRange && (
            <span className="recent-works-v3__eyebrow">{yearRange}</span>
          )}
          <h2 id="recent-works-title" className="recent-works-v3__title">
            Selected work
          </h2>
        </header>

        <ol className="recent-works-v3__list">
          {featured.map((p, i) => (
            <Row key={p.slug} project={p} index={i} />
          ))}
        </ol>

        <div className="recent-works-v3__footer">
          <Link href="/works" className="recent-works-v3__see-all">
            <span>See all works</span>
            <span aria-hidden className="recent-works-v3__see-all-arrow">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
