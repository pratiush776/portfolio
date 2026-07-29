/**
 * What one visit was, assembled entirely in the visitor's own browser.
 *
 * The email used to be sent on arrival, which is why it could only ever say "someone is here".
 * Everything worth knowing about a visit — how long they stayed, what they read, whether they came
 * from LinkedIn or a search — is only known once they leave, so the record is now built up across
 * the visit and sent at the end of it.
 *
 * ONE RECORD, TWO JOBS. The outer fields (`first`, `last`, `count`) are the visitor's standing
 * across all time and are what make "returning visitor" possible. The `pending` block is the visit
 * currently being watched; it is what gets summarised into an email and then marked sent, and a
 * `sent` flag is what keeps a reload from producing a second one.
 *
 * HIDING A TAB IS NOT LEAVING, which is why banking time and ending a visit are two functions and
 * not one. Every demo on this site opens in a new tab, so the most interesting visitor there is —
 * the one who actually tries the work — hides this tab in the middle of their visit and comes back
 * afterwards. An earlier version ended the visit at that moment and reported only the pages read
 * before the click, while quietly going on recording pages nobody would ever see.
 *
 * THERE IS NO IDENTIFIER, by choice. A UUID would only mean something once it were matched against
 * a list of past UUIDs, and keeping that list is both the work this is meant to avoid and the point
 * at which counting visits would turn into tracking people. A count answers the same question —
 * "have I seen this person before, and how often" — in the email itself, with nothing stored on our
 * side and nothing to look up. What leaves the browser is a description of a visit, not a person.
 *
 * WHAT IT CANNOT KNOW, and the email should be read with this in mind: localStorage is per browser
 * and per device. The same person on a phone and a laptop is two new visitors; a private window is
 * always a new visitor; clearing site data resets someone to new. "Returning" is therefore strong
 * evidence and "new" is weak evidence — a returning visitor really has been here before, but a new
 * one has merely not been here in this browser.
 */

/**
 * Deliberately anonymous, and deliberately not branded. Someone who opens their own devtools
 * should find a neutral key holding a few numbers and paths — not the site owner's name attached
 * to a record of them. localStorage is already scoped to this origin, so the name buys nothing
 * technically; it would only ever have been something for the visitor to find.
 */
const KEY = "visit";

/**
 * How long a visit may lie idle before the next load counts as a new one. 30 minutes is the
 * conventional analytics session, and the window SLIDES — every load pushes it out — so a
 * continuous read of any length is one visit and one email. A gap longer than this is someone
 * coming back, which is the thing worth being told about.
 */
const VISIT_TTL_MS = 30 * 60 * 1000;

/** Enough of a visit to describe it, and nothing that could pick the visitor out of a crowd. */
export type PendingVisit = {
  /** When this visit began. */
  start: number;
  /** Time with the tab actually in front of them, summed across loads. Excludes backgrounded time. */
  engagedMs: number;
  /** Every path opened this visit, in order, first-seen only. The first is where they landed. */
  paths: string[];
  /** Where they came from, taken at the first load of the visit. Empty string means direct. */
  referrer: string;
  /** Their standing when the visit began — 1 on a browser that has never been here. */
  visitNumber: number;
  /** When they were last seen before this visit, or null if this browser has never been here. */
  previousVisit: number | null;
  /** Set once the summary has gone out, so a reload cannot send a second one. */
  sent: boolean;
};

type VisitorRecord = {
  first: number;
  last: number;
  count: number;
  pending?: PendingVisit;
};

function read(): VisitorRecord | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as VisitorRecord).last !== "number" ||
      typeof (parsed as VisitorRecord).count !== "number"
    ) {
      return null;
    }

    return parsed as VisitorRecord;
  } catch {
    // Unreadable, unparseable, or storage refused outright — private windows and locked-down
    // privacy settings both do the latter. Treated as "no record", which fails toward sending.
    return null;
  }
}

function write(record: VisitorRecord): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    // Storage is full or blocked. Nothing to do: the visit still gets its email, it just cannot be
    // remembered, so the next load looks like a new visitor again. A duplicate email is a far
    // better failure than a missed one.
  }
}

/**
 * Starts a visit, or rejoins the one already in progress. Called once per page load.
 *
 * A reload lands here with the previous load's `pending` still inside the window, so the visit is
 * picked up where it left off — same start time, same accumulated seconds, same paths — rather
 * than counted again. That is what makes "one email per visit" hold across reloads.
 */
export function openVisit(
  now: number,
  referrer: string,
  path: string,
): PendingVisit {
  const previous = read();
  const resumable =
    previous?.pending && now - previous.last < VISIT_TTL_MS
      ? previous.pending
      : undefined;

  if (previous && resumable) {
    const pending: PendingVisit = {
      ...resumable,
      paths: resumable.paths.includes(path)
        ? resumable.paths
        : [...resumable.paths, path],
    };
    write({ ...previous, last: now, pending });
    return pending;
  }

  const pending: PendingVisit = {
    start: now,
    engagedMs: 0,
    paths: [path],
    referrer,
    visitNumber: previous ? previous.count + 1 : 1,
    previousVisit: previous ? previous.last : null,
    sent: false,
  };

  write({
    first: previous ? previous.first : now,
    last: now,
    count: pending.visitNumber,
    pending,
  });

  return pending;
}

/** Notes a page opened later in the same visit, without client-side navigation reloading anything. */
export function addPath(now: number, path: string): void {
  const record = read();
  if (!record?.pending || record.pending.paths.includes(path)) return;

  write({
    ...record,
    last: now,
    pending: {
      ...record.pending,
      paths: [...record.pending.paths, path],
    },
  });
}

/**
 * Banks a stretch of time the visitor spent looking at the page, WITHOUT ending the visit.
 *
 * Separate from closing because hiding a tab is not leaving: someone who opens a demo in a new tab
 * is still mid-visit, and the time they had already spent has to survive until they come back.
 */
export function bankEngagement(now: number, engagedMs: number): void {
  const record = read();
  if (!record?.pending || engagedMs <= 0) return;

  write({
    ...record,
    last: now,
    pending: {
      ...record.pending,
      engagedMs: record.pending.engagedMs + engagedMs,
    },
  });
}

/**
 * Ends the visit and returns it for reporting, or null if it has already been reported. Marks it
 * sent in the same write, so no sequence of events can produce two emails for one visit.
 */
export function closeVisit(now: number): PendingVisit | null {
  const record = read();
  if (!record?.pending || record.pending.sent) return null;

  write({ ...record, last: now, pending: { ...record.pending, sent: true } });
  return record.pending;
}

/**
 * A visit that ended without ever being reported — the tab was discarded while backgrounded, or
 * the browser was killed, and neither the grace timer nor `pagehide` ever got to run. Claimed on
 * the visitor's NEXT load, once the old visit is far enough past to be certainly over.
 *
 * The safety net only pays out if they come back at all. That is fine: it costs one read, and it
 * turns "some visits are silently lost" into "some visits are reported late".
 */
export function takeAbandonedVisit(now: number): PendingVisit | null {
  const record = read();
  if (!record?.pending || record.pending.sent) return null;
  if (now - record.last < VISIT_TTL_MS) return null;

  write({ ...record, pending: { ...record.pending, sent: true } });
  return record.pending;
}

/** "3 days", "20 minutes" — the gap since a previous visit, for the email to read back. */
export function describeGap(from: number, to: number): string {
  const units: [label: string, ms: number][] = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];

  for (const [label, ms] of units) {
    const value = Math.floor((to - from) / ms);
    if (value >= 1) return `${value} ${label}${value === 1 ? "" : "s"}`;
  }

  return "less than a minute";
}

/** "4m 12s" — how long they actually looked at it. Seconds matter here; on a gap they do not. */
export function describeDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}
