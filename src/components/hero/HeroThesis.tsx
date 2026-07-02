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
 * The big thesis statement that inks in beside the landing PROJECTS — a typographic composition, not
 * a caption. Set in Anton so the statement keeps its tall, cinematic poster force beside the
 * morphing wordmark, with per-word SIZE variation so the words read as a designed, rhythmic
 * stack (small → LARGE → tiny → LARGEST → medium). Right-aligned, mostly ink-only, with "polished"
 * carrying the terracotta payoff.
 *
 * It is a LAYER OF THE PINNED HERO STAGE (`.hero-thesis-layer-v4` in HeroLede), scheduled on the
 * shared beat sheet: the per-word ink-on (each word a faint GHOST guide with an INK layer wiping
 * across it via clip-path) is scrubbed directly off the hero's pinned progress across THESIS_IN —
 * timed so the statement is writing itself on WHILE the word lands as PROJECTS, then RESTS beside it
 * as the composed projects frame until the pin releases. (It was previously its own scrolling
 * section, which physically could not rest beside the pinned title — real scroll carried it through
 * the viewport — and its ink landed after the unpin, leaving the vacuum this replaces.)
 *
 * A visually-hidden real sentence carries the value prop to screen readers / SEO; the decorative
 * lines are aria-hidden so the sentence isn't read word-by-word or doubled. Reduced motion: the
 * decorative poster is hidden entirely (the static hero frame is already full) and the sentence
 * remains for AT — see the reduced-motion rule in globals.css.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier
   (em) off the container's base clamp, so the whole block scales together and the rhythm is tunable
   here by eye. The words also render in reading order, which is the order the ink-on staggers. */
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

const WORD_COUNT = LINES.flat().length;
// Each line's first word's flat reading-order index — the ink stagger walks that order.
const LINE_STARTS = LINES.map((_, i) =>
  LINES.slice(0, i).reduce((n, line) => n + line.length, 0),
);

/* Per-word pacing across THESIS_IN: each word's wipe takes WORD_SPAN of the window and the starts
   are spread over the remainder, so consecutive words overlap heavily — the line washes on as one
   gesture rather than ticking word by word (the same stagger≪duration trick as the name's roll). */
const WORD_SPAN = 0.45;
const WIPE_DUR = (THESIS_IN[1] - THESIS_IN[0]) * WORD_SPAN;
const WIPE_STAGGER =
  WORD_COUNT > 1
    ? (THESIS_IN[1] - THESIS_IN[0] - WIPE_DUR) / (WORD_COUNT - 1)
    : 0;

const ease = cubicBezier(...INTRO_EASE);
const GHOST_ALPHA = 0.045;

/** One word's two overlaid layers: the faint ghost guide leads, the ink wipes across it. */
function InkWord({
  token,
  order,
  progress,
}: {
  token: ThesisWord;
  order: number;
  progress: MotionValue<number>;
}) {
  const start = THESIS_IN[0] + order * WIPE_STAGGER;
  const end = start + WIPE_DUR;

  // The ink wipes left→right across the word (clip-path) on the site's hard-landing ease.
  const clipPath = useTransform(
    progress,
    [start, end],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
    { ease },
  );
  // The guide appears a beat AHEAD of its wipe (the pencil line before the ink), then fades to
  // nothing as the word's ink completes — nothing pale lingers in the rest frame.
  const ghostOpacity = useTransform(
    progress,
    [start - WIPE_STAGGER, start, end],
    [0, GHOST_ALPHA, 0],
  );

  return (
    <span
      className={
        token.tone === "accent"
          ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
          : "hero-thesis-v4__word"
      }
      style={{ fontSize: `${token.scale}em` }}
    >
      <motion.span
        className="hero-thesis-v4__ghost"
        style={{ opacity: ghostOpacity }}
      >
        {token.word}
      </motion.span>
      <motion.span className="hero-thesis-v4__ink" style={{ clipPath }}>
        {token.word}
      </motion.span>
    </span>
  );
}

export function HeroThesis({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      <p className="hero-thesis-v4" aria-hidden>
        {LINES.map((line, li) => (
          <span className="hero-thesis-v4__line" key={li}>
            {line.map((token, wi) => (
              <InkWord
                key={wi}
                token={token}
                order={LINE_STARTS[li] + wi}
                progress={progress}
              />
            ))}{" "}
          </span>
        ))}
      </p>
      {/* The real value-prop sentence, exposed once for AT/SEO (PRODUCT.md: real text exists even
          where the visible type is decorative). A SIBLING of the decorative <p> so hiding the
          poster (reduced motion) never hides the sentence. */}
      <span className="visually-hidden">
        Turning rough ideas into polished products.
      </span>
    </>
  );
}
