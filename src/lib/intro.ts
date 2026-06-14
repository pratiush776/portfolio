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
 *  • SNAP_EASE — big scrubbed moves (the PROJECTS gravity pull); the hardest stop.
 * CSS micro-interactions (underlines, arrows) use --ease-micro, same family.
 */
export const INTRO_EASE = [0.82, 0, 0.18, 1] as const;
export const SNAP_EASE = [0.9, 0, 0.1, 1] as const;

/** Hard cap on how long the foreground waits for `document.fonts.ready` before it plays anyway. */
export const FONT_GATE_MS = 800;

export type Beat = { delay: number; duration: number; y: number };

export const BEAT = {
  eyebrow: { delay: 0.0, duration: 0.7, y: 14 }, // "Hi, I'm" — the whisper that leads
  wordmark: { delay: 0.18, duration: 0.95, y: 16 }, // PRATIUSH — the signature (mask-rise)
  roles: { delay: 0.62, duration: 0.65, y: 14 }, // credential — snaps in as the name is ~50% revealed
  tagline: { delay: 1.0, duration: 0.82, y: 22 }, // the serif statement closes the lockup, last of the copy
  meta: { delay: 1.08, duration: 0.65, y: 14 }, // bottom-right locator
  cue: { delay: 1.2, duration: 0.6, y: 0 }, // right-rail scroll cue fades in last
} as const satisfies Record<string, Beat>;
