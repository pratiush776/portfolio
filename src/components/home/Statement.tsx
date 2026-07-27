"use client";

import { motion, useReducedMotion } from "motion/react";

import { EASE, RISE } from "@/lib/motion";

/**
 * The promise, placed as the lead-in to the work: a left-aligned line that hands off into the
 * PROJECTS section right below it. Set in the text face at statement scale; the three-face rule
 * holds (the beat is scale + placement, not a new serif).
 */
export function Statement() {
  const reduce = useReducedMotion() ?? false;

  const reveal = reduce
    ? {}
    : {
        initial: RISE.hidden,
        whileInView: RISE.visible,
        viewport: { once: true, margin: "0px 0px -20% 0px" },
        transition: { duration: 0.8, ease: EASE },
      };

  return (
    <section className="gutter measure statement-lead">
      <motion.p className="statement" {...reveal}>
        I turn rough ideas into polished products.
      </motion.p>
    </section>
  );
}
