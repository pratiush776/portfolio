"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { cancelFrame, frame, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { useIntro } from "@/components/intro/IntroContext";

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
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { locked } = useIntro();
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

  // The intro holds the page, and this is the half of that lock CSS cannot do. `overflow: clip` on
  // <html> stops the document scrolling, but Lenis keeps its own target position and would go on
  // accumulating wheel delta behind the curtain — then spend all of it at once the moment the lock
  // came off. Stopping the instance is what makes the held page actually still.
  useEffect(() => {
    const instance = lenis.current?.lenis;
    if (!instance) return;
    if (locked) instance.stop();
    else instance.start();
  }, [locked]);

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
        // 0.13, matched from adcker.com — the reference for how this should feel. Lenis damps
        // frame-rate independently with lambda = lerp × 60, so this is a settling time constant of
        // 1/7.8 ≈ 128ms against the 167ms of the 0.1 we had: the glide keeps its weight but stops
        // trailing the wheel, which is the whole difference between inertial and floaty.
        lerp: 0.13,
        smoothWheel: true,
        autoRaf: false,
        // In-page links glide instead of jumping. Off by default, which left the nav's `/#work`
        // and `/#contact` as the only hard cuts on a page whose whole character is the glide —
        // Lenis' handler matches the `/#…` form these use, so it is one flag away. The `<Link>`s
        // pass `scroll={false}` so Next's own router scroll doesn't race this to the same target.
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
