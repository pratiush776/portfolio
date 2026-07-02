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
  // The hero pin's scroll length (track − viewport). Measured, not hardcoded: the track height is
  // the chain's master pacing knob (and differs across breakpoints / reduced motion), and keying
  // the reveal off a stale assumption is exactly what would fade the wordmark in while the big
  // word is still pinned mid-chain — two identities on screen at once.
  const pin = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHasHero(!!document.querySelector(".hero-root-v3"));
    });
    const set = () => {
      vh.current = Math.max(1, window.innerHeight);
      const track = document.querySelector<HTMLElement>(".hero-track-v4");
      pin.current = track ? Math.max(0, track.offsetHeight - vh.current) : 0;
    };
    set();
    window.addEventListener("resize", set);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", set);
    };
  }, []);

  // Scrubbed reveal keyed to the UNPIN (the hero pin starts at scrollY 0, so scrollY − pin is
  // scroll travelled since release): the landed title starts riding up at the unpin, and the logo
  // returns over the ~7→31vh of scroll it takes the departing name to clear the nav band — the
  // same absolute feel the short pin had. Re-tune the 0.07/0.24 thresholds by eye.
  const reveal = (v: number) =>
    Math.min(1, Math.max(0, ((v - pin.current) / vh.current - 0.07) / 0.24));
  const opacity = useTransform(scrollY, (v) =>
    reveal(v),
  );
  const y = useTransform(scrollY, (v) => (1 - reveal(v)) * 8);

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
