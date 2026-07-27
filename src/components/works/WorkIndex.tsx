"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { archive, featured } from "@/data/works";
import { ArrowUpRight } from "@/components/icons";
import { Cover, WorkCopy } from "@/components/works/WorkCard";
import { FeaturedStack } from "@/components/works/FeaturedStack";
import { EASE, RISE } from "@/lib/motion";
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
    <section id="work" className="work-section" tabIndex={-1}>
      {stacked ? (
        <FeaturedStack />
      ) : (
        <div className="gutter measure">
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
                    <WorkCopy work={work} />
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      <motion.div className="gutter measure work-archive" {...reveal(0)}>
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
              </li>
            );
          })}
        </ul>
      </motion.div>
    </section>
  );
}
