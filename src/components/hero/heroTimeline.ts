/**
 * THE NARRATIVE BEAT SHEET — the single scroll timeline for the landing's persistent-title track.
 *
 * The landing is a PERSISTENT-TITLE track: the hero name scrolls UP to a dock near the top (CSS
 * `position: sticky`), morphs PRATIUSH → PERSONA → PROJECTS, and STAYS docked as the section title
 * while every chapter — INCLUDING the projects grid — scrolls beneath it. Two containers make that work
 * (see NarrativeSection + globals.css, and keep the coupling comments loud):
 *
 *   • `.narrative-stage-v4` — the SCRUBBED STAGE, a fixed height (PINNED_VH + 100svh). ONE
 *     `useScroll({target: stageRef, offset:["start start","end end"]})` over it is the MASTER progress;
 *     every window below is a slice of it. Because the stage is a fixed height (the projects grid lives
 *     OUTSIDE it), the beat-sheet fractions stay stable no matter how tall the projects grid grows.
 *   • `.narrative-title-rail-v4` — the sticky DOCKED TITLE, whose containing block is the OUTER track,
 *     so it stays docked over BOTH the stage AND the projects grid, releasing only at the track's bottom
 *     (just before the footer). The stage drives the morph; the outer track owns the release.
 *
 * THE STORY, chapter by chapter (each CHAPTER is a budget in stage-scroll vh, summed into PINNED_VH):
 *
 *   C0  HERO travel   the full hero lockup (greeting / name / role / tagline / locator) rides UP at page
 *                     speed; the name docks near the top WITHOUT scaling (it stays full --name-hero-size);
 *                     the copy scrub-fades away over the second half so nothing legible crosses the dock.
 *   C1  PERSONA       MORPH 1 (PRATIUSH → PERSONA) rolls in the docked title early, the script "My"
 *                     eyebrow inks in ("My Persona"), the manifesto paragraph writes on word-by-word
 *                     (ScrollInk) and then HOLDS fully visible (it is the persona statement — no fade),
 *                     and the COMPACT capability spine walks its four domains over the back ~4/5 of C1.
 *                     The DNA's first icon set pours in as domain 0 becomes active; later sets flow
 *                     through per domain.
 *   C2  TRANSITION    MORPH 2 (PERSONA → PROJECTS); the manifesto + capabilities scroll away naturally
 *                     (the nav-dissolve feather); the DNA drains and DNA_EXIT fades the skeleton to 0;
 *                     the Anton THESIS parallaxes UP from below the fold toward the top as the
 *                     transitional statement between persona and projects. Progress reaches 1 as PROJECTS
 *                     is docked and the thesis has risen — then the projects grid scrolls in immediately
 *                     (no trailing rest, so no blank gap at the stage → projects seam).
 *
 * CHOREOGRAPHY RULES (user-directed) still hold: beats group into COMPONENTS that move as units, every
 * transition DOVETAILS, and each chapter lands on a REST STATE. The beats live HERE, in one file, so
 * re-timing one can't silently collide with its neighbours. All windows are expressed via `vhWindow`
 * over cumulative chapter offsets — no magic decimals in the components.
 */

export type Window = readonly [number, number];

/* ── The chapter table, in STAGE-scroll vh ───────────────────────────────────────────────────────
 * TRAVEL_VH is C0 — the title's natural travel to the dock. It MUST equal the CSS travel geometry:
 * `.narrative-title-rail-v4`'s padding-top spacer is `TRAVEL_VH svh`, so the sticky title travels
 * exactly this much scroll at page speed before it docks (see globals.css — the two move together). */
export const TRAVEL_VH = 40;

export const CHAPTERS = {
  travel: TRAVEL_VH, // C0: hero lockup rides up, name docks (no scale), copy scrub-fades away
  persona: 300, // C1: MORPH 1, "My", manifesto ink+HOLD, the compact capability spine (four dwells)
  transition: 130, // C2: MORPH 2, manifesto/caps scroll away, DNA drains, thesis parallaxes up
} as const;

/** Total stage-scroll vh — the sum of all chapters. The stage's CSS height is PINNED_VH + 100svh
 *  (the trailing viewport that lets the last chapter play before the stage ends; kept minimal so the
 *  projects grid scrolls in right after the thesis rises, with no blank gap). */
export const PINNED_VH =
  CHAPTERS.travel + CHAPTERS.persona + CHAPTERS.transition; // 470

/* Cumulative chapter START offsets (absolute vh from the stage's top). Defined ONCE so every window
   below reads `C{n} + [local...]` and a chapter re-budget shifts everything downstream automatically. */
const C0 = 0;
const C1 = C0 + CHAPTERS.travel; // 40
const C2 = C1 + CHAPTERS.persona; // 340

/**
 * Convert an absolute vh span (from the stage's top) into a fraction-of-PINNED_VH window — the shape
 * the scrubbed `useTransform` calls consume off the master progress. Because the master progress runs
 * `["start start", "end end"]` over a stage of height (PINNED_VH + 100svh), progress 1 corresponds to
 * PINNED_VH of scroll past the start; every beat therefore divides by PINNED_VH.
 */
export function vhWindow(startVh: number, endVh: number): Window {
  return [startVh / PINNED_VH, endVh / PINNED_VH] as const;
}

/** MORPH 1 — PRATIUSH → PERSONA, in the docked title. Left-anchored: the P never moves; the tail slot
 *  collapses (H→∅). MorphName consumes the `{ start, end }` shape. Fires EARLY in C1, right after the
 *  name has finished docking, so the persona chapter opens on PERSONA. */
const [S0S, S0E] = vhWindow(C1 + 0, C1 + 55);
export const STAGE0 = { start: S0S, end: S0E } as const;

/** MORPH 2 — PERSONA → PROJECTS. The collapsed tail slot re-opens (∅→S) to land the 8th letter. */
const [S1S, S1E] = vhWindow(C2 + 10, C2 + 60);
export const STAGE1 = { start: S1S, end: S1E } as const;

/** The script "My" eyebrow over PERSONA ("My Persona" — title voice, whose persona). In after MORPH 1
 *  lands (nothing floats over rolling letters); out as MORPH 2 begins. */
export const MY_IN: Window = vhWindow(C1 + 60, C1 + 80);
export const MY_OUT: Window = vhWindow(C2 + 5, C2 + 25);

/** The script "Featured" eyebrow — inks in with the thesis rise, completing the projects lockup. */
export const FEATURED_IN: Window = vhWindow(C2 + 75, C2 + 100);

/** The manifesto paragraph writes on WORD-BY-WORD below the docked title, then HOLDS fully visible for
 *  the rest of the persona beat (it is the persona statement — no fade after landing; it only scrolls
 *  away naturally in C2 with the nav-dissolve feather). The ink window sits early in C1 so the reader
 *  has read it before the capability spine starts walking. */
export const MANIFESTO_IN: Window = vhWindow(C1 + 30, C1 + 120);

/* ── Capabilities (C2 chapter's content lives inside C1's back stretch) ───────────────────────────
 * FOUR COMPACT capability dwells across the back ~4/5 of C1 — a subsection under the docked title, not
 * four full screens. CAP_DWELL[i] is the whole dwell; the per-domain DNA windows key TechDNA's multi-set
 * flow off the SAME dwells so the two never drift. Compact dwells: 45vh each, walking from C1+75 to
 * C1+255 (well before C2's MORPH 2). */
const CAP_START = C1 + 75; // the spine starts once "My Persona" + the manifesto have settled
const CAP_DWELL_VH = 45; // compact per-domain dwell (was 95 — the subsection shrink)
export const CAP_DWELL: Window[] = [0, 1, 2, 3].map((i) =>
  vhWindow(CAP_START + i * CAP_DWELL_VH, CAP_START + (i + 1) * CAP_DWELL_VH),
);

/** Per-domain icon-set IN windows — set i pours in over the first stretch of its dwell. Set 0 is
 *  aligned to domain 0's ACTIVE window (it pours as the first capability line inks to voice), so the
 *  helix dresses exactly as the persona/capabilities content settles — not before, not laggily after. */
export const DNA_SET_IN: Window[] = [0, 1, 2, 3].map((i) =>
  vhWindow(CAP_START + i * CAP_DWELL_VH + 2, CAP_START + i * CAP_DWELL_VH + 22),
);

/** Per-domain icon-set OUT windows — set i drains over the tail of its dwell, EXCEPT the last set,
 *  which drains at the START of C2 (the final flow-through as the projects frame arrives). */
export const DNA_SET_OUT: Window[] = [0, 1, 2, 3].map((i) =>
  i < 3
    ? vhWindow(CAP_START + i * CAP_DWELL_VH + 32, CAP_START + i * CAP_DWELL_VH + 45)
    : vhWindow(C2 + 0, C2 + 20),
);

/** The bare skeleton's presence fades 1 → 0 as the projects frame arrives (after DNA_EXIT the canvas
 *  draws nothing and the nodes are hidden — the projects grid owns the void). */
export const DNA_EXIT: Window = vhWindow(C2 + 20, C2 + 60);

/** The thesis PARALLAX rise — the statement travels UP from below the fold toward the top as the
 *  transitional statement between persona and projects (HeroThesis owns the `y` parallax + the fade).
 *  Runs across the back half of C2 so it crests as PROJECTS lands and the projects grid scrolls in. */
export const THESIS_IN: Window = vhWindow(C2 + 45, C2 + 100);

/** The warm glow pool eases RIGHT for the persona beat (to sit between the manifesto and the helix),
 *  then RESTS through C1 until GLOW_DRIFT sweeps it left as PROJECTS lands. */
export const GLOW_PERSONA: Window = vhWindow(C1 + 0, C1 + 40);

/** The warm glow pool sweeps back LEFT with MORPH 2 so the settling lower-left title is lit. */
export const GLOW_DRIFT: Window = vhWindow(C2 + 10, C2 + 80);

/* NB: the title's velocity-matched RELEASE ramp is NOT scheduled here anymore — it keys off scroll
   relative to the OUTER track (where the sticky title actually unpins, before the footer), not the
   fixed-height stage's master progress (which reaches 1 far earlier). NarrativeSection owns it via a
   second `useScroll` on the track (offset ["end end","end start"]) with a tiny inline ramp. */
