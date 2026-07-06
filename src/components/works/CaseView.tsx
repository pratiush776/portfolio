"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { INTRO_EASE } from "@/lib/intro";
import type { FeaturedWork } from "@/data/works";

/**
 * The dedicated case-study page for one project — a CALM real route, not a pinned scroll stage. It
 * reuses the editorial-spread LANGUAGE (oversized Fraunces title, the year · role · stack meta line,
 * the cover bleeding right) but with static reveals only: one rise+fade on mount, then the page just
 * sits there and reads. SectionAurora + SiteNav + SiteFooter come from the layout; this component owns
 * only the case content and the prev/next footer nav.
 *
 * Motion: a single mount cascade (hero band, body, media, footer) on INTRO_EASE, staggered so the page
 * assembles as one gesture. Reduced motion renders everything static at full opacity.
 */
const RISE: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: INTRO_EASE } },
};

const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
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

  // The fuller write-up: the case paragraphs where they exist, otherwise the single description line.
  const body = work.caseBody ?? [work.description];
  const brief = work.tagline ?? work.description;
  const stackLine = work.stack.slice(0, 2).join(" · ");

  return (
    <motion.main
      className="case-v4"
      variants={reduce ? undefined : STAGGER}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "visible"}
    >
      {/* Hero band — oversized serif title, the facts line, the brief, and the cover bleeding right
          (or stacked below on narrow). */}
      <header className="case-v4__hero">
        <div className="case-v4__intro">
          <motion.p className="case-v4__meta" variants={reduce ? undefined : RISE}>
            {work.year} · {work.role}
            {stackLine ? ` · ${stackLine}` : ""}
          </motion.p>
          <motion.h1 className="case-title-v4" variants={reduce ? undefined : RISE}>
            {work.title}
          </motion.h1>
          <motion.p className="case-v4__brief" variants={reduce ? undefined : RISE}>
            {brief}
          </motion.p>
        </div>

        <motion.div className="case-v4__cover" variants={reduce ? undefined : RISE}>
          <CaseCover work={work} />
        </motion.div>
      </header>

      {/* Body — the fuller write-up in Hanken body measure. */}
      <motion.div className="case-v4__body" variants={reduce ? undefined : RISE}>
        {body.map((para, i) => (
          <p key={i} className="case-v4__para">
            {para}
          </p>
        ))}
      </motion.div>

      {/* Media at size — the demo video, ONLY for works that have one. A poster-kind work (no video,
          no product still) already shows its typographic plate as the hero cover above, so rendering
          the same plate again here would just stamp the identical words twice on one page. */}
      {work.media.kind === "video" && (
        <motion.section
          className="case-v4__media"
          aria-label={`${work.title} demo`}
          variants={reduce ? undefined : RISE}
        >
          <CaseMedia work={work} />
        </motion.section>
      )}

      {/* Stack — the full list, clean row of chips. */}
      <motion.section
        className="case-v4__stack-section"
        aria-label="Tech stack"
        variants={reduce ? undefined : RISE}
      >
        <ul className="case-stack-v4">
          {work.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </motion.section>

      {/* External links — Visit live / View code. */}
      {work.links.length > 0 && (
        <motion.nav
          className="case-v4__links"
          aria-label="Project links"
          variants={reduce ? undefined : RISE}
        >
          {work.links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="case-link-v4"
            >
              <span>{label}</span>
              <span className="case-link-v4__icon" aria-hidden>
                <ArrowUpRight />
              </span>
            </a>
          ))}
        </motion.nav>
      )}

      {/* Footer nav — wrap-around prev/next + back to the grid. */}
      <motion.nav
        className="case-v4__nav"
        aria-label="More projects"
        variants={reduce ? undefined : RISE}
      >
        <Link
          href={`/works/${prev.slug}`}
          className="case-v4__nav-link case-v4__nav-link--prev"
        >
          <span className="case-v4__nav-dir">Previous</span>
          <span className="case-v4__nav-title">{prev.title}</span>
        </Link>

        <Link href="/#works" className="case-v4__nav-back">
          Back to all work
        </Link>

        <Link
          href={`/works/${next.slug}`}
          className="case-v4__nav-link case-v4__nav-link--next"
        >
          <span className="case-v4__nav-dir">Next</span>
          <span className="case-v4__nav-title">{next.title}</span>
        </Link>
      </motion.nav>
    </motion.main>
  );
}

/** The hero cover: photographed still bleeding right, or the typographic plate for the poster kind. */
function CaseCover({ work }: { work: FeaturedWork }) {
  const still =
    work.media.kind === "video" ? work.cover ?? work.media.poster : work.cover;

  if (work.media.kind === "poster") {
    return (
      <div
        className="case-plate-v4 case-plate-v4--cover"
        style={{ backgroundColor: work.media.tint }}
        aria-hidden
      >
        <span className="case-plate-v4__word">{work.media.word}</span>
        <span className="case-plate-v4__caption">{work.media.caption}</span>
      </div>
    );
  }

  return still ? (
    // Editorial bleed image; next/image's wrapper fights the crop treatment.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="case-v4__cover-img"
      src={still}
      alt={work.coverAlt ?? `${work.title} — project cover`}
      draggable={false}
    />
  ) : null;
}

/** Media at size: the demo video (only rendered for video-kind works — see the guard in CaseView). */
function CaseMedia({ work }: { work: FeaturedWork }) {
  if (work.media.kind !== "video") return null;
  return (
    <video
      className="case-v4__video"
      src={work.media.src}
      poster={work.media.poster}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={`${work.title} demo`}
    />
  );
}
