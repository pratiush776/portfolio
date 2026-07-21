"use client";

import {
  cubicBezier,
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { THESIS_IN, THESIS_OUT, THESIS_RISE } from "@/components/hero/heroTimeline";
import { INTRO_EASE } from "@/lib/intro";

/**
 * The thesis statement — "Turning rough ideas into polished products." — the BRIDGE CHAPTER between
 * PERSONA and PROJECTS, staged as a PASSING statement carried by the scroll (user-directed, replaces
 * the old held left-anchored frame): CENTERED in the viewport (its sticky rail centres it), it rides
 * UP from below the fold toward dead centre over THESIS_RISE — a LINEAR y, so the climb feels like
 * the page's own scroll, not an animation — inking IN over THESIS_IN as it climbs, and dissolving
 * over THESIS_OUT exactly as it reaches the centre. Gone with a breath to spare before MORPH 2. The
 * persona block has released and the DNA has exited by the time it arrives — the bridge owns the
 * stage alone.
 *
 * Set in the ONE display serif (Fraunces) as a centered editorial statement with a restrained
 * per-line size rhythm; "polished" carries the terracotta accent.
 *
 * A visually-hidden real sentence carries the value prop to screen readers / SEO; the decorative
 * lines are aria-hidden so the sentence isn't read word-by-word or doubled. Reduced motion renders
 * the statement statically (full opacity, no scrub) so the motionless page still reads complete.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one line; `scale` is a font-size multiplier (em) off the
   container's base clamp, so the whole block scales together and the rhythm is tunable here. */
const LINES: ThesisWord[][] = [
  [{ word: "Turning", scale: 0.62 }],
  [
    { word: "rough", scale: 1 },
    { word: "ideas", scale: 1 },
  ],
  [{ word: "into", scale: 0.62 }],
  [
    { word: "polished", scale: 1, tone: "accent" },
    { word: "products", scale: 1 },
  ],
];

const ease = cubicBezier(...INTRO_EASE);

export function HeroThesis({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion() ?? false;

  // Ink IN over THESIS_IN while it climbs, read through the middle, dissolve over THESIS_OUT just
  // as it arrives at the viewport's centre — a passing statement, never a parked one.
  const opacity = useTransform(
    progress,
    [THESIS_IN[0], THESIS_IN[1], THESIS_OUT[0], THESIS_OUT[1]],
    [0, 1, 1, 0],
    { ease },
  );
  // The RIDE: from below the fold up to dead centre — LINEAR so it reads as scroll carrying the
  // statement, not a separate animation. y starts with the cluster's bottom near the viewport foot.
  const y = useTransform(progress, [...THESIS_RISE], ["72vh", "0vh"]);

  return (
    <>
      <motion.p
        className="hero-thesis-v4"
        aria-hidden
        style={reduce ? undefined : { opacity, y }}
      >
        {LINES.map((line, li) => (
          <span className="hero-thesis-v4__line" key={li}>
            {line.map((token, wi) => (
              // The words are inline-block spans (so the per-line size rhythm composes), which
              // makes them ignore adjacent JSX whitespace — a REAL space text node must be emitted
              // BETWEEN them or multi-word lines collapse ("roughideas"). The space lives at the
              // line's base size, so the gap scales with the composition.
              <span key={wi}>
                {wi > 0 ? " " : null}
                <span
                  className={
                    token.tone === "accent"
                      ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
                      : "hero-thesis-v4__word"
                  }
                  style={{ fontSize: `${token.scale}em` }}
                >
                  {token.word}
                </span>
              </span>
            ))}
          </span>
        ))}
      </motion.p>
      {/* The real value-prop sentence, exposed once for AT/SEO. A SIBLING of the decorative <p> so
          the decorative treatment never hides the sentence from assistive tech. */}
      <span className="visually-hidden">
        Turning rough ideas into polished products.
      </span>
    </>
  );
}
