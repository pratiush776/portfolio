"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Root smooth-scroll provider (Lenis) wired to GSAP. Lenis feeds a smoothed scroll position into the
 * pinned folds; GSAP's ScrollTrigger drives the scrubbed reveals. The two share ONE RAF loop: Lenis
 * runs with `autoRaf: false` and is ticked from `gsap.ticker`, and ScrollTrigger is updated on every
 * Lenis scroll — so the smoothed position and the trigger positions never desync (the canonical
 * Lenis↔ScrollTrigger pattern).
 *
 * Respects `prefers-reduced-motion`: when reduced motion is requested we render children with native
 * scrolling and skip Lenis (and the GSAP sync). `useSyncExternalStore` reads the media query without a
 * hydration mismatch (server assumes motion is allowed; the client corrects after hydration).
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // ONE RAF loop: drive Lenis from GSAP's ticker (ReactLenis runs with autoRaf:false below).
    const raf = (time: number) => {
      // gsap.ticker time is in seconds; Lenis.raf expects milliseconds.
      lenisRef.current?.lenis?.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger in lock-step with the smoothed Lenis position.
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    // Trigger positions depend on display fonts that reflow the hero — recompute now and once fonts
    // are ready (the same gate the intro clock uses).
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(raf);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return <>{children}</>;

  return (
    // Duration+easing mode (live-up.co.jp feel, softened): setting `duration` overrides lerp — each
    // wheel input becomes one fixed animation instead of an exponential drift. easeOutQuad over 1.2s
    // (vs live-up's easeOutCubic/1s) launches at ~1.7x average speed instead of 3x, so a quick flick
    // doesn't fly through the scrubbed folds. autoRaf:false — GSAP's ticker drives the RAF (above).
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 2),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        autoRaf: false,
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
