/**
 * The site's one easing curve — slow start, fast middle, dead stop. Nothing springs or
 * floats; it glides and lands. This is the JS twin of `--ease` in globals.css; the two
 * must stay identical.
 *
 * It governs everything that PLAYS: entrances, hovers, state changes, the page transition.
 * It deliberately does not reach the pinned deck (see FeaturedStack) — a scroll-scrubbed value
 * tracking the wheel is direct manipulation rather than a transition, and this curve's fast
 * middle compresses such a value into a burst.
 */
export const EASE = [0.82, 0, 0.18, 1] as const;

/** The shared reveal: everything that enters does this, and nothing does anything else. */
export const RISE = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
} as const;
