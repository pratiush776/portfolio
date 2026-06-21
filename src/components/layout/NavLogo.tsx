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
  // scrollY is the same clock). Re-ordered choreography: the thesis leads, so the name now morphs
  // LATER (ROLL_START ≈ 0.30 → ROLL_END ≈ 0.65 of a 220vh track; progress·1.2 = scrollY/vh). The
  // wordmark fades in as the name departs (mid-morph) and is fully in by the landing — window
  // scrollY/vh ∈ [0.50, 0.72] ≈ progress [0.42, 0.60].
  const opacity = useTransform(scrollY, (v) =>
    Math.min(1, Math.max(0, (v / vh.current - 0.5) / 0.22)),
  );
  const y = useTransform(scrollY, (v) =>
    (1 - Math.min(1, Math.max(0, (v / vh.current - 0.5) / 0.22))) * 8,
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
