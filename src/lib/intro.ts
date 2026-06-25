/**
 * The landing opening choreography — expressed as data so every participant reads ONE clock.
 *
 * Two clocks drive the reveal:
 *  • BACKDROP — starts on mount (instant life; covers the font-gate latency). Owned by CSS
 *    transitions keyed on `.hero-root-v3[data-backdrop]` (see globals.css "decor bloom").
 *  • FOREGROUND — starts when fonts resolve (`document.fonts.ready`, capped at FONT_GATE_MS),
 *    so display type never flashes a fallback face. Drives the beats below.
 *
 * Beats are delays/durations (seconds) on the FOREGROUND clock (t=0 == gate resolve). A beat
 * is timed to begin once the prior macro move is ~60% resolved, per the choreography guide.
 * All entrance beats share INTRO_EASE; ambient loops keep their own ease-in-out.
 * Tune the opening here and nowhere else.
 *
 * EASE VOICE (site-wide, not just the intro): hard-landing curves — slow start, violent
 * middle, dead stop. Nothing springs or floats; it glides and LANDS.
 *  • INTRO_EASE — every masked rise / fade-up reveal (JS twin of CSS --intro-ease).
 *  • SNAP_EASE — big scrubbed moves (the in-place PROJECTS morph); the hardest stop.
 * CSS micro-interactions (underlines, arrows) use --ease-micro, same family.
 */
export const INTRO_EASE = [0.82, 0, 0.18, 1] as const;
export const SNAP_EASE = [0.9, 0, 0.1, 1] as const;

/**
 * Easing for a SCROLL-LINKED move that should launch from rest and ease IN, then settle into a
 * constant (linear) "normal scroll" rate — instead of the abrupt velocity jump you get when a held
 * element's linear transform suddenly begins (the move looks like it snaps into motion). `ramp` is the
 * fraction of the transform's range spent easing in; keep it small (~0.1–0.15).
 *
 * The curve is a CUBIC ease-in over the ramp, joined to a unit-slope line for the rest with C1
 * continuity — position AND velocity match at the seam, so there's no kink where the soft launch fades
 * into the steady scroll. (It reaches 1 − 2·ramp/3 at input 1: the small displacement the slow start
 * trades away. Fine for these moves, which only need to feel like they accelerate into the scroll, not
 * hit an exact end point.) Pass it straight to `useTransform(…, { ease })`.
 */
export function easedScrollStart(ramp: number) {
  const a = 1 / (3 * ramp * ramp); // cubic coefficient so f'(ramp) = 1 (matches the line's slope)
  return (t: number) => (t < ramp ? a * t * t * t : t - (2 * ramp) / 3);
}

/** Hard cap on how long the foreground waits for `document.fonts.ready` before it plays anyway. */
export const FONT_GATE_MS = 800;

export type Beat = { delay: number; duration: number; y: number };

// One tight, heavily-overlapped cascade: the greeting leads and the name, role and tagline follow on
// a close ~0.13s premium stagger (each sibling kicks off while the prior is barely a third in), so the
// whole lockup reads as ONE staggered gesture rather than separated chunks. Tune the spacing here.
export const BEAT = {
  eyebrow: { delay: 0.0, duration: 0.7, y: 14 }, // "Hi, I'm" — the whisper that leads
  wordmark: { delay: 0.14, duration: 0.9, y: 16 }, // PRATIUSH — the signature rises right behind the greeting
  roles: { delay: 0.24, duration: 0.6, y: 14 }, // credential — close premium stagger off the greeting
  tagline: { delay: 0.38, duration: 0.66, y: 22 }, // serif statement closes the lockup on the same stagger
  meta: { delay: 0.48, duration: 0.6, y: 14 }, // bottom-right locator follows
  // cue: { delay: 0.62, duration: 0.6, y: 0 }, // right-rail scroll cue fades in last
} as const satisfies Record<string, Beat>;
