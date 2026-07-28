"use client";

import { useEffect, useLayoutEffect } from "react";
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
 * intro curtain. It deliberately does not reach the pinned deck (see FeaturedStack) — a
 * scroll-scrubbed value tracking the wheel is direct manipulation rather than a transition, and
 * this curve's fast middle compresses such a value into a burst.
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
