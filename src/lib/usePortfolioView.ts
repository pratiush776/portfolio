"use client";

import { useEffect, useRef } from "react";

import {
  addPath,
  bankEngagement,
  closeVisit,
  describeDuration,
  describeGap,
  openVisit,
  takeAbandonedVisit,
  type PendingVisit,
} from "@/lib/visitor";
import { submitToWeb3Forms } from "@/lib/web3forms";

/**
 * Emails Pratiush about a visit to the portfolio — once per visit, when it is actually over.
 *
 * SENT ON THE WAY OUT, NOT ON ARRIVAL. v4 sent on mount, which is why the mail could only say that
 * somebody was here: on arrival there is nothing else to know yet. How long they stayed, what they
 * read and whether they went straight to one project are all facts about a visit that has already
 * happened, so the summary is assembled across the visit (see [visitor]) and sent at the end.
 *
 * WHEN IS A VISIT OVER? Not when the tab is hidden — that was this hook's real bug. Every demo
 * link on the site opens in a new tab, so the visitor most worth hearing about, the one who tries
 * the work, hides this tab halfway through and comes back. Reporting at that moment described the
 * visit up to the click and threw away everything after it.
 *
 * So hiding starts a CLOCK rather than ending anything. A hidden page is still a running page, so
 * it can wait and see: come back inside the grace period and the timer is cancelled and the visit
 * simply continues, with the pages read afterwards counted like any others. Stay away past it and
 * they are gone, and the summary goes out with everything up to the point they left.
 *
 * `pagehide` still sends immediately, because that fires when the page is genuinely going away —
 * closing the tab, or following a link off the site in this same tab — and there is no waiting to
 * be done and no time to do it in.
 *
 * The one case neither covers is a phone discarding a backgrounded tab before the timer fires.
 * [takeAbandonedVisit] catches those on the visitor's next load, which turns a silently lost visit
 * into one reported late.
 *
 * `keepalive` is what lets the request outlive the page that started it. An ordinary fetch is
 * cancelled the moment the document goes away, which for a request sent at unload is every time.
 *
 * ENGAGED TIME, NOT WALL TIME. The clock runs while the tab is in front of them and stops when it
 * is not, so neither a tab left open in the background nor the time spent inside a demo counts as
 * time reading this site.
 *
 * One email per visit is enforced in the record, not here: [closeVisit] marks the visit sent in
 * the same write that hands it over, so no ordering of hide, show, reload and unload can produce a
 * second one.
 */

/**
 * How long someone may be away before the visit is called over. Long enough to sit through a cold
 * Render boot and then genuinely use the demo — the whole point of the grace period — and short
 * enough that a visit which really has ended is reported while it is still news.
 */
const GRACE_MS = 10 * 60 * 1000;

/** Guards the once-per-load work against StrictMode's doubled effect in development. */
let opened = false;

export function usePortfolioView(pathname: string) {
  // The moment the tab last became visible. Null while hidden, which is also what stops two hides
  // in a row from banking the same stretch of time twice.
  const visibleSince = useRef<number | null>(null);

  useEffect(() => {
    if (opened) return;
    opened = true;

    const now = Date.now();

    // Before anything else: a visit from a previous session that never got to report itself.
    const abandoned = takeAbandonedVisit(now);

    openVisit(now, document.referrer, pathname);
    visibleSince.current = document.visibilityState === "visible" ? now : null;

    const report = (visit: PendingVisit, endedAt: number, late = false) => {
      const previous = visit.previousVisit;
      const returning = previous !== null;
      const standing = returning
        ? `Returning visitor — visit ${visit.visitNumber}, last seen ${describeGap(
            previous,
            endedAt,
          )} ago`
        : "New visitor — first time in this browser";

      submitToWeb3Forms({
        // Kept prefixed with the old subject so any inbox filter on it still matches, with the
        // standing appended because that is the part worth seeing without opening the mail.
        subject: `Portfolio View Notification — ${
          returning ? `returning visitor (${visit.visitNumber})` : "new visitor"
        }`,
        from_name: "Portfolio Viewer",
        from_email: "portfolio-view@notification.com",
        message: [
          `Visit ended ${new Date(endedAt).toLocaleString("en-US", {
            timeZone: "America/New_York",
          })} EST`,
          ...(late
            ? ["(reported late — their browser closed before it could be sent)"]
            : []),
          "",
          standing,
          `Time on site: ${describeDuration(visit.engagedMs)} (tab in front of them)`,
          `Came from: ${visit.referrer || "direct — typed, bookmarked, or an app with no referrer"}`,
          `Landed on: ${visit.paths[0]}`,
          `Pages read (${visit.paths.length}): ${visit.paths.join(" → ")}`,
          "",
          "Counted in the visitor's own browser, so it cannot see a different device, a private",
          "window, or cleared site data — a returning visitor really has been here before, but a",
          "new one may only be new to this browser.",
        ].join("\n"),
      });
    };

    if (abandoned) report(abandoned, now, true);

    let grace: number | undefined;
    const cancelGrace = () => {
      if (grace !== undefined) window.clearTimeout(grace);
      grace = undefined;
    };

    /** Bank whatever time is owed, then end the visit and report it if nobody has yet. */
    const finish = () => {
      cancelGrace();
      const at = Date.now();
      const since = visibleSince.current;
      visibleSince.current = null;
      if (since !== null) bankEngagement(at, at - since);

      const visit = closeVisit(at);
      if (visit) report(visit, at);
    };

    const onVisibility = () => {
      const at = Date.now();

      if (document.visibilityState === "visible") {
        // They are back — the visit never ended. Whatever they do next still belongs to it.
        cancelGrace();
        visibleSince.current = at;
        return;
      }

      // Away, but not necessarily gone. Bank the time now so it cannot be lost, and let the clock
      // decide. The page keeps running while hidden, which is the whole reason this works.
      const since = visibleSince.current;
      visibleSince.current = null;
      if (since !== null) bankEngagement(at, at - since);

      cancelGrace();
      grace = window.setTimeout(finish, GRACE_MS);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", finish);

    return () => {
      cancelGrace();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", finish);
    };
    // Runs once for the life of the page. `pathname` is read at open time only; every later route
    // is picked up by the effect below, which is the one that watches it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side navigation does not reload anything, so each new route has to be noted as it is
  // reached. Skips the first run, which openVisit above has already recorded.
  const opening = useRef(true);
  useEffect(() => {
    if (opening.current) {
      opening.current = false;
      return;
    }
    addPath(Date.now(), pathname);
  }, [pathname]);
}
