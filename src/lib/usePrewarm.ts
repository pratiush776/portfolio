"use client";

import { useEffect } from "react";

import { COLD_START_URLS, warmColdStarts } from "@/lib/warmup";

/**
 * Starts the sleeping demos booting while the visitor is still looking around. See [warmup] for
 * what is pinged and why it costs us nothing.
 *
 * TIMED AGAINST TWO OPPOSING PRESSURES. Earlier is better — every second of head start is a
 * second off the wait — but the first moments of a load belong to the intro, which is racing the
 * portrait and four font files and holds its curtain until they land. So this waits for the
 * browser to be idle, with a short timeout so a page that never idles still gets warmed within a
 * couple of seconds. Even the worst case leaves most of a 21s boot overlapping the time a visitor
 * spends reading.
 *
 * ONCE PER PAGE LOAD, via a module-level flag: it survives a remount, so StrictMode's doubled
 * effect in development does not double the requests, and a client-side navigation into a case
 * page does not re-ping servers that are already awake from the landing.
 *
 * Skipped entirely on Save-Data, where the visitor has told the browser not to spend bandwidth on
 * anything speculative — which is exactly what this is.
 */

let warmed = false;

export function usePrewarm() {
  useEffect(() => {
    if (warmed || COLD_START_URLS.length === 0) return;

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    warmed = true;

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => warmColdStarts(), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(() => warmColdStarts(), 1200);
    return () => window.clearTimeout(id);
  }, []);
}
