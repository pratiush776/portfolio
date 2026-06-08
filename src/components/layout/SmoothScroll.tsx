"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore } from "react";

/**
 * Root smooth-scroll provider (Lenis). The point of Lenis here is to feed a smoothed
 * scroll position into the Featured Works scrub (motion/react `useScroll`), so the sticky
 * fold glides instead of stepping.
 *
 * Respects `prefers-reduced-motion`: when reduced motion is requested we render children
 * with native scrolling and skip Lenis. `useSyncExternalStore` reads the media query
 * without a hydration mismatch (server snapshot assumes motion is allowed; the client
 * corrects after hydration).
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
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
