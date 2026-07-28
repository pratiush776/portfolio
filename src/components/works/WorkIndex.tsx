"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { archive, featured } from "@/data/works";
import { ArrowUpRight } from "@/components/icons";
import { kerned } from "@/lib/kerning";
import { Cover, WorkCopy } from "@/components/works/WorkCard";
import { FeaturedStack } from "@/components/works/FeaturedStack";
import { STAGGER, THRESHOLD, reveal, rise } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * The work. Three primary builds, then the archive: secondary case works (which link in to their
 * own case page) above the smaller external-only pieces, as text rows.
 *
 * The primary three get one of two treatments. On a desktop viewport they are a pinned deck
 * (see FeaturedStack) — the one scroll-scrubbed thing on the site. Anywhere narrower, and under
 * `prefers-reduced-motion`, they stay the flat two-up spread below: each whole cell links to its
 * case page, sides alternating row to row. Both read from the same `Cover` and `WorkCopy`, so
 * neither can quietly drift from the other.
 */
export function WorkIndex() {
  const reduce = useReducedMotion() ?? false;
  // False on the server and until hydration, so the flat spread is what ships and what renders
  // first. The section sits several screens down; nobody sees the upgrade happen.
  const wide = useMediaQuery("(min-width: 1024px)");
  const stacked = wide && !reduce;
  const enter = reduce ? {} : reveal();

  return (
    <section id="work" className="work-section" tabIndex={-1}>
      {stacked ? (
        <FeaturedStack />
      ) : (
        <div className="gutter measure">
          <div className="projects-title">
            {/* Split for optical spacing — the C and the T close to 39 units unkerned, the
                tightest join in either display word. aria-label carries the real text. */}
            <h2 className="projects-word display" aria-label="Projects">
              {kerned("Projects").map(({ char, style }, i) => (
                <span key={i} style={style}>
                  {char}
                </span>
              ))}
            </h2>
          </div>

          {/* Each row is a full-measure band, one per screen-ish, so they enter on their own as you
              reach them rather than on a shared cascade — there is never more than one of them in
              view to cascade against. */}
          <div className="work-grid">
            {featured.map((work) => (
              <motion.article key={work.slug} {...enter}>
                <Link href={`/works/${work.slug}`} className="work-card__link">
                  <div className="frame frame--wide">
                    <Cover work={work} />
                  </div>
                  <div className="work-card__body">
                    <WorkCopy work={work} />
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* The archive rows cascade, the way the capability rows above them do — a compact list is
          the one place on the page where several things ARE in view together, which is exactly
          where a sequence reads as a sequence instead of as a block landing. */}
      <motion.div
        className="gutter measure work-archive"
        variants={reduce ? undefined : STAGGER}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: THRESHOLD }}
      >
        <motion.h3 className="archive__title" variants={reduce ? undefined : rise}>
          Also built
        </motion.h3>
        <ul className="archive__list">
          {archive.map((item) => {
            const content = (
              <>
                <span className="archive__name h3">{item.title}</span>
                <span className="archive__note">{item.note}</span>
                <span className="archive__year label">{item.year}</span>
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
              <motion.li
                key={item.title}
                className="archive__row"
                variants={reduce ? undefined : rise}
              >
                {item.href ? (
                  item.internal ? (
                    <Link href={item.href} className="archive__link">
                      {content}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="archive__link"
                    >
                      {content}
                    </a>
                  )
                ) : (
                  <div className="archive__link">{content}</div>
                )}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
