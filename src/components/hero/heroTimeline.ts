/**
 * THE NARRATIVE BEAT SHEET — the single scroll timeline for the landing's persistent-title track,
 * AND the single source of truth for the track's geometry (NarrativeSection injects the layout
 * constants below as CSS custom properties, so the CSS can never drift from the beat math).
 *
 * The landing is a PERSISTENT-TITLE track: the hero name scrolls UP to a dock near the top (CSS
 * `position: sticky`), morphs PRATIUSH → PERSONA → PROJECTS, and exits before the projects grid.
 * ONE `useScroll({target: stageRef, offset:["start start","end end"]})` over the fixed-height stage
 * is the MASTER progress; every window below is a slice of it.
 *
 * THE STORY, chapter by chapter (each CHAPTER is a budget in stage-scroll vh, summed into PINNED_VH).
 * Beats are SEQUENTIAL — one thing moves at a time; every chapter lands on a composed REST STATE
 * that reads as a finished static frame:
 *
 *   C0  HERO travel   the full hero lockup rides UP at page speed; the name docks near the top at
 *                     full size; the copy scrub-fades away so nothing legible crosses the dock.
 *   C1  PERSONA       MORPH 1 (PRATIUSH → PERSONA, short) completes FIRST, the script "My" eyebrow
 *                     lands, THEN the persona content GATE opens (the block is invisible before
 *                     this — no ghost text under the hero), the statement reveals word-by-word
 *                     (opacity-only — ScrollInk) and HOLDS, THEN the capability spine fades in
 *                     (CAPS_IN, after the statement has been read) and walks its four domains on
 *                     LONG dwells (~70vh each — a real reading beat per domain, the old 28vh blew
 *                     past before the icons could register) while the DNA helix — gated in at the
 *                     chapter's open (DNA_IN) — runs ONE CONTINUOUS scroll-locked conveyor of
 *                     icons down the strands: each domain's set is spread over the full helix at
 *                     the middle of its dwell, and the sets hand off in an unbroken stream (the
 *                     outgoing set is still draining off the bottom while the next pours in).
 *   C2  THESIS        the bridge chapter: the persona block and the DNA release, but the docked
 *                     title STAYS; the thesis statement — centered — RIDES UP from below the fold
 *                     at near page speed, inking in as it climbs, and dissolves the moment it
 *                     reaches the viewport's centre: a passing statement, not a held frame.
 *   C3  TRANSITION    MORPH 2 rolls on the always-onstage title (the word becomes PROJECTS) + the
 *                     "Featured" eyebrow; the composed title then simply HOLDS its dock — no fade —
 *                     while the projects grid rises to meet it (the handoff pull-up), composes one
 *                     "title + first cards" frame, and the whole lockup releases and scrolls away
 *                     at page speed (the title rail's bottom edge, set in CSS, times the release —
 *                     geometry, not a scrubbed exit).
 */

export type Window = readonly [number, number];

/* ── The chapter table, in STAGE-scroll vh ──────────────────────────────────────────────────────── */
export const CHAPTERS = {
  travel: 40, // C0: hero lockup rides up, name docks (no scale), copy scrub-fades away
  persona: 410, // C1: MORPH 1 → statement reveal → four LONG capability dwells (DNA flows along)
  thesis: 120, // C2: the bridge — thesis fades in below the held title, holds, fades out
  transition: 25, // C3: MORPH 2 lands as the first project cards enter the viewport (no dead air)
} as const;

export const TRAVEL_VH = CHAPTERS.travel;

/** Total stage-scroll vh — the sum of all chapters. */
export const PINNED_VH =
  CHAPTERS.travel + CHAPTERS.persona + CHAPTERS.thesis + CHAPTERS.transition; // 680

/* ── Geometry constants consumed by the CSS via injected custom properties ────────────────────────
 * NarrativeSection sets these inline on `.narrative-track-v4` (--stage-h / --travel /
 * --persona-span), and globals.css only ever reads the vars — re-budget a chapter here and the
 * layout follows automatically. */

/** Trailing viewport after the last beat — kept SHORT so PROJECTS morphs as cards approach, not
 *  after a full screen of empty scroll. */
export const STAGE_TRAIL_VH = 18;

/** The stage's CSS height: PINNED_VH of scroll budget + the trailing viewport that lets the last
 *  beat play out (progress hits 1 exactly when the stage's bottom meets the viewport's bottom). */
export const STAGE_H_VH = PINNED_VH + STAGE_TRAIL_VH;

/** Pull the projects grid up into the stage's trailing viewport so the first cards enter while
 *  MORPH 2 runs (coupled to .projects-index-v4 margin-top). */
export const PROJECTS_PULL_VH = STAGE_TRAIL_VH + 82;

/** The persona block's sticky SPAN (the wrapper whose bottom edge releases the sticky hold).
 *  The block's VISUAL exit is the PERSONA_OUT scrub fade (it dissolves at rest — a natural ride-out
 *  would take ~85svh of scroll to clear the viewport and would still be sliding through the thesis
 *  hold). The span only needs to keep the sticky engaged until the fade completes: release scroll ≈
 *  (C0 copy 100svh + span) − (content-top + block box ≈ 85svh) = span + 15. PERSONA_OUT ends at
 *  absolute vh ~468 (C2 + 18), so span 460 releases at ~475 — after the block is already invisible,
 *  so it never visibly slides. */
export const PERSONA_SPAN_VH = 460;

/* Cumulative chapter START offsets (absolute vh from the stage's top). */
const C0 = 0;
const C1 = C0 + CHAPTERS.travel; // 40
const C2 = C1 + CHAPTERS.persona; // 450
const C3 = C2 + CHAPTERS.thesis; // 570

/**
 * Convert an absolute vh span (from the stage's top) into a fraction-of-PINNED_VH window — the shape
 * the scrubbed `useTransform` calls consume off the master progress.
 */
export function vhWindow(startVh: number, endVh: number): Window {
  return [startVh / PINNED_VH, endVh / PINNED_VH] as const;
}

/* ── C0 — hero ──────────────────────────────────────────────────────────────────────────────────── */

/** The C0 hero-copy scrub-fade assist: the lockup scrolls away naturally; this gentle block-level
 *  fade over the back stretch of the travel keeps anything legible from crossing the docked title. */
export const HERO_COPY_OUT: Window = vhWindow(C0 + 16, C0 + 36);

/* ── C1 — persona ───────────────────────────────────────────────────────────────────────────────── */

/** MORPH 1 — PRATIUSH → PERSONA, in the docked title. SHORT (32vh): the readable endpoints hold
 *  longest and the broken mid-roll letterforms pass quickly (the old 50vh window let the scrambled
 *  middle linger like corrupted type). Completes BEFORE the statement reveal begins. */
const [S0S, S0E] = vhWindow(C1 + 0, C1 + 32);
export const STAGE0 = { start: S0S, end: S0E } as const;

/** The script "My" eyebrow over PERSONA ("My Persona"). In right after MORPH 1 lands; out as the
 *  persona block releases at the thesis chapter's open. */
export const MY_IN: Window = vhWindow(C1 + 34, C1 + 46);
export const MY_OUT: Window = vhWindow(C2 + 0, C2 + 15);

/** THE PERSONA CONTENT GATE — the OUTER opacity level. The whole persona block (statement +
 *  capability spine) is opacity 0 until PERSONA has landed, then fades in as one unit. This is what
 *  keeps the hero clean: the statement's word-level ghost floor (ScrollInk's 0.2) only ever shows
 *  INSIDE this window — never as ghost text under PRATIUSH. */
export const PERSONA_GATE_IN: Window = vhWindow(C1 + 36, C1 + 50);

/** The persona statement reveals WORD-BY-WORD (low-opacity → full, opacity only) after the gate has
 *  opened, then HOLDS visible through the whole capability walk. */
export const MANIFESTO_IN: Window = vhWindow(C1 + 52, C1 + 112);

/** The capability spine enters ONLY after the statement has established itself (fully revealed) —
 *  a block-level fade just ahead of the first dwell, so the list never competes with the reading. */
export const CAPS_IN: Window = vhWindow(C1 + 112, C1 + 126);

/** The whole persona block (statement + capability spine) DISSOLVES at rest as the thesis chapter
 *  opens — a scrubbed fade, not a ride-out (see PERSONA_SPAN_VH). One unit, one move. */
export const PERSONA_OUT: Window = vhWindow(C2 + 0, C2 + 18);

/** FOUR capability dwells across the back stretch of C1, after the statement has been read.
 *  LONG (70vh each — the revision pass's core fix): a domain now owns most of a viewport of scroll,
 *  so the reader can actually watch its icon set pour through the helix instead of having to
 *  scroll-hunt for it. CAP_START + 4 × CAP_DWELL_VH lands exactly on C2. */
const CAP_START = C1 + 130;
const CAP_DWELL_VH = 70;
export const CAP_DWELL: Window[] = [0, 1, 2, 3].map((i) =>
  vhWindow(CAP_START + i * CAP_DWELL_VH, CAP_START + (i + 1) * CAP_DWELL_VH),
);

/** The helix is CHAPTER-SPECIFIC: absent through the hero, fading in as the persona chapter opens
 *  (alongside the content gate) so it reads as the capabilities' support, not page furniture. */
export const DNA_IN: Window = vhWindow(C1 + 30, C1 + 55);

/** Per-domain FLOW windows for the DNA — one per capability dwell, and exactly the dwell. The flow
 *  is ONE CONTINUOUS scroll-locked conveyor (TechDNA): every bead rides down at a constant speed of
 *  one helix length per window width, anchored so set i sits spread over the full helix exactly at
 *  its window's MIDDLE (mid-dwell = the "all icons visible" frame). Sets hand off in an unbroken
 *  stream across window edges. Positions are pure functions of progress (idempotent +
 *  direction-safe: scrubbing up runs the stream in reverse). */
export const DNA_FLOW: Window[] = CAP_DWELL;

/** The whole helix (skeleton + any in-flight icons) fades fully out as the thesis chapter opens —
 *  the bridge owns the stage below the held title. */
export const DNA_EXIT: Window = vhWindow(C2 + 0, C2 + 25);

/* ── C2 — the thesis bridge ─────────────────────────────────────────────────────────────────────── */

/** The thesis is a PASSING statement riding the scroll (user-directed): centered in the viewport
 *  column, it RISES from below the fold to dead centre over THESIS_RISE — LINEAR, so it reads as
 *  the page's own scroll carrying it — while THESIS_IN inks it in on the way up, and THESIS_OUT
 *  dissolves it just as it arrives at the centre. Fully gone a 12vh breath before MORPH 2 opens. */
export const THESIS_RISE: Window = vhWindow(C2 + 5, C2 + 92);
export const THESIS_IN: Window = vhWindow(C2 + 12, C2 + 48);
export const THESIS_OUT: Window = vhWindow(C2 + 72, C2 + 92);

/* ── C3 — transition to projects ────────────────────────────────────────────────────────────────── */

/** MORPH 2 — PERSONA → PROJECTS. Timed to the C3 open so the word lands as the first project
 *  cards reach ~10% from the viewport bottom (the grid pull-up brings them in concurrently). */
const [S1S, S1E] = vhWindow(C3 + 0, C3 + 20);
export const STAGE1 = { start: S1S, end: S1E } as const;

/** The script "Featured" eyebrow — inks in once PROJECTS has landed. */
export const FEATURED_IN: Window = vhWindow(C3 + 18, C3 + 28);

/* (No TITLE_EXIT window any more — the composed PROJECTS title never fades. It holds its dock while
   the grid's pull-up brings the first row to a set gap below it, then the sticky rail's bottom edge
   (.narrative-title-rail-v4, CSS) releases it so title + cards scroll away together at page speed.) */

/* ── Atmosphere ─────────────────────────────────────────────────────────────────────────────────── */

/** The warm glow pool eases RIGHT for the persona beat (between the statement and the helix),
 *  rests, then GLOW_DRIFT sweeps it back LEFT as PROJECTS lands. */
export const GLOW_PERSONA: Window = vhWindow(C1 + 0, C1 + 40);
export const GLOW_DRIFT: Window = vhWindow(C3 + 0, C3 + 25);
