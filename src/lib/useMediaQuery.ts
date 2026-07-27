"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a media query without a hydration mismatch: the server always answers `false`, and the
 * client corrects itself after hydration. Every caller must therefore treat `false` as "not yet
 * known" and render the plainer branch — which is the right default anyway, since the plainer
 * branch is the one that works everywhere.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
