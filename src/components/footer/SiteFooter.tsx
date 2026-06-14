"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { INTRO_EASE } from "@/lib/intro";

/**
 * The ask — the close. The page's only dark surface: a deep plum sheet with rounded
 * shoulders that reads as the final curtain after the warm field. One oversized serif
 * headline (mask-rise on arrival), the email front and centre, and a quiet meta row.
 * No section label — the curtain speaks for itself.
 */
const EASE = INTRO_EASE;

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

const lineRise: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

const HEADLINE_LINES = ["Tell me what", "you’re building."];

export function SiteFooter() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="footer-v4" id="contact">
      <motion.div
        className="footer-v4__inner"
        variants={reduce ? undefined : stagger}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: "0px 0px -25% 0px" }}
      >
        <h2 className="footer-v4__headline">
          {HEADLINE_LINES.map((line) => (
            <span key={line} className="footer-v4__line">
              <motion.span
                className="footer-v4__line-inner"
                variants={reduce ? undefined : lineRise}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.a
          className="footer-v4__email"
          href="mailto:pratiush776@gmail.com"
          variants={reduce ? undefined : rise}
        >
          pratiush776@gmail.com
        </motion.a>

        <motion.div className="footer-v4__meta" variants={reduce ? undefined : rise}>
          <nav className="footer-v4__links" aria-label="Profiles">
            <a
              href="https://github.com/pratiush776"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-v4__link"
            >
              <span>GitHub</span>
              <span className="footer-v4__link-icon" aria-hidden>
                <ArrowUpRight />
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/pratiush-k-810324223"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-v4__link"
            >
              <span>LinkedIn</span>
              <span className="footer-v4__link-icon" aria-hidden>
                <ArrowUpRight />
              </span>
            </a>
            <a
              href="/CV.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-v4__link"
            >
              <span>Resume</span>
              <span className="footer-v4__link-icon" aria-hidden>
                <ArrowUpRight />
              </span>
            </a>
          </nav>
          <p className="footer-v4__colophon">
            <span>Based in USA</span>
            <span>© {year} Pratiush Karki</span>
          </p>
        </motion.div>
      </motion.div>
      <div className="footer-v4__grain" aria-hidden />
    </footer>
  );
}
