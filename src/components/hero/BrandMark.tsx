"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { PratiushMain } from "@/components/vectors/PratiushMain";

/**
 * The PRATIUSH wordmark, mounted ONCE at the layout level so it persists across the whole
 * page (it IS the site logo). On the landing page it starts big in the hero and, as you
 * scroll, smoothly scales + lifts into the nav's logo slot, then rests there as the header
 * logo. On pages with no hero it just sits in the nav slot.
 *
 * How it lands pixel-correct: instead of hard-coding sizes, we MEASURE two markers —
 *   • [data-brand-hero] — an invisible ghost the hero reserves where the big wordmark sits,
 *   • [data-brand-nav]  — an invisible slot the nav reserves where the logo sits —
 * then linearly interpolate the fixed wordmark between those two rects by scroll progress.
 * Endpoint A (scroll 0) == the hero ghost exactly; endpoint B (scroll = MORPH_VH·vh) == the
 * nav slot exactly. Both the hero cluster and the nav anchor to the SAME left gutter, so the
 * horizontal drift is ~0 and the morph reads as a clean shrink-and-lift.
 *
 * transform-origin is top-left and the element is `position: fixed; top:0; left:0`, so the
 * interpolated (x, y) place the wordmark's top-left and `scale` shrinks it toward that corner.
 * pointer-events:none — the home link is the nav slot underneath.
 */

// Morph completes over this fraction of the first viewport of scrolling. Tunable: lower =
// snappier dock, higher = the wordmark lingers large longer before settling into the nav.
// Kept just BELOW HeroLede's exit-fade distance (0.3·vh) +headroom so the intro copy is gone
// before the wordmark finishes docking and nothing crosses it.
const MORPH_VH = 0.4;

type Geo = {
  hasHero: boolean;
  heroLeft: number;
  heroTop: number; // document-space top of the hero ghost (== viewport top at scrollY 0)
  heroW: number;
  navLeft: number;
  navTop: number; // viewport top of the nav slot (fixed → scroll-independent)
  navW: number;
  dist: number; // scroll distance over which the morph runs
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function BrandMark() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const geo = useRef<Geo>({
    hasHero: false,
    heroLeft: 0,
    heroTop: 0,
    heroW: 1,
    navLeft: 0,
    navTop: 0,
    navW: 1,
    dist: 1,
  });
  // width can't live in the transform (it's the element's intrinsic box that `scale` shrinks),
  // so it rides in state; `ready` gates the first paint until we've measured (no flash).
  const [box, setBox] = useState({ width: 0, ready: false });

  useLayoutEffect(() => {
    let raf = 0;

    const measure = (retries = 0) => {
      const nav = document.querySelector<HTMLElement>("[data-brand-nav]");
      if (!nav) return;
      const navR = nav.getBoundingClientRect();
      const hero = document.querySelector<HTMLElement>("[data-brand-hero]");
      const g = geo.current;

      if (hero) {
        const heroR = hero.getBoundingClientRect();
        // Guard against a stale/over-wide read (e.g. measured before the width clamp had
        // applied — what froze the wordmark full-bleed during HMR). The ghost can never
        // legitimately exceed ~0.92·viewport, so retry next frame instead of committing it.
        if (heroR.width > window.innerWidth * 0.92 && retries < 8) {
          raf = requestAnimationFrame(() => measure(retries + 1));
          return;
        }
        g.hasHero = true;
        g.heroLeft = heroR.left;
        g.heroTop = heroR.top + window.scrollY; // → document space, matches viewport at scroll 0
        g.heroW = heroR.width;
      } else {
        g.hasHero = false;
      }
      g.navLeft = navR.left;
      g.navTop = navR.top;
      g.navW = navR.width;
      g.dist = Math.max(1, window.innerHeight * MORPH_VH);
      setBox({ width: g.hasHero ? g.heroW : g.navW, ready: true });
    };

    // Synchronous first read (no first-paint flash); the guard + observers below correct any
    // transient or late layout shift rather than freezing on a bad value like before.
    measure();

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    // Re-measure when the markers actually change size (catches the HMR CSS-recompile reflow
    // that used to leave the wordmark stuck) and when web fonts settle.
    const ro = new ResizeObserver(() => measure());
    const heroEl = document.querySelector<HTMLElement>("[data-brand-hero]");
    const navEl = document.querySelector<HTMLElement>("[data-brand-nav]");
    if (heroEl) ro.observe(heroEl);
    if (navEl) ro.observe(navEl);
    document.fonts?.ready.then(() => measure()).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  // Reduced motion: pin progress at 1 → the wordmark sits statically docked in the nav (no
  // scroll-driven flight). The hero's big name is then provided statically by HeroLede's ghost.
  const progress = (v: number) =>
    reduce || !geo.current.hasHero ? 1 : clamp01(v / geo.current.dist);

  const x = useTransform(scrollY, (v) => lerp(geo.current.heroLeft, geo.current.navLeft, progress(v)));
  const y = useTransform(scrollY, (v) => lerp(geo.current.heroTop, geo.current.navTop, progress(v)));
  const scale = useTransform(scrollY, (v) =>
    geo.current.hasHero ? lerp(1, geo.current.navW / geo.current.heroW, progress(v)) : 1,
  );

  return (
    <motion.div
      className="brand-mark"
      aria-hidden
      style={{ x, y, scale, width: box.width || undefined }}
      initial={{ opacity: 0 }}
      animate={{ opacity: box.ready ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <PratiushMain aria-hidden />
    </motion.div>
  );
}
