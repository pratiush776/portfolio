"use client";

import Link from "next/link";
import { useScroll } from "motion/react";
import { useRef } from "react";

import { ArrowUpRight } from "@/components/icons";
import { works } from "@/data/works";
import { StickyWorkCard } from "./StickyWorkCard";

/**
 * Featured Works — a stacking gallery. A big, bold, left-aligned title pins near the top and
 * stays in view while 3–4 centered cards pile up beneath it (see StickyWorkCard), then
 * releases. Ends in a minimal "more works" link.
 *
 * The whole stack is driven by ONE section-level scroll progress (`useScroll` against the
 * stack wrapper, start→end), passed to each card. Deterministic — no per-card inView gating.
 */
export function FeaturedWorks() {
  const total = works.length;
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="works-v4" aria-labelledby="works-heading">
      <div className="works-v4__inner">
        <div className="works-v4__head">
          <h2 id="works-heading" className="works-v4__title">
            Featured Works
          </h2>
        </div>

        <div ref={stackRef} className="works-v4__stack">
          {works.map((work, index) => (
            <StickyWorkCard
              key={work.title}
              work={work}
              index={index}
              total={total}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      <div className="works-v4__outro">
        <Link href="#" className="works-more-v4" aria-label="See more works">
          <span className="works-more-v4__label">more works</span>
          <span className="works-more-v4__icon" aria-hidden>
            <ArrowUpRight />
          </span>
        </Link>
      </div>
    </section>
  );
}
