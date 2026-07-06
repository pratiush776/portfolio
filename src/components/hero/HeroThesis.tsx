"use client";

import {
  cubicBezier,
  motion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { THESIS_IN } from "@/components/hero/heroTimeline";
import { INTRO_EASE } from "@/lib/intro";

/**
 * The thesis statement — the transitional line between persona and projects, "Turning rough ideas into
 * polished products." It is a real typographic composition (Anton poster treatment) that PARALLAXES UP
 * from below the fold toward the top as the section transitions PERSONA → PROJECTS, then rides out with
 * the frame. The rise is a genuine parallax (a large `y` travel at a rate different from raw scroll,
 * INTRO_EASE) owned by NarrativeSection (the `y` on the wrapping layer); this component owns the poster
 * type and a simple fade-IN so the statement inks up as it climbs. The old per-word clip-path ink-wipe
 * is gone — the statement is legible whole, arriving by MOVEMENT, not by a wipe.
 *
 * Set in Anton so the statement keeps a tall, cinematic poster force, with per-word SIZE variation so
 * the words read as a designed, rhythmic stack (small → LARGE → tiny → LARGEST → medium). Right-aligned,
 * mostly ink-only, with "polished" carrying the terracotta payoff.
 *
 * A visually-hidden real sentence carries the value prop to screen readers / SEO; the decorative lines
 * are aria-hidden so the sentence isn't read word-by-word or doubled. Reduced motion: the decorative
 * poster is hidden entirely (the static hero frame is already full) and the sentence remains for AT —
 * see the reduced-motion rule in globals.css.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier (em)
   off the container's base clamp, so the whole block scales together and the rhythm is tunable here. */
const LINES: ThesisWord[][] = [
  [{ word: "Turning", scale: 0.62 }],
  [
    { word: "rough", scale: 1 },
    { word: "ideas", scale: 1 },
  ],
  // "into" lifted off its old runt size (0.46) so the dip reads as designed rhythm, not an accident.
  [{ word: "into", scale: 0.64 }],
  [{ word: "polished", scale: 1.12, tone: "accent" }],
  [{ word: "products", scale: 0.88 }],
];

const ease = cubicBezier(...INTRO_EASE);

export function HeroThesis({ progress }: { progress: MotionValue<number> }) {
  // A fade IN then OUT across the parallax rise: the statement inks up as it climbs (lit by ~40% of the
  // window), holds, then CLEARS as it crests toward the top (gone by the window's end). This is what
  // makes it a PASSING transitional statement — it rises from below, is read mid-climb, and is gone by
  // the time the projects grid scrolls in under the docked title. Without the fade-out it would stay
  // stuck at full opacity in the upper-right over the whole projects section, colliding with the cards.
  // The `y` parallax travel is owned by the wrapping layer in NarrativeSection (THESIS_IN + a large
  // rise); the two combine into one rising, arriving, departing gesture. INTRO_EASE, the site's curve.
  const span = THESIS_IN[1] - THESIS_IN[0];
  const opacity = useTransform(
    progress,
    [
      THESIS_IN[0],
      THESIS_IN[0] + span * 0.4,
      THESIS_IN[0] + span * 0.72,
      THESIS_IN[1],
    ],
    [0, 1, 1, 0],
    { ease },
  );

  return (
    <>
      <motion.p className="hero-thesis-v4" aria-hidden style={{ opacity }}>
        {LINES.map((line, li) => (
          <span className="hero-thesis-v4__line" key={li}>
            {line.map((token, wi) => (
              <span
                key={wi}
                className={
                  token.tone === "accent"
                    ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
                    : "hero-thesis-v4__word"
                }
                style={{ fontSize: `${token.scale}em` }}
              >
                {token.word}
              </span>
            ))}{" "}
          </span>
        ))}
      </motion.p>
      {/* The real value-prop sentence, exposed once for AT/SEO (PRODUCT.md: real text exists even
          where the visible type is decorative). A SIBLING of the decorative <p> so hiding the
          poster (reduced motion) never hides the sentence. */}
      <span className="visually-hidden">
        Turning rough ideas into polished products.
      </span>
    </>
  );
}
