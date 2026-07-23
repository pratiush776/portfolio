"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { EASE, RISE } from "@/lib/motion";
import type { FeaturedWork } from "@/data/works";

/**
 * One project's case page. A calm read: the facts line, the title at display scale, the
 * brief, the cover, the write-up, the demo, the stack, and prev/next. One mount cascade,
 * then the page just sits there.
 */
const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: RISE.hidden,
  visible: { ...RISE.visible, transition: { duration: 0.8, ease: EASE } },
};

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

  const body = work.caseBody ?? [work.description];
  const brief = work.tagline ?? work.description;
  const stackLine = work.stack.slice(0, 2).join(" · ");
  const v = reduce ? undefined : rise;

  return (
    <motion.main
      className="case gutter measure"
      variants={reduce ? undefined : STAGGER}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "visible"}
    >
      <header className="case__intro">
        <motion.p className="label muted" variants={v}>
          {work.year} · {work.role}
          {stackLine ? ` · ${stackLine}` : ""}
        </motion.p>
        <motion.h1 className="display-section" variants={v}>
          {work.title}
        </motion.h1>
        <motion.p className="h2 muted" variants={v}>
          {brief}
        </motion.p>
      </header>

      <motion.div className="frame frame--wide" variants={v}>
        <CaseCover work={work} />
      </motion.div>

      <motion.div className="case__body" variants={v}>
        {body.map((para, i) => (
          <p key={i} className="prose">
            {para}
          </p>
        ))}
      </motion.div>

      {/* A poster-kind work already shows its plate as the cover above — rendering the same
          words again here would just stamp them twice on one page. */}
      {work.media.kind === "video" && (
        <motion.section
          className="frame frame--video"
          aria-label={`${work.title} demo`}
          variants={v}
        >
          <video
            className="frame__media"
            src={work.media.src}
            poster={work.media.poster}
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </motion.section>
      )}

      <motion.section aria-label="Tech stack" variants={v}>
        <ul className="case__stack">
          {work.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </motion.section>

      {work.links.length > 0 && (
        <motion.nav
          className="case__links"
          aria-label="Project links"
          variants={v}
        >
          {work.links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="h3"
            >
              <span className="underline-link">{label}</span>
              <ArrowUpRight width="14" height="14" aria-hidden />
            </a>
          ))}
        </motion.nav>
      )}

      <motion.nav className="case__nav" aria-label="More projects" variants={v}>
        <Link href={`/works/${prev.slug}`} className="case__nav-item">
          <span className="label muted">Previous</span>
          <span className="h3 underline-link">{prev.title}</span>
        </Link>

        <Link href="/#work" className="case__nav-item">
          <span className="label muted">Index</span>
          <span className="h3 underline-link">All work</span>
        </Link>

        <Link href={`/works/${next.slug}`} className="case__nav-item">
          <span className="label muted">Next</span>
          <span className="h3 underline-link">{next.title}</span>
        </Link>
      </motion.nav>
    </motion.main>
  );
}

/** The cover: the photographed still, or the typographic plate for a poster-kind work. */
function CaseCover({ work }: { work: FeaturedWork }) {
  const still =
    work.media.kind === "video" ? work.cover ?? work.media.poster : work.cover;

  if (work.media.kind === "poster") {
    return (
      <div className="plate" aria-hidden>
        <span className="plate__word">{work.media.word}</span>
        <span className="plate__caption">{work.media.caption}</span>
      </div>
    );
  }

  return still ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="frame__media"
      src={still}
      alt={work.coverAlt ?? `${work.title} — project cover`}
      draggable={false}
    />
  ) : null;
}
