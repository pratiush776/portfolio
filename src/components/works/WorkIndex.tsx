"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { archive, featured, type FeaturedWork } from "@/data/works";
import { ArrowUpRight } from "@/components/icons";
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
      <div className="projects-title">
        <h2 className="projects-word display">Projects</h2>
      </div>

      <div className="work-grid">
        {featured.map((work, index) => (
          <motion.article key={work.slug} {...reveal(index)}>
            <Link href={`/works/${work.slug}`} className="work-card__link">
              <div className="frame frame--wide">
                <Cover work={work} />
              </div>
              <div className="work-card__body">
                <h3 className="work-card__title h2">
                  <span className="underline-link">{work.title}</span>
                  <ArrowUpRight
                    className="work-card__arrow"
                    width="22"
                    height="22"
                    aria-hidden
                  />
                </h3>
                <p className="work-card__desc">{work.description}</p>
                <p className="work-card__meta">
                  {work.role} · {work.year}
                </p>
                <p className="work-card__stack">
                  {work.stack.slice(0, 3).join(" · ")}
                </p>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      <motion.div className="mt-[100px]" {...reveal(0)}>
        <h3 className="archive__title">Also built</h3>
        <ul className="archive__list">
          {archive.map((item) => {
            const content = (
              <>
                <span className="archive__name h3">{item.title}</span>
                <span className="archive__note">{item.note}</span>
                <span className="archive__year">{item.year}</span>
                {item.href && (
                  <ArrowUpRight
                    className="archive__arrow"
                    width="16"
                    height="16"
                    aria-hidden
                  />
                )}
              </>
            );

            return (
              <li key={item.title} className="archive__row">
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="archive__link"
                  >
                    {content}
                  </a>
                ) : (
                  <div className="archive__link">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
