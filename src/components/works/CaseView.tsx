"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { STAGGER, rise } from "@/lib/motion";
import type { FeaturedWork } from "@/data/works";

/**
 * One project's case page. The opening earns a fast skim — context, title, brief, real media,
 * outcome — before the page settles into Why / What / How and the decisions underneath. The
 * structure repeats so a reader knows where to look; the evidence does not.
 */

export function CaseView({
  work,
  prev,
  next,
}: {
  work: FeaturedWork;
  prev: FeaturedWork;
  next: FeaturedWork;
}) {
  const reduce = useReducedMotion() ?? false;

  const brief = work.tagline ?? work.description;
  const stackLine = work.stack.join(" · ");
  const v = reduce ? undefined : rise;

  return (
    <main id="main" className="case gutter measure">
      <motion.div
        className="case__opening"
        variants={reduce ? undefined : STAGGER}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "visible"}
      >
        <CaseOpening
          work={work}
          brief={brief}
          stackLine={stackLine}
          variants={v}
        />
      </motion.div>

      <CaseNarrative work={work} />
      <CaseActions work={work} prev={prev} next={next} />
    </main>
  );
}

function CaseOpening({
  work,
  brief,
  stackLine,
  variants,
}: {
  work: FeaturedWork;
  brief: string;
  stackLine: string;
  variants?: Variants;
}) {
  return (
    <>
      <header className="case__intro">
        <motion.p className="case__meta" variants={variants}>
          {work.year} · {work.role} · {stackLine}
        </motion.p>
        <motion.h1 className="display-section" variants={variants}>
          {work.title}
        </motion.h1>
        <motion.p className="case__brief editorial" variants={variants}>
          {brief}
        </motion.p>
      </header>

      <motion.div variants={variants}>
        <CaseLeadMedia work={work} />
      </motion.div>
    </>
  );
}

function CaseNarrative({ work }: { work: FeaturedWork }) {
  const { caseStudy } = work;

  return (
    <>
      <p className="case__outcome editorial">{caseStudy.outcome}</p>

      <article className="case__narrative">
        <CaseBeat title="Why">
          <p className="prose">{caseStudy.why}</p>
        </CaseBeat>

        <CaseBeat title="What">
          <p className="prose">{caseStudy.what}</p>
        </CaseBeat>

        <CaseBeat title="How" wide>
          <p className="prose">{caseStudy.how}</p>
          <div className="case__decisions">
            {caseStudy.decisions.map((decision) => (
              <section className="case__decision" key={decision.title}>
                <h3>{decision.title}</h3>
                <p>{decision.detail}</p>
              </section>
            ))}
          </div>
        </CaseBeat>
      </article>

      {caseStudy.artifacts && caseStudy.artifacts.length > 0 && (
        <section className="case__artifacts" aria-label="Project artifacts">
          {caseStudy.artifacts.map((artifact) => (
            <figure className="case__artifact" key={artifact.src}>
              <div
                className="case__artifact-frame"
                style={{ aspectRatio: artifact.aspectRatio }}
              >
                <Image
                  src={artifact.src}
                  alt={artifact.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 78vw"
                  className="case__artifact-image"
                />
              </div>
              <figcaption>{artifact.note}</figcaption>
            </figure>
          ))}
        </section>
      )}
    </>
  );
}

function CaseBeat({
  title,
  wide = false,
  children,
}: {
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`case__beat${wide ? " case__beat--wide" : ""}`}>
      <h2 className="case__beat-title editorial">{title}</h2>
      <div className="case__beat-content">{children}</div>
    </section>
  );
}

function CaseActions({
  work,
  prev,
  next,
}: {
  work: FeaturedWork;
  prev: FeaturedWork;
  next: FeaturedWork;
}) {
  return (
    <>
      {work.links.length > 0 && (
        <nav className="case__links" aria-label="Project links">
          {work.links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="underline-link">{label}</span>
              <ArrowUpRight width="16" height="16" aria-hidden />
            </a>
          ))}
        </nav>
      )}

      <nav className="case__nav" aria-label="More projects">
        <Link
          href={`/works/${prev.slug}`}
          className="case__nav-item case__nav-item--previous"
          aria-label={`Previous project: ${prev.title}`}
        >
          <span aria-hidden>←</span>
          <span className="underline-link">{prev.title}</span>
        </Link>

        <Link href="/#work" className="case__nav-item">
          <span className="underline-link">All work</span>
        </Link>

        <Link
          href={`/works/${next.slug}`}
          className="case__nav-item case__nav-item--next"
          aria-label={`Next project: ${next.title}`}
        >
          <span className="underline-link">{next.title}</span>
          <span aria-hidden>→</span>
        </Link>
      </nav>
    </>
  );
}

/** Video leads when it exists. Poster-only work keeps its honest typographic plate. */
function CaseLeadMedia({ work }: { work: FeaturedWork }) {
  if (work.media.kind === "poster") {
    return (
      <div
        className="frame frame--wide case__poster"
        role="img"
        aria-label={`${work.media.word}. ${work.media.caption}`}
      >
        <div className="plate" aria-hidden>
          <span className="plate__word">{work.media.word}</span>
          <span className="plate__caption">{work.media.caption}</span>
        </div>
      </div>
    );
  }

  return (
    <CaseDemo
      title={work.title}
      src={work.media.src}
      aspectRatio={work.media.aspectRatio}
    />
  );
}

function CaseDemo({
  title,
  src,
  aspectRatio,
}: {
  title: string;
  src: string;
  aspectRatio: string;
}) {
  const [phase, setPhase] = useState<
    "idle" | "loading" | "playing" | "error"
  >("idle");
  const requested = phase !== "idle";

  return (
    <section
      className="case__demo"
      style={{ aspectRatio }}
      aria-label={`${title} demo`}
    >
      {requested && (
        <video
          className={`case__demo-video${
            phase === "playing" ? " case__demo-video--visible" : ""
          }`}
          src={src}
          muted
          playsInline
          controls
          autoPlay
          preload="auto"
          onPlaying={() => setPhase("playing")}
          onError={() => setPhase("error")}
        >
          <a href={src}>Open the {title} demo video</a>
        </video>
      )}

      {phase === "idle" && (
        <button
          type="button"
          className="case__demo-gate"
          onClick={() => setPhase("loading")}
          aria-label={`Play ${title} demo`}
        >
          <DemoMark />
        </button>
      )}

      {phase === "loading" && (
        <div className="case__demo-wait" role="status">
          <DemoMark />
          <span className="sr-only">Loading {title} demo</span>
        </div>
      )}

      {phase === "error" && (
        <div className="case__demo-error" role="status">
          <p>The demo could not load.</p>
          <a href={src} className="underline-link">
            Open the video
          </a>
        </div>
      )}
    </section>
  );
}

function DemoMark() {
  return (
    <span className="demo-mark" aria-hidden>
      <span className="demo-mark__word">Demo</span>
      <span className="demo-mark__play demo-mark__play--one" />
      <span className="demo-mark__play demo-mark__play--two" />
      <span className="demo-mark__play demo-mark__play--three" />
    </span>
  );
}
