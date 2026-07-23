"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { EASE, RISE } from "@/lib/motion";

/**
 * The ask, and the page's only inverted surface — ink field, bone text. The headline
 * lines rise out of their own overflow-hidden boxes; everything else uses the shared rise.
 */
const STAGGER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const rise: Variants = {
  hidden: RISE.hidden,
  visible: { ...RISE.visible, transition: { duration: 0.8, ease: EASE } },
};

const lineRise: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

const HEADLINE_LINES = ["Tell me what", "you're building."];

const PROFILES = [
  { label: "GitHub", href: "https://github.com/pratiush776" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pratiush-k-810324223",
  },
  { label: "Resume", href: "/CV.pdf" },
];

export function SiteFooter() {
  const reduce = useReducedMotion() ?? false;
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <motion.div
        className="section gutter measure"
        variants={reduce ? undefined : STAGGER}
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, margin: "0px 0px -25% 0px" }}
      >
        <h2 className="footer__headline display-section">
          {HEADLINE_LINES.map((line) => (
            <span key={line} className="footer__line">
              <motion.span
                className="footer__line-inner"
                variants={reduce ? undefined : lineRise}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        <motion.a
          className="footer__email"
          href="mailto:pratiush776@gmail.com"
          variants={reduce ? undefined : rise}
        >
          <span className="underline-link">pratiush776@gmail.com</span>
        </motion.a>

        <motion.div
          className="footer__meta"
          variants={reduce ? undefined : rise}
        >
          <nav className="footer__links" aria-label="Profiles">
            {PROFILES.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="note"
              >
                <span className="underline-link">{label}</span>
                <ArrowUpRight width="12" height="12" aria-hidden />
              </a>
            ))}
          </nav>
          <p className="footer__colophon label">
            <span>Based in USA</span>
            <span>© {year} Pratiush Karki</span>
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
