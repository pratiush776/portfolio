"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { useReducedMotion, useScroll, useTransform } from "motion/react";
import type { MotionProps, Variants } from "motion/react";

/**
 * THE MOTION VOCABULARY. One curve, one duration scale, one gesture, one rhythm, one threshold.
 * Every animation on the site is assembled from what is in this file; nothing declares its own
 * timing locally. If a section needs to move differently, the argument belongs here, once, where
 * the rest of the page can be held against it.
 *
 * This is the JS half of a pair — `--ease` and the `--dur-*` tokens in globals.css are the CSS
 * half, and the two must stay identical. CSS owns hover and state transitions; JS owns entrances
 * and anything reading the scroll.
 */

/**
 * The site's one easing curve — slow start, fast middle, dead stop. Nothing springs or
 * floats; it glides and lands.
 *
 * It governs everything that PLAYS: entrances, hovers, state changes, the page transition, the
 * intro curtain. On scroll-SCRUBBED values the test is distance rather than kind: the pinned deck's
 * curtain, scale and develop stay linear, because a large object tracking the wheel is direct
 * manipulation and this curve's fast middle compresses it into a burst, while the same deck's copy
 * and rail — 4 to 12px — take the curve, where a shaped settle reads as weight instead of lag.
 */
export const EASE = [0.82, 0, 0.18, 1] as const;

/**
 * The duration scale, in seconds. Five lengths, and each one is a KIND of event rather than a
 * number someone picked: how long a thing takes says what sort of thing it is.
 *
 * The first five are mirrored as `--dur-*` in globals.css and must stay identical to them, the way
 * `--ease` and `EASE` do; they are the values the page already used, so naming them was the change
 * rather than re-timing them. `curtain` is the exception and has no CSS twin — see its note.
 */
export const DUR = {
  /** A control acknowledging you. The skip link. */
  tap: 0.25,
  /** A small thing responding to the pointer: arrows, row nudges, colour. */
  hover: 0.4,
  /** A rule drawing itself across a word. The link underline. */
  wipe: 0.5,
  /** A picture changing state — a longer distance over a larger area. */
  media: 0.7,
  /** Something arriving on the page for the first time. */
  enter: 0.8,
  /**
   * The intro field lifting off the page. Longest by a distance, for two reasons: it is the one
   * gesture that crosses the entire screen, and it belongs to the intro, which runs on a slower
   * tempo than the page (see `--dur-intro-rise`). A title sequence is watched, not answered.
   *
   * JS-only — the lift is a Motion animation, so unlike the rest of this scale it has no CSS twin
   * to keep in step.
   */
  curtain: 1.1,
} as const;

/** The transition every entrance uses. */
export const ENTER = { duration: DUR.enter, ease: EASE } as const;

/**
 * THE GESTURE: rise from below, fade in. Everything that enters does this and nothing does
 * anything else — only the scale changes (a line of copy, a whole footer, the intro's wordmark).
 *
 * It deliberately carries NO transition of its own. A transition written inside an animation
 * target outranks the `transition` prop beside it, so a target that packs one silently swallows
 * every per-use delay passed alongside — which is exactly how the work grid ended up with an
 * alternating delay that never once applied. Timing is supplied by `ENTER`, from outside, where it
 * can be added to.
 */
const RISE = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
} as const;

/**
 * THE RHYTHM. One step between children, one beat before the first — so a hero, a footer, the
 * archive and a case page all cascade at the same speed and read as one hand.
 */
const CASCADE = { stagger: 0.09, delayChildren: 0.06 } as const;

/**
 * THE THRESHOLD: how far a block must be into the viewport before it is allowed to arrive. A
 * single value, so nothing arrives noticeably earlier or later than its neighbours.
 *
 * Expressed as a bottom margin rather than a visible fraction, because the page's blocks range
 * from a compact archive row to well over a screen (the past wall), and a fraction of a block
 * that tall can never be reached.
 */
export const THRESHOLD = "0px 0px -15% 0px";

/**
 * THE TYPED LINE. The hero's one continuous motion — every other thing on the page moves once, on
 * arrival, and then holds. This runs for as long as somebody is looking at it, which is why it is
 * timed here with the rest rather than inside the component: a loop that never stops is the
 * easiest thing on a page to leave slightly too fast.
 *
 * `erase` is deliberately quicker than `type`. Typing is someone composing a thought and reads as
 * deliberate; deleting is clearing the way for the next one, and at the same speed it reads as
 * hesitation. The asymmetry is the whole reason the gesture looks like typing rather than like a
 * string being animated.
 *
 * `hold` is the value to change if the line feels rushed — it is the only part a reader actually
 * reads, and it wants to outlast the eye reaching the end of the phrase.
 *
 * These are seconds, to match DUR, and are converted at the one place they are consumed.
 */
export const TYPE = {
  /** Per character, while the phrase is being written. */
  type: 0.055,
  /** Per character, while it is being cleared. */
  erase: 0.03,
  /** The full phrase, standing still and readable. */
  hold: 1.7,
  /** Empty, before the next phrase starts. A breath, so the cycle has a seam. */
  gap: 0.35,
  /** One full cycle of the caret, while it is idle. */
  blink: 1.1,
} as const;

/** The parent of a cascade: holds nothing itself, times its children. */
export const STAGGER: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: CASCADE.stagger,
      delayChildren: CASCADE.delayChildren,
    },
  },
};

/** A child of a cascade. Its parent's `STAGGER` supplies the offset; this supplies the gesture. */
export const rise: Variants = {
  hidden: RISE.hidden,
  visible: { ...RISE.visible, transition: ENTER },
};

/**
 * A block that arrives as you scroll to it, once. For sections that stand on their own — a
 * statement, a section title, the archive — where there is no parent cascade to belong to.
 *
 * `delay` is honoured, because `RISE.visible` carries no transition to override it.
 */
export function reveal(delay = 0): MotionProps {
  return {
    initial: RISE.hidden,
    whileInView: RISE.visible,
    viewport: { once: true, margin: THRESHOLD },
    transition: delay ? { ...ENTER, delay } : ENTER,
  };
}

/**
 * `useLayoutEffect` on the client, `useEffect` on the server — the standard shim, needed because
 * the intro has to settle its state BEFORE the browser paints (an effect that runs after paint
 * would show one frame of a hero at opacity 0) and React warns about layout effects during SSR.
 */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ── the glide ─────────────────────────────────────────────────────────────────
   THE PAGE'S ONE PARALLAX, and the only thing on the site that lets two blocks move at different
   speeds.

   A normally-scrolling block travels at exactly page speed, so any two of them hold a constant gap
   and the whole document reads as one rigid sheet. That is usually right. It stops being right at a
   SEAM — where one block comes to rest while its neighbour keeps going, or starts moving while its
   neighbour is still still. The pinned deck has two such seams, and they were the harshest moments
   on the page before this: the composition ran up at page speed and then, on a single frame, was
   nailed down. Coming back up, the same edge fired in reverse.

   The glide is a small counter-translate over the one viewport of scroll either side of a boundary.
   Its defining property is that it is ZERO at both ends of its own window while still having a
   non-zero SLOPE at one of them — so it changes the block's SPEED without changing where the block
   ends up. Nothing is ever displaced at rest, which is what makes it safe to hang on anything: the
   settled layout is untouched, and the only thing that differs is the approach to it.

   What the eye reads out of that is parallax. The block being glided arrives slower than the page
   while its neighbour arrives at page speed, so for the length of the seam the two separate — which
   is the depth cue, on a site that otherwise refuses depth. It is the same argument the inverted
   surface and the grey→colour reveal make: depth from behaviour, never from a shadow. */

/**
 * TWO PRESETS, because there are two different problems and only one of them is a problem.
 *
 * `amount` is dimensionless and physical in both: the fraction of page speed the drift cancels at
 * the boundary. It reads that literally because both windows in `useGlide` are always exactly one
 * viewport of scroll whatever the section's height — so "drift of `amount` × a viewport, across a
 * viewport of scroll" is precisely "`amount` of page speed".
 *
 * `tail` is where they part, and the reasoning is the same reasoning either way: put the motion
 * where the interest is.
 */
export const GLIDE = {
  /**
   * AT A SEAM — where a block genuinely stops dead, which on this site means the pinned deck's two
   * edges. There is a real discontinuity at one exact moment, so the drift is aimed at it: heavy
   * (0.65 → arrival at about a third of page speed, enough to read as settling rather than
   * stopping) and tightly gathered, so all that weight costs only ~5% of a viewport in bulge.
   *
   * Past ~0.7 the peak displacement becomes legible as a slide in its own right.
   */
  seam: { amount: 0.65, tail: 4 },

  /**
   * BETWEEN FREELY SCROLLING CHAPTERS — where nothing stops and there is nothing to fix. This one
   * is not damping anything; it exists purely so two neighbours stop moving as one rigid sheet.
   *
   * So both knobs invert the seam's logic. `amount` is small, because the drift is the whole
   * effect rather than a correction to a fault, and a chapter that visibly lurches has overshot the
   * brief. And `tail` drops to 1 — a plain symmetric parabola — because for a free-scrolling block
   * the ends of the window ("my top touched the top of the screen") are arbitrary moments that
   * deserve no emphasis. Concentrating there would put a kick at nothing. Spread evenly, the block
   * simply breathes against its neighbour across the whole passage, peaking ~35px as it crosses the
   * middle of the screen and returning to nothing by the time it is settled.
   */
  chapter: { amount: 0.15, tail: 1 },
} as const;

/** Either preset's shape — `{ amount, tail }`. */
export type Glide = (typeof GLIDE)[keyof typeof GLIDE];

/**
 * The shape. One function, and its mirror is the same function read backwards — see `useGlide`.
 *
 * `t(1-t)ⁿ` over `t ∈ [0,1]`: zero at both ends, steepest at t = 0. It leans against the START of
 * its window, which is where a boundary sits for a block that is leaving; a block that is arriving
 * passes `1 - t` and leans on the end instead.
 *
 * The exponent buys concentration, and it buys it free: the slope at t = 0 — the damping, which at
 * a seam is the entire point — does not depend on `tail` at all. Only the bulge does. At a fixed
 * amount of 0.65 the peak displacement runs 16% of a viewport at n = 1, 10% at n = 2, 5% at n = 4
 * and 4% at n = 6, every one of them buying identical damping. So `tail` is purely how much of the
 * window the effect is allowed to spread into — which is why it is the knob that differs between
 * the two presets above rather than a constant.
 */
export const glide = (t: number, tail: number) => t * Math.pow(1 - t, tail);

/**
 * The viewport, tracked. Zero until hydration, which is the honest answer rather than a guess: a
 * drift of zero is exactly a page that has not started gliding yet.
 */
function useViewportHeight(): number {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.innerHeight,
    () => 0,
  );
}

/**
 * A section's two boundary clocks and the drift derived from them.
 *
 *   const { entering, drift } = useGlide(section);
 *   <motion.div ref={section} style={{ y: drift }}>…</motion.div>
 *
 * `entering` runs 0 → 1 across the viewport-height of scroll before the section's top reaches the
 * top of the screen; `leaving` runs 0 → 1 across the viewport-height after its bottom leaves the
 * bottom. Both are exposed because a section that wants a glide almost always wants to choreograph
 * something else against the same two edges — the pinned deck assembles its whole stage on
 * `entering` — and one definition of "this section's edges" is better than two that can drift.
 *
 * `drift` is in PIXELS, so it can be hung on any element rather than only on one that happens to be
 * a viewport tall. It does not have to be the element the ref is on: give the ref to whatever
 * defines the section's extent and the drift to whatever should move.
 *
 * On a section shorter than the viewport the two windows overlap, and the two terms — which have
 * opposite signs — largely cancel through the overlap. That degrades gently rather than
 * misbehaving, but the effect is strongest on blocks of a screen or more, which is what it is for.
 *
 * THE ONE PLACE IT DOES NOT BELONG is a block whose window cannot finish, and on this page that
 * means the block sitting against the end of the document. A window only completes when the edge it
 * tracks reaches the top of the screen; a final section shorter than the viewport never lets that
 * happen, so its drift never returns to zero and the block is left permanently displaced at max
 * scroll — for the footer, a strip of bare page under the ink. That is why the footer is the one
 * chapter on the landing without a glide, and it is a property of the document's end rather than of
 * the footer, so the same caution applies to whatever ends up last.
 *
 * Off entirely under `prefers-reduced-motion`: parallax between neighbours is exactly the class of
 * movement that setting is asking about, and unlike the site's entrances there is nothing here that
 * needs to still happen instantly.
 */
export function useGlide<T extends HTMLElement>(
  target: RefObject<T | null>,
  { amount, tail }: Glide = GLIDE.chapter,
) {
  const { scrollYProgress: entering } = useScroll({
    target,
    offset: ["start end", "start start"],
  });
  const { scrollYProgress: leaving } = useScroll({
    target,
    offset: ["end end", "end start"],
  });
  const viewport = useViewportHeight();
  const reduce = useReducedMotion() ?? false;

  // Leaving lags (positive, held back), arriving runs ahead and decelerates (negative). Reversing
  // the argument is what mirrors the shape onto the far boundary — see `glide`.
  const drift = useTransform([entering, leaving], ([a, d]: number[]) =>
    reduce ? 0 : amount * viewport * (glide(d, tail) - glide(1 - a, tail)),
  );

  return { entering, leaving, drift };
}
