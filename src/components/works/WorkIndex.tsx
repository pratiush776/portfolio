"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { ProjectsCue } from "@/components/home/ProjectsCue";
import { archive, featured, type FeaturedWork } from "@/data/works";
import { EASE, RISE } from "@/lib/motion";

/**
 * The work. Four featured builds as frames in a two-up spread — each whole cell links to
 * its case page — followed by the smaller pieces as text rows.
 *
 * Frames are 4/3: the stills are landscape product shots, and a square crop cuts them in
 * half. They sit greyscale until hovered (see .frame__media).
 */
function Cover({ work }: { work: FeaturedWork }) {
  // A dedicated still where one exists, else the video's own poster frame.
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
    // The frame crops via overflow:hidden and the hover transform drives this element
    // directly; next/image's wrapper fights both.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="frame__media"
      src={still}
      alt={work.coverAlt ?? `${work.title} — project cover`}
      draggable={false}
    />
  ) : null;
}

export function WorkIndex() {
  const reduce = useReducedMotion() ?? false;

  const reveal = (index: number) =>
    reduce
      ? {}
      : {
          initial: RISE.hidden,
          whileInView: RISE.visible,
          viewport: { once: true, margin: "0px 0px -12% 0px" },
          transition: { duration: 0.8, ease: EASE, delay: (index % 2) * 0.08 },
        };

  return (
    <section id="work" className="work-section gutter measure" tabIndex={-1}>
      {/* The section's real heading, at full display scale. Its own container so the
          `cqi`-based --display-size resolves against the same measure the hero uses. */}
      <div className="projects-title">
        <ProjectsCue />
      </div>

      <div className="work-grid">
        {featured.map((work, index) => (
          <motion.article key={work.slug} {...reveal(index)}>
            <Link href={`/works/${work.slug}`}>
              <div className="frame frame--wide">
                <Cover work={work} />
              </div>
              <h3 className="work-card__title h2">
                <span className="underline-link">{work.title}</span>
              </h3>
              <p className="work-card__meta note muted">
                {work.year} · {work.role}
              </p>
            </Link>
          </motion.article>
        ))}
      </div>

      <motion.div className="mt-[100px]" {...reveal(0)}>
        <h3 className="label muted">Also built</h3>
        <ul className="rows mt-[30px]">
          {archive.map((item) => (
            <li key={item.title} className="row">
              <span className="row__line h3">
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-link"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </span>
              <span className="row__sub prose">{item.note}</span>
              <span className="label muted">{item.year}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
