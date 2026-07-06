"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { STAGE0 } from "@/components/hero/heroTimeline";

/**
 * The nav's wordmark — the persistent identity anchor now that the hero name morphs into PROJECTS
 * instead of docking up here. Set as a text logotype in Fraunces (the ONE display serif) so the nav
 * identity reads in the SAME editorial voice as the big hero word, not a mismatched grotesque mark.
 * On the landing narrative track the big name owns the identity until it begins to change: the
 * wordmark stays hidden through the C0 travel + dock, then scrub-reveals as MORPH 1 (PRATIUSH →
 * PERSONA) begins — the moment the big word stops being "Pratiush," the nav takes over the name. On
 * any route with no narrative track (the /works pages), it's simply visible.
 *
 * It measures the SCRUBBED STAGE (`.narrative-stage-v4`), NOT the outer track: STAGE0's fractions are
 * fractions of the STAGE's scroll travel (the stage drives the master progress), and the stage's top is
 * the track's top, so `scrollY` = stage-progress × (stageHeight − vh). Keying off the outer track (which
 * now also spans the tall projects grid) would push the reveal far too late.
 */
export function NavLogo() {
  const { scrollY } = useScroll();
  // Default to "track present" so the landing's first paint is correct (logo hidden at the top);
  // routes WITHOUT a track flip to visible a frame later (see the fallback style below).
  const [hasTrack, setHasTrack] = useState(true);
  const vh = useRef(800);
  // The STAGE's total scroll length (offsetHeight − viewport). Measured, not hardcoded: the stage
  // height is the chain's master pacing knob (differs across breakpoints / reduced motion), so a
  // stale assumption is exactly what would fade the wordmark in while the big word is still the name
  // mid-chain — two identities on screen at once. STAGE0 (a fraction of PINNED_VH) maps onto it.
  const scroll = useRef(0);

  useEffect(() => {
    // Presence: the outer track marks "landing" (hide at top); the STAGE is what STAGE0 maps onto.
    const track = () =>
      document.querySelector<HTMLElement>(".narrative-track-v4");
    const stage = () =>
      document.querySelector<HTMLElement>(".narrative-stage-v4");
    const raf = requestAnimationFrame(() => {
      setHasTrack(!!track());
    });
    const set = () => {
      vh.current = Math.max(1, window.innerHeight);
      const el = stage();
      scroll.current = el ? Math.max(0, el.offsetHeight - vh.current) : 0;
    };
    set();
    window.addEventListener("resize", set);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", set);
    };
  }, []);

  // Scrubbed reveal keyed to MORPH 1: the identity leaves the big word the instant it starts changing,
  // so the wordmark returns across STAGE0's window mapped to real scroll px (STAGE0 is a fraction of
  // the track's total scroll travel). start = STAGE0.start · scroll; complete at STAGE0.end · scroll.
  const reveal = (v: number) => {
    const startPx = STAGE0.start * scroll.current;
    const endPx = STAGE0.end * scroll.current;
    if (endPx <= startPx) return 0;
    return Math.min(1, Math.max(0, (v - startPx) / (endPx - startPx)));
  };
  const opacity = useTransform(scrollY, (v) => reveal(v));
  const y = useTransform(scrollY, (v) => (1 - reveal(v)) * 8);

  return (
    <motion.span
      className="nav-logo-v4"
      style={hasTrack ? { opacity, y } : undefined}
      aria-hidden
    >
      Pratiush
    </motion.span>
  );
}
