"use client";

import { motion, useReducedMotion } from "motion/react";

import { reveal } from "@/lib/motion";

/**
 * The promise, placed as the lead-in to the work: a left-aligned line that hands off into the
 * PROJECTS section right below it, on the same gutter edge the display word's stem and the work
 * frames sit on. Set in the text face at statement scale; the three-face rule holds (the beat is
 * scale + placement, not a new serif).
 */
export function Statement() {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="gutter measure">
      <motion.p className="statement editorial" {...(reduce ? {} : reveal())}>
        I turn rough ideas into polished products.
      </motion.p>
    </section>
  );
}
