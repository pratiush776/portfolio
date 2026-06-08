"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

/**
 * Signature Statement — the v4 "manifesto" section. Pure typographic: the sentence IS the
 * section (no image), set in the editorial serif, centered, with one accent mark and one
 * line of microcopy. The page's quiet reveal — line-by-line mask-rise — so Featured Works
 * keeps the one big scroll move (see v4-handbook/signature-statement/04-motion-reveal.md).
 *
 * Copy is placeholder; edit `LINES` / the microcopy freely.
 */
const LINES = [
  "I like turning early ideas",
  "into polished experiences",
  "people can use.",
];

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const line: Variants = {
  hidden: { y: "115%" },
  visible: { y: "0%", transition: { duration: 0.8, ease: EASE } },
};

export function SignatureStatement() {
  const reduce = useReducedMotion();

  return (
    <section className="statement-v4" aria-labelledby="statement-heading">
      <p className="statement-v4__eyebrow">What I do</p>

      <motion.h2
        id="statement-heading"
        className="statement-v4__headline"
        variants={reduce ? undefined : container}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        {LINES.map((text, i) => (
          <span key={i} className="statement-v4__line">
            <motion.span
              className="statement-v4__line-inner"
              variants={reduce ? undefined : line}
            >
              {text}
              {i === LINES.length - 1 && (
                <span className="statement-v4__mark" aria-hidden>
                  *
                </span>
              )}
            </motion.span>
          </span>
        ))}
      </motion.h2>

      <a className="statement-v4__more" href="#">
        more about me
      </a>
    </section>
  );
}
