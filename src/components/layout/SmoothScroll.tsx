"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";

import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Root smooth-scroll provider, and the page's single animation clock.
 *
 * Lenis and Motion each ship their own requestAnimationFrame loop, and left alone they run as two
 * independent passes in an order the browser doesn't guarantee. That is invisible while nothing is
 * scroll-scrubbed, but the featured deck reads `window.scrollY` every frame to place a card: when
 * the two loops fall out of step, the card is positioned from a scroll value Lenis is about to
 * change in the same frame, and the travel picks up a shimmer that no amount of easing removes.
 *
 * So Lenis' own loop is switched off (`autoRaf: false`) and driven from Motion's scheduler instead.
 * One clock, one ordering: scroll settles, then everything reading it updates.
 *
 * Under `prefers-reduced-motion` the children render with native scrolling and Lenis is skipped
 * entirely; the deck drops to its flat layout on the same signal, so nothing is left scrubbing.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lenis = useRef<LenisRef>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const update = ({ timestamp }: { timestamp: number }) => {
      lenis.current?.lenis?.raf(timestamp);
    };

    // `keepAlive` — the callback has to run every frame, not once.
    frame.update(update, true);
    return () => cancelFrame(update);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return <>{children}</>;

  return (
    // Lerp mode: each frame the scroll position eases toward the target by a fixed fraction —
    // a continuous inertial glide rather than a per-input timed animation, the feel the
    // reference scrolls with. Lower `lerp` floats heavier, higher is snappier and closer to
    // native; this is the one knob for the scroll character. Touch is left native (Lenis does
    // not sync touch by default), so phones keep their own momentum.
    <ReactLenis
      root
      ref={lenis}
      options={{
        lerp: 0.1,
        smoothWheel: true,
        autoRaf: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
