"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { EASE, RISE } from "@/lib/motion";

/**
 * The opening: the script greeting resting on the wordmark, the name at display scale, and
 * the role and statement beneath it, all on one left axis. It stops short of the fold on
 * purpose — the projects title below crops against the viewport edge and does the work a
 * scroll cue would. The cascade runs on mount; nothing here is tied to scroll.
 */
const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: RISE.hidden,
  visible: { ...RISE.visible, transition: { duration: 0.8, ease: EASE } },
};

/* The name is set letter by letter so the two jammed pairs can be opened individually.
   `openAfter` are the indices whose right side needs air: T→I and I→U. */
const NAME = "Pratiush";
const OPEN_AFTER = new Set([3, 4]);

export function Hero() {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.header
      className="hero gutter measure"
      variants={reduce ? undefined : STAGGER}
      initial={reduce ? false : "hidden"}
      animate={reduce ? undefined : "visible"}
    >
      <div className="hero__block">
        {/* Decorative — the heading below carries the real accessible name. */}
        <motion.p
          className="hero__greeting script"
          aria-hidden
          variants={reduce ? undefined : rise}
        >
          Hi, I&apos;m
        </motion.p>

        <motion.h1
          className="hero__name display"
          variants={reduce ? undefined : rise}
        >
          {NAME.split("").map((letter, i) => (
            <span
              key={i}
              className={OPEN_AFTER.has(i) ? "hero__name-open" : undefined}
            >
              {letter}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="hero__role note"
          variants={reduce ? undefined : rise}
        >
          Software Engineer
        </motion.p>

        {/* Statement left, locator hard right on the same baseline — the row spans the
            measure so the block isn't a narrow column under a full-width name. */}
        <motion.div
          className="hero__voice"
          variants={reduce ? undefined : rise}
        >
          <p className="hero__tagline h3">
            Building thoughtful digital products.
          </p>
          <p className="hero__foot label muted">Open to relocation · USA</p>
        </motion.div>
      </div>
    </motion.header>
  );
}
