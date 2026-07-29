import { works } from "@/data/works";

/**
 * The project demos that go to sleep, and the ping that wakes them.
 *
 * Render's free tier spins an instance down after a stretch with no traffic, and the next request
 * pays the boot: measured at 21s for the HomeDoc backend. A visitor who reaches a case page, reads
 * it, and clicks "Visit" is looking at a blank tab for twenty seconds, which reads as a broken
 * link rather than as a sleeping server. Nothing can make the boot faster — but it can be STARTED
 * earlier, while the visitor is still reading, so that by the time they click it is over.
 *
 * IT RUNS IN THE VISITOR'S BROWSER, which is the whole reason this is affordable. The requests go
 * browser → Render directly and never touch our own host, so no serverless function runs, no
 * execution time is billed, and Vercel's plan limits are not involved at any point. The same shape
 * as the view notification (see [usePortfolioView]) and for the same reason.
 *
 * DERIVED FROM THE WORK DATA rather than listed by hand, so a new Render-hosted project is warmed
 * the moment its link is added and a project that moves off Render drops out on its own. Anything
 * on Vercel (NILINK) or GitHub is skipped: those do not sleep, so a ping would be pure waste.
 */

/** Render free instances sleep. Extend this if a project ever lands somewhere else that does. */
const SLEEPS_WHEN_IDLE = /(^|\.)onrender\.com$/;

export const COLD_START_URLS: string[] = Array.from(
  new Set(
    works
      .flatMap((work) => work.links.map((link) => link.href))
      .filter((href) => {
        try {
          return SLEEPS_WHEN_IDLE.test(new URL(href).hostname);
        } catch {
          return false;
        }
      }),
  ),
);

/**
 * Fires all of them at once. In parallel and in no particular order, deliberately: they are
 * separate servers on separate hosts, so nothing is gained by sequencing them and a queue would
 * mean the last project's boot starts last — the opposite of what this is for.
 *
 * `no-cors` because none of these send CORS headers to this origin. The response comes back opaque
 * and unreadable, which is fine: the request still reaches the server, and waking it is the entire
 * point. There is no success to report and nothing to do on failure, so failures are swallowed —
 * an unhandled rejection in the console would be the only thing a visitor could ever notice.
 */
export function warmColdStarts(urls: string[] = COLD_START_URLS): void {
  for (const url of urls) {
    fetch(url, { mode: "no-cors", cache: "no-store" }).catch(() => {});
  }
}
