"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { PratiushMain } from "@/components/vectors/PratiushMain";

/**
 * The nav's wordmark — the persistent identity anchor now that the hero name morphs into
 * PROJECTS instead of docking up here. On the landing it stays hidden while the big name
 * owns the stage, then scrub-reveals as the name departs (mid-morph). On pages with no
 * hero it's simply always there.
 */
export function NavLogo() {
  const { scrollY } = useScroll();
  // Default to "hero present" so the landing's first paint is correct (logo hidden at the
  // top); pages without a hero correct themselves a frame later (hidden → shown).
  const [hasHero, setHasHero] = useState(true);
  const vh = useRef(800);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHasHero(!!document.querySelector(".hero-root-v3"));
    });
    const set = () => {
      vh.current = Math.max(1, window.innerHeight);
    };
    set();
    window.addEventListener("resize", set);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", set);
    };
  }, []);

  // Scrubbed reveal tied to the morph window (the hero pin starts at scrollY 0, so plain
  // scrollY is the same clock): in by ~0.7·vh, while the name is mid-flight.
  const opacity = useTransform(scrollY, (v) =>
    Math.min(1, Math.max(0, (v / vh.current - 0.45) / 0.25)),
  );
  const y = useTransform(scrollY, (v) =>
    (1 - Math.min(1, Math.max(0, (v / vh.current - 0.45) / 0.25))) * 8,
  );

  return (
    <motion.span
      className="nav-logo-v4"
      style={hasHero ? { opacity, y } : undefined}
      aria-hidden
    >
      <PratiushMain aria-hidden />
    </motion.span>
  );
}
