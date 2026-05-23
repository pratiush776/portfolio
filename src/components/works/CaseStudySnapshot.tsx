import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { pierSans } from "@/lib/fonts";
import type { Media, Project } from "../../../data/projects";
import { SiblingNav, type SiblingLink } from "./SiblingNav";
import { HeroViewTransition } from "./HeroViewTransition";

type CaseStudySnapshotProps = {
  project: Project;
  prev: SiblingLink;
  next: SiblingLink;
};

function HeroMedia({ media, title }: { media: Media; title: string }) {
  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        className="block h-full w-full object-cover"
        aria-label={`${title} hero`}
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={`${title} hero`}
      width={1600}
      height={1000}
      priority
      className="block h-full w-full object-cover"
    />
  );
}

function Paragraphs({ text }: { text: string }) {
  const parts = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p
          key={i}
          className="mb-4 text-base leading-relaxed text-navy/85 sm:text-lg"
        >
          {p}
        </p>
      ))}
    </>
  );
}

export function CaseStudySnapshot({
  project,
  prev,
  next,
}: CaseStudySnapshotProps) {
  const {
    title,
    description,
    techStack,
    role,
    year,
    hero,
    context,
    imgs,
    videos,
    links,
  } = project;

  return (
    <article className="mx-auto w-full max-w-5xl px-4 pt-24 pb-12 sm:px-6 sm:pt-28 md:pt-32">
      {/* Hero */}
      <header className="mb-10">
        <h1
          className={`${pierSans.className} text-4xl leading-tight text-navy sm:text-5xl md:text-6xl`}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-navy/80 sm:text-xl">
          {description}
        </p>

        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-navy/80">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-navy/50">
              Role
            </dt>
            <dd className="font-medium">{role}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-navy/50">
              Year
            </dt>
            <dd className="font-medium">{year}</dd>
          </div>
        </dl>

        {techStack?.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-navy/30 bg-beige px-3 py-1 text-xs text-navy"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        {hero ? (
          <HeroViewTransition name={`hero-${project.slug}`}>
            <div className="mt-8 overflow-hidden rounded-xl border border-navy border-r-[4px] border-b-[4px] bg-navy/5">
              <div className="aspect-video w-full">
                <HeroMedia media={hero} title={title} />
              </div>
            </div>
          </HeroViewTransition>
        ) : null}

        {(links?.live || links?.repo) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {links.live ? (
              <Link
                href={links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-navy bg-navy px-4 py-2 text-sm font-medium text-beige transition hover:bg-navy/90"
              >
                <ExternalLink className="h-4 w-4" aria-hidden /> Live site
              </Link>
            ) : null}
            {links.repo ? (
              <Link
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-navy bg-beige px-4 py-2 text-sm font-medium text-navy transition hover:bg-navy/5"
              >
                <Github className="h-4 w-4" aria-hidden /> Repository
              </Link>
            ) : null}
          </div>
        ) : null}
      </header>

      {/* Context */}
      {context ? (
        <section className="mb-12">
          <Paragraphs text={context} />
        </section>
      ) : null}

      {/* Gallery */}
      {(videos && videos.length > 0) || (imgs && imgs.length > 0) ? (
        <section className="mb-12">
          <h2
            className={`${pierSans.className} mb-4 text-2xl text-navy sm:text-3xl`}
          >
            Gallery
          </h2>
          <div className="mx-auto flex w-full max-w-[80vw] flex-col gap-6">
            {videos?.map((src) => (
              <div
                key={src}
                className="overflow-hidden rounded-lg border border-navy/20 bg-navy/5"
              >
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="block w-full"
                  aria-label={`${title} demo`}
                />
              </div>
            ))}
            {imgs?.map((src) => (
              <div
                key={src}
                className="relative aspect-video w-full overflow-hidden rounded-lg border border-navy/20 bg-navy/5"
              >
                <Image
                  src={src}
                  alt={`${title} screenshot`}
                  fill
                  sizes="(min-width: 768px) 80vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <SiblingNav prev={prev} next={next} />
    </article>
  );
}
