"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";

import { EASE, RISE } from "@/lib/motion";

/**
 * The opening: the script greeting resting on the wordmark, the name at display scale, and
 * the bracketed portrait, role and statement beneath it, all on one left axis. It stops
 * short of the fold on purpose — the projects title below crops against the viewport edge
 * and does the work a scroll cue would. The cascade runs on mount; nothing is tied to scroll.
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
          aria-label="Pratiush Karki"
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

        {/* The bracketed portrait, then the meta as a column that brackets its height. The
            portrait is the only thing on the page that isn't ink or bone — its ground is
            transparent, so the square reads as a block of ink that resolves into a face up
            close. */}
        <motion.div
          className="hero__lockup"
          variants={reduce ? undefined : rise}
        >
          <span className="hero__bracket display">
            <span className="hero__bracket-paren--open" aria-hidden>
              )
            </span>

            <span className="hero__portrait">
              <Image
                src="/images/portrait_v2.png"
                alt="Portrait of Pratiush Karki"
                fill
                sizes="(max-width: 768px) 128px, 220px"
                priority
              />
            </span>

            <span aria-hidden>)</span>
          </span>

          {/* Role + statement bonded at the top, locator dropped to the bottom — the column
              spans the bracket so the text brackets the frame instead of huddling beside it. */}
          <div className="hero__meta">
            <div className="hero__meta-top">
              <p className="hero__role note">
                Full-stack developer
              </p>
              <p className="hero__tagline h3">
                I build and ship products across the full stack, AI, and design.
              </p>
            </div>
            <p className="hero__foot label muted">Open to relocation · USA</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
