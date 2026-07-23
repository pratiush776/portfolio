"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

/**
 * Root smooth-scroll provider. Lenis runs its own RAF loop — nothing on the page is
 * scroll-scrubbed, so there is no second animation clock to keep in step with.
 *
 * Under `prefers-reduced-motion` the children render with native scrolling and Lenis is
 * skipped entirely. `useSyncExternalStore` reads the media query without a hydration
 * mismatch: the server assumes motion is allowed, the client corrects after hydration.
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

  if (prefersReducedMotion) return <>{children}</>;

  return (
    // Duration mode rather than lerp: each wheel input becomes one fixed animation, so a
    // quick flick doesn't drift past the section it was aimed at.
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 2),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}
