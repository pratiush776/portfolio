"use client";

import { motion, useReducedMotion } from "motion/react";

import { capabilities } from "@/data/capabilities";
import { EASE, RISE } from "@/lib/motion";

/**
 * What I do — four domains as plain text rows. The section title is set at display scale;
 * the rows themselves stay quiet so the title does the work.
 */
export function Capabilities() {
  const reduce = useReducedMotion() ?? false;

  const reveal = reduce
    ? {}
    : {
        initial: RISE.hidden,
        whileInView: RISE.visible,
        viewport: { once: true, margin: "0px 0px -15% 0px" },
        transition: { duration: 0.8, ease: EASE },
      };

  return (
    <section className="section gutter measure">
      <motion.h2 className="display-section" {...reveal}>
        What I do
      </motion.h2>

      <motion.ul className="rows mt-[50px]" {...reveal}>
        {capabilities.map((capability) => (
          <li key={capability.id} className="row">
            <span className="row__line h3">{capability.line}</span>
            <span className="row__sub prose">{capability.sub}</span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
