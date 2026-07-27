"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import { EASE, RISE } from "@/lib/motion";

/**
 * The page's only inverted surface — ink field, bone text — and its sign-off. Contact and
 * status sit up top, filling the width; the first name then closes the page at display scale,
 * a bookend to the hero's opening "Pratiush". The name rises out of its own overflow-clip box;
 * everything else uses the shared rise. The giant name is decorative (the accessible name lives
 * in the nav, hero, and page title), so it is aria-hidden.
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
        <div className="footer__top">
          <motion.div
            className="footer__contact"
            variants={reduce ? undefined : rise}
          >
            <h2 className="footer__eyebrow label">Get in touch</h2>
            <a className="footer__email" href="mailto:pratiush776@gmail.com">
              <span className="underline-link">pratiush776@gmail.com</span>
            </a>
          </motion.div>

          <motion.div
            className="footer__status"
            variants={reduce ? undefined : rise}
          >
            <p className="footer__status-role">
              Full-stack developer
            </p>
            <p className="footer__status-line">Open to new opportunities</p>
            <p className="footer__status-line">
              Based in USA · open to relocation
            </p>
            <nav className="footer__links" aria-label="Profiles">
              {PROFILES.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__link note"
                >
                  <span className="underline-link">{label}</span>
                  <ArrowUpRight width="12" height="12" aria-hidden />
                </a>
              ))}
            </nav>
          </motion.div>
        </div>

        <div className="footer__name display" aria-hidden>
          <span className="footer__line">
            <motion.span
              className="footer__line-inner"
              variants={reduce ? undefined : lineRise}
            >
              Pratiush
            </motion.span>
          </span>
        </div>

        <motion.p
          className="footer__colophon label"
          variants={reduce ? undefined : rise}
        >
          © {year} Pratiush
        </motion.p>
      </motion.div>
    </footer>
  );
}
