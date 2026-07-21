"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { featured, type FeaturedWork } from "@/data/works";
import { INTRO_EASE } from "@/lib/intro";

/**
 * The projects section — a clean, aligned MAGAZINE SPREAD: all four featured works on the continuous
 * SectionAurora field, no pinning and no scroll-jacking. Each cell is a whole-cell link to its dedicated
 * /works/[slug] case page. The layout is a disciplined TWO-UP grid with equal, generously-sized covers;
 * the right column drops a single CONSISTENT editorial beat (see .projects-index-v4__cell:nth-child(even))
 * so the spread has rhythm without reading ragged. The morphed PROJECTS title from the hero already
 * titles this section (it holds as the intro while cards compose beneath it, then scrolls away
 * naturally), so there is NO dry "Selected Work" eyebrow (show, don't tell); a real visually-hidden
 * "Selected Work" eyebrow (show, don't tell); a real visually-hidden <h2> keeps the outline honest.
 */

// One gentle rise+fade per cell on first view, staggered by DOM order via a per-cell delay. INTRO_EASE
// (the site's hard-landing curve) matches every other reveal; reduced motion drops the transform.
const RISE: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: INTRO_EASE, delay: i * 0.08 },
  }),
};

/** The cover face for a cell: the photographed still where one exists, or a designed typographic plate
    for the poster-kind work (Private Law RAG) — a deliberate cover, never a blank. */
function CoverFace({ work }: { work: FeaturedWork }) {
  // Video works show a still: the dedicated `cover` where present, else the video's own poster frame
  // (Whisk It All has no cover still — its poster is the honest stand-in).
  const still =
    work.media.kind === "video" ? work.cover ?? work.media.poster : work.cover;

  if (work.media.kind === "poster") {
    return (
      <div
        className="projects-index-v4__plate"
        style={{ backgroundColor: work.media.tint }}
        aria-hidden
      >
        <span className="projects-index-v4__plate-word">{work.media.word}</span>
        <span className="projects-index-v4__plate-caption">
          {work.media.caption}
        </span>
      </div>
    );
  }

  return still ? (
    // The frame crops via overflow:hidden and the hover scale transforms this img directly;
    // next/image's wrapper fights the crop/transform.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="projects-index-v4__img"
      src={still}
      alt={work.coverAlt ?? `${work.title} — project cover`}
      draggable={false}
    />
  ) : null;
}

export function ProjectsIndex() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section
      id="works"
      className="projects-index-v4"
      aria-label="Projects"
      tabIndex={-1}
    >
      {/* Real heading so the decorative morphed PROJECTS doesn't leave a hole in the outline. */}
      <h2 className="visually-hidden">Projects</h2>

      <div className="projects-index-v4__grid">
        {featured.map((work, index) => {
          return (
            <motion.article
              key={work.slug}
              className="projects-index-v4__cell"
              custom={index}
              variants={reduce ? undefined : RISE}
              initial={reduce ? false : "hidden"}
              whileInView={reduce ? undefined : "visible"}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            >
              <Link
                href={`/works/${work.slug}`}
                className="projects-index-v4__link"
              >
                <div className="projects-index-v4__cover">
                  <CoverFace work={work} />
                </div>
                <h3 className="projects-index-v4__title">{work.title}</h3>
                <p className="projects-index-v4__meta">
                  {work.year} · {work.role}
                </p>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
