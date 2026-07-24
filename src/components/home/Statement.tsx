"use client";

import { motion, useReducedMotion } from "motion/react";

import { EASE, RISE } from "@/lib/motion";

/**
 * A single line of voice between the work and the capability list — a centered breather that
 * breaks the stacked lists into distinct beats. Set in the text face at statement scale; the
 * three-face rule holds (the break is scale + centering, not a new serif).
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
    <section className="section gutter measure">
      <motion.p className="statement" {...reveal}>
        I turn rough ideas into polished products.
      </motion.p>
    </section>
  );
}
