/**
 * The site's one easing curve — slow start, fast middle, dead stop. Nothing springs or
 * floats; it glides and lands. This is the JS twin of `--ease` in globals.css; the two
 * must stay identical.
 */
export const EASE = [0.82, 0, 0.18, 1] as const;

/** The shared reveal: everything that enters does this, and nothing does anything else. */
export const RISE = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
} as const;
