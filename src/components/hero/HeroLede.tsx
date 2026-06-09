"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";

import { LocationPin } from "@/components/icons";
import { PratiushMain } from "@/components/vectors/PratiushMain";

/**
 * The left-aligned hero lockup: eyebrow → (wordmark) → tagline, plus a bottom meta strip
 * (the credential label, left / locator, right). The tagline's trailing asterisk is a footnote
 * mark whose matching mark sits on the bottom-left label.
 *
 * The wordmark is NOT rendered here — it's the layout-level <BrandMark/> that morphs into the
 * nav on scroll. This component reserves its footprint with an invisible ghost
 * ([data-brand-hero]) so the copy flows around it AND <BrandMark/> has a rect to measure.
 *
 * Two motion layers, on purpose:
 *  • ENTRANCE — a one-shot staggered fade-up of the copy on mount (the "show skill via type +
 *    motion" beat). The ghost is deliberately NOT animated, so <BrandMark/>'s mount-time
 *    measurement reads its settled position.
 *  • EXIT — the whole cluster fades + drifts up with scroll, finishing BEFORE the wordmark
 *    finishes docking (fade ≈ 0.3·vh < morph 0.4·vh in BrandMark) so nothing crosses it.
 * Exit opacity lives on the parent; entrance opacity lives on the children — different nodes,
 * so they compose instead of fighting for the same property.
 */
const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

export function HeroLede() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const fadeDist = useRef(500);

  useEffect(() => {
    const set = () => {
      fadeDist.current = Math.max(1, window.innerHeight * 0.3);
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  const opacity = useTransform(scrollY, (v) => Math.max(0, 1 - v / fadeDist.current));
  const y = useTransform(scrollY, (v) => -Math.min(40, (v / fadeDist.current) * 40));

  return (
    <motion.div
      className="hero-cluster-v4"
      // Reduced motion: drop the scroll-driven exit fade/drift entirely (was running for everyone).
      style={{ opacity: reduce ? undefined : opacity, y: reduce ? undefined : y }}
      variants={reduce ? undefined : container}
      initial={reduce ? undefined : "hidden"}
      animate={reduce ? undefined : "visible"}
    >
      {/* The page's real heading for a11y/SEO — the visible wordmark is decorative SVG. */}
      <h1 className="visually-hidden">Pratiush — Product-Minded Software Engineer</h1>

      <motion.p className="hero-eyebrow-v4" variants={reduce ? undefined : item} aria-hidden>
        Hi, I&apos;m
      </motion.p>

      {/* Reserves the wordmark's space + gives <BrandMark/> its start rect (NOT animated).
          Under reduced motion the wordmark doesn't fly in from <BrandMark/> (which then just sits
          docked in the nav), so render a STATIC one here to keep the hero name. */}
      <div className="hero-brand-ghost" data-brand-hero aria-hidden>
        {reduce ? <PratiushMain aria-hidden /> : null}
      </div>

      <motion.p className="hero-tagline-v4" variants={reduce ? undefined : item}>
        I turn ideas into polished products.
        {/* Footnote ref — points to the credential in the bottom-left label (matching mark). */}
        <span className="hero-tagline-v4__mark" aria-hidden>
          *
        </span>
      </motion.p>

      {/* Bottom-left label = the footnote the tagline's asterisk refers to. */}
      <motion.p className="hero-roles-v4" variants={reduce ? undefined : item}>
        <span className="hero-roles-v4__mark" aria-hidden>
          *
        </span>
        Product-Minded Software Engineer
      </motion.p>

      <motion.span
        className="hero-meta-v4"
        aria-label="Based in USA"
        variants={reduce ? undefined : item}
      >
        <LocationPin aria-hidden />
        <span>Based in USA</span>
      </motion.span>
    </motion.div>
  );
}
