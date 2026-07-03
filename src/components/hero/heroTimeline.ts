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
 *   —           THE DNA SKELETON is a PERMANENT fixture of the stage, present from frame one: its
 *               strands + rungs (no icons) ink on ONCE during the intro (right after the hero name
 *               rises — TechDNA's SKELETON_DELAY_MS, not a scroll beat), then simply stay for the pin.
 *   0.20–0.32   the warm glow pool eases RIGHT (GLOW_PERSONA) to sit between the note and the helix,
 *               heating the middle band — then RESTS there until GLOW_DRIFT sweeps it left again
 *   0.22–0.30   C's character note enters under the settling letters (PERSONA_IN) …
 *   0.22–0.36   … and the tech-icons POUR IN through the skeleton, top→bottom (DNA_ICONS_IN): each
 *               bead spirals down its strand to its seat, the top rungs seating first — a waterfall
 *   0.30–0.52   REST 1 — the persona frame (word + note + fully-seated helix holding; the helix's
 *               idle rotation is the frame's life, not a transition)
 *   0.52–0.60   C's note exits (PERSONA_OUT) …
 *   0.52–0.64   … and the icons DRAIN off the bottom (DNA_ICONS_OUT) — they flow THROUGH the DNA and
 *               out the base, dovetailing MORPH 2 so the skeleton is emptying as the word rewinds
 *   0.56–0.72   MORPH 2: PERSONA → PROJECTS (STAGE1) — the wave's tension visibly loads on the word
 *               while the icons are still draining
 *   0.62–0.74   the emptied skeleton DIMS to a faint watermark (DNA_DIM, presence 1 → DIM_LEVEL)
 *               behind the arriving thesis, and rides out with the stage at the unpin
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

/** Persona content: the character NOTE enters under MORPH 1's settling letters, exits into MORPH 2's
 *  wind-up. (The DNA skeleton is NOT gated by these — it's permanent; only the note rides them.) */
export const PERSONA_IN: Window = [0.22, 0.3];
export const PERSONA_OUT: Window = [0.52, 0.6];

/** THE ICONS POUR IN — the tech beads flow into the ever-present skeleton, top→bottom (a staggered
 *  waterfall down the strands to their seats). Opens under MORPH 1's landing, alongside the note. */
export const DNA_ICONS_IN: Window = [0.22, 0.36];

/** THE ICONS DRAIN OUT — mirrored, all continuing DOWNWARD off the base: the beads flow THROUGH the
 *  DNA and out the bottom, dovetailing MORPH 2 so the skeleton empties as the word rewinds. */
export const DNA_ICONS_OUT: Window = [0.52, 0.64];

/** THE SKELETON DIMS — once the icons have drained and the word rolls to PROJECTS, the bare strands
 *  fade to a faint living watermark (presence 1 → DIM_LEVEL) behind the arriving thesis. */
export const DNA_DIM: Window = [0.62, 0.74];

/** The opening copy's staggered exit (eyebrow first), after a small scroll-intent buffer (REST 0),
 *  overlapping MORPH 1's first rolls — the same deliberate premium overlap as before. */
export const HERO_EXIT = {
  eyebrow: { window: [0.03, 0.09] as Window, lift: -54 },
  body: { window: [0.05, 0.14] as Window, lift: -44 },
  meta: { window: [0.06, 0.15] as Window, lift: -36 },
} as const;

/** The script "My" eyebrow over PERSONA — the SAME hand as the greeting, so the beat reads as
 *  title voice: "My Persona" (it answers "whose persona?" without a label). In after MORPH 1
 *  lands (nothing ever floats over rolling letters), out just as MORPH 2 begins. */
export const MY_IN: Window = [0.25, 0.31];
export const MY_OUT: Window = [0.5, 0.56];

/** The thesis ink-on — per-word wipe staggered across this window, timed to START as MORPH 2's
 *  last letters are landing so the diagonal composes immediately (no vacuum beside PROJECTS). */
export const THESIS_IN: Window = [0.7, 0.82];

/** The script "Featured" eyebrow — inks in with the thesis wash, completing the projects lockup. */
export const FEATURED_IN: Window = [0.74, 0.82];

/** The warm glow pool eases RIGHT for the persona beat — it slides off centre to sit BETWEEN the
 *  character note (left) and the enlarged helix (right) through the persona frame, heating the cold
 *  middle band the review flagged and tying the two halves into one composition. It then RESTS there
 *  (a flat hold from GLOW_PERSONA[1] to GLOW_DRIFT[0]) before GLOW_DRIFT sweeps it back LEFT as the
 *  word lands. The light thus FOLLOWS the narrative: name → persona → landed PROJECTS. */
export const GLOW_PERSONA: Window = [0.2, 0.32];

/** The warm glow pool eases LEFT with MORPH 2 so the settling lower-left title is lit. */
export const GLOW_DRIFT: Window = [0.56, 0.84];

/** The velocity-matched release ramp (HeroSection RELEASE_LIFT): an ease-in that starts from rest
 *  and reaches scroll speed exactly at the unpin, so the held frame never jolts into scrolling.
 *  The window is sized so the ramp covers ~6vh of scroll (same absolute feel as the short pin). */
export const RELEASE: Window = [0.975, 1];
