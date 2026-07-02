/**
 * THE HERO BEAT SHEET — the single scroll timeline for the landing's pinned stage.
 *
 * The hero track (`.hero-track-v4`, 340vh) pins its stage for (track − 100vh) ≈ 240vh of scroll;
 * every number here is a FRACTION of that pinned progress (HeroSection's useScroll).
 *
 * CHOREOGRAPHY RULES (user-directed): the beats are grouped into COMPONENTS that move as units, every
 * transition DOVETAILS (one group's exit overlaps the next group's entrance, so something is always
 * happening and the frame is never a vacuum), and each chapter lands in a REST STATE — a fully
 * composed, motionless frame the reader can stop on and know "this is a section" before scrolling on.
 *
 *   GROUPS: A opening copy (greeting/role/tagline/locator) · B the word (the one permanent anchor —
 *   it never moves, only its glyphs roll) · C persona content (character note + tech-DNA) ·
 *   D featured lockup (script eyebrow) + thesis (they compose the projects frame TOGETHER).
 *
 *   0.00–0.03   REST 0 — the opening lockup (a scroll-intent buffer before anything moves)
 *   0.03–0.15   A exits in a top-down cascade (HERO_EXIT) …
 *   0.08–0.24   … dovetailing MORPH 1: PRATIUSH → PERSONA (STAGE0)
 *   0.22–0.30   C enters under the settling letters (PERSONA_IN); the DNA draw-on is CUED at 0.27
 *               (DNA_CUE), once its layer is essentially opaque, so the connect-the-dots inking
 *               performs in full view
 *   0.30–0.52   REST 1 — the persona frame (word + note + DNA holding; the helix's idle rotation is
 *               the frame's life, not a transition)
 *   0.52–0.60   C exits (PERSONA_OUT) …
 *   0.56–0.72   … dovetailing MORPH 2: PERSONA → PROJECTS (STAGE1) — the wave's tension visibly
 *               loads on the word while the persona content is still clearing
 *   0.70–0.82   D enters ON the landing: the thesis inks in beside the settling word (THESIS_IN —
 *               a scrub layer of this stage now, NOT a separate scrolling section, so the right side
 *               fills the moment PROJECTS lands instead of leaving a vacuum) and the script
 *               "Featured" eyebrow completes the lockup (FEATURED_IN)
 *   0.82–0.975  REST 2 — the projects frame (PROJECTS + Featured + thesis, the composed diagonal)
 *   0.975–1.00  velocity-matched release ramp (RELEASE); the whole composed frame rides up as one
 *               and NILINK crests through the hero's feathered bottom on the ride-out
 *
 * The beats live HERE, in one file, so re-timing one can't silently collide with its neighbours.
 */

export type Window = readonly [number, number];

/** MORPH 1 — PRATIUSH → PERSONA. Left-anchored: the P never moves; the tail slot collapses (H→∅). */
export const STAGE0 = { start: 0.08, end: 0.24 } as const;

/** MORPH 2 — PERSONA → PROJECTS. The collapsed tail slot re-opens (∅→S) to land the 8th letter.
 *  Starts INSIDE the persona exit window — the dovetail — so the stage never sits empty. */
export const STAGE1 = { start: 0.56, end: 0.72 } as const;

/** Persona content: enters under MORPH 1's settling letters, exits into MORPH 2's wind-up. */
export const PERSONA_IN: Window = [0.22, 0.3];
export const PERSONA_OUT: Window = [0.52, 0.6];

/** The DNA draw-on cue — fired once, when the layer is ~fully faded in, so the strand-and-logos
 *  inking (the connect-the-dots moment) plays entirely on stage, then rests as the living frame. */
export const DNA_CUE = 0.27;

/** The opening copy's staggered exit (eyebrow first), after a small scroll-intent buffer (REST 0),
 *  overlapping MORPH 1's first rolls — the same deliberate premium overlap as before. */
export const HERO_EXIT = {
  eyebrow: { window: [0.03, 0.09] as Window, lift: -54 },
  body: { window: [0.05, 0.14] as Window, lift: -44 },
  meta: { window: [0.06, 0.15] as Window, lift: -36 },
} as const;

/** The thesis ink-on — per-word wipe staggered across this window, timed to START as MORPH 2's
 *  last letters are landing so the diagonal composes immediately (no vacuum beside PROJECTS). */
export const THESIS_IN: Window = [0.7, 0.82];

/** The script "Featured" eyebrow — inks in with the thesis wash, completing the projects lockup. */
export const FEATURED_IN: Window = [0.74, 0.82];

/** The warm glow pool eases LEFT with MORPH 2 so the settling lower-left title is lit. */
export const GLOW_DRIFT: Window = [0.56, 0.84];

/** The velocity-matched release ramp (HeroSection RELEASE_LIFT): an ease-in that starts from rest
 *  and reaches scroll speed exactly at the unpin, so the held frame never jolts into scrolling.
 *  The window is sized so the ramp covers ~6vh of scroll (same absolute feel as the short pin). */
export const RELEASE: Window = [0.975, 1];
