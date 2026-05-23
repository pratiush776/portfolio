import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { pierSans } from "@/lib/fonts";
import type { Media, Project } from "../../../data/projects";
import { SiblingNav, type SiblingLink } from "./SiblingNav";
import { HeroViewTransition } from "./HeroViewTransition";

type CaseStudyDeepProps = {
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

function InlineMedia({ media, title }: { media: Media; title: string }) {
  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        className="mt-4 block w-full rounded-lg border border-navy/20 object-cover"
        aria-label={`${title} process media`}
      />
    );
  }
  return (
    <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg border border-navy/20 bg-navy/5">
      <Image
        src={media.src}
        alt={`${title} process media`}
        fill
        sizes="(min-width: 768px) 80vw, 100vw"
        className="object-cover"
      />
    </div>
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

export function CaseStudyDeep({ project, prev, next }: CaseStudyDeepProps) {
  const {
    title,
    techStack,
    role,
    year,
    timeline,
    hero,
    context,
    problem,
    process,
    outcome,
    reflection,
    links,
  } = project;

  return (
    <article className="mx-auto w-full max-w-5xl px-4 pt-24 pb-12 sm:px-6 sm:pt-28 md:pt-32">
      {/* Hero */}
      <header className="mb-12">
        <h1
          className={`${pierSans.className} text-4xl leading-tight text-navy sm:text-5xl md:text-6xl`}
        >
          {title}
        </h1>
        {outcome?.summary ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy/80 sm:text-xl">
            {outcome.summary}
          </p>
        ) : null}

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-navy/80">
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
          {timeline ? (
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-navy/50">
                Timeline
              </dt>
              <dd className="font-medium">{timeline}</dd>
            </div>
          ) : null}
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
          <h2
            className={`${pierSans.className} mb-4 text-2xl text-navy sm:text-3xl`}
          >
            Context
          </h2>
          <Paragraphs text={context} />
        </section>
      ) : null}

      {/* Problem */}
      {problem ? (
        <section className="mb-12">
          <h2
            className={`${pierSans.className} mb-4 text-2xl text-navy sm:text-3xl`}
          >
            Problem
          </h2>
          <Paragraphs text={problem} />
        </section>
      ) : null}

      {/* Process */}
      {process && process.length > 0 ? (
        <section className="mb-12">
          <h2
            className={`${pierSans.className} mb-6 text-2xl text-navy sm:text-3xl`}
          >
            Process
          </h2>
          <ol className="space-y-10">
            {process.map((beat, i) => (
              <li key={i}>
                <h3
                  className={`${pierSans.className} mb-2 text-xl text-navy sm:text-2xl`}
                >
                  <span className="mr-2 text-navy/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {beat.heading}
                </h3>
                <Paragraphs text={beat.body} />
                {beat.media ? (
                  <InlineMedia media={beat.media} title={title} />
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Outcome */}
      {outcome &&
      (outcome.summary || (outcome.metrics && outcome.metrics.length > 0)) ? (
        <section className="mb-12">
          <h2
            className={`${pierSans.className} mb-4 text-2xl text-navy sm:text-3xl`}
          >
            Outcome
          </h2>
          {outcome.summary ? <Paragraphs text={outcome.summary} /> : null}
          {outcome.metrics && outcome.metrics.length > 0 ? (
            <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {outcome.metrics.map((m, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-navy/20 bg-beige p-4"
                >
                  <dt className="text-[10px] uppercase tracking-wider text-navy/50">
                    {m.label}
                  </dt>
                  <dd
                    className={`${pierSans.className} mt-1 text-2xl text-navy sm:text-3xl`}
                  >
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}

      {/* Reflection */}
      {reflection ? (
        <section className="mb-12">
          <h2
            className={`${pierSans.className} mb-4 text-2xl text-navy sm:text-3xl`}
          >
            Reflection
          </h2>
          <Paragraphs text={reflection} />
        </section>
      ) : null}

      <SiblingNav prev={prev} next={next} />
    </article>
  );
}
