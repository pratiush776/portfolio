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
    // Lerp mode: each frame the scroll position eases toward the target by a fixed fraction —
    // a continuous inertial glide rather than a per-input timed animation, the feel the
    // reference scrolls with. Lower `lerp` floats heavier, higher is snappier and closer to
    // native; this is the one knob for the scroll character. Touch is left native (Lenis does
    // not sync touch by default), so phones keep their own momentum.
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
