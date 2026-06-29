"use client";

import {
  cubicBezier,
  motion,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";

import { easedScrollStart, INTRO_EASE } from "@/lib/intro";

/**
 * The big thesis statement that fills the RIGHT HALF beside the landed PROJECTS — a typographic
 * composition, not a caption. Set in Anton so the statement keeps its tall, cinematic poster force
 * beside the PRATIUSH → PROJECTS wordmark, with per-word SIZE variation so the six words both fit the
 * column and read as a designed, rhythmic stack (small → LARGE → tiny → LARGEST → medium). Right-
 * aligned, mostly ink-only, with "polished" carrying the terracotta payoff.
 *
 * The entrance is a SCROLL, not a fade: the block rises into place from below as you scroll (hidden
 * off-screen at rest), settles to read, then continues up and off the top — one continuous scrubbed
 * translate, so the scroll keeps moving the content the way the eye expects. Riding that rise, the
 * per-word ink-in WRITES the statement on (each word a faint GHOST guide with an INK layer wiping
 * across it via clip-path, windows overlapping so the line washes in as one gesture), synced to the
 * morph roll (INK_START = MorphName ROLL_START) so the words resolve as the name rolls into PROJECTS.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier
   (em) off the container's base clamp, so the whole block scales together and the rhythm is tunable
   here by eye. */
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

// Flatten once for global ink-in ordering (the wipe walks the words in reading order), keeping each
// word's line grouping for layout.
let counter = 0;
const INDEXED_LINES = LINES.map((line) =>
  line.map((tok) => ({ ...tok, index: counter++ })),
);
const TOTAL = counter;

const reveal = cubicBezier(...INTRO_EASE);

/* The statement SCROLLS into place from below as you scroll — a positional, scrubbed entrance, NOT a
   fade — so the scroll keeps moving the content the way the eye expects, then carries it back off the
   top. One continuous translate (see HeroThesis): rise in → hold to read → continue up and off. */
const ENTER_FROM = 70; // vh below the resting spot at scroll 0 — far enough to sit OFF-screen at rest
const ENTER_END = 0.22; // rises and settles into its resting, readable position by here
const SCROLL_START = 0.3; // after a short readable hold, it continues up and off the top
// A touch FASTER than 1:1 so it clears the frame (into the cluster's top feather mask) before the
// title→nav handoff; the rising NILINK card covers whatever is still on screen at the seam.
const SCROLL_LIFT = -78; // vh
const SCROLL_EASE_RAMP = 0.12; // fraction of the EXIT spent easing IN before it settles to scroll-rate

/* The per-word ink-on still WRITES the statement as it rises — kept synced to the morph roll
   (INK_START = MorphName ROLL_START) so the words resolve as the name rolls and the block settles.
   Each word's window is OVERLAP× its bare share of the band, so adjacent words overlap (≈3 in transit
   at once) and the line washes in instead of ticking word by word. */
const INK_START = 0.08;
const INK_END = 0.22; // fully inked as it lands in its readable position
const OVERLAP = 1.2;

function Word({
  token,
  progress,
}: {
  token: ThesisWord & { index: number };
  progress: MotionValue<number>;
}) {
  const slice = (INK_END - INK_START) / TOTAL;
  const center = INK_START + (token.index + 0.5) * slice;
  const start = Math.max(0, center - slice * OVERLAP);
  const end = Math.min(1, center + slice * OVERLAP);
  // Written-on, not faded-on: a faint GHOST of the whole word is the guide before the ink reaches it,
  // and an INK layer wipes across it left-to-right (clip-path). The clip uses a ZERO bottom inset (the
  // old -0.14em overshoot leaked the ghost as pale blocks past the ink edge). The ghost then FADES to
  // 0 exactly as the word's wipe completes, so nothing pale lingers at rest — independent of any box
  // mis-registration. Windows overlap so the statement washes in as one gesture.
  const clipPath = useTransform(
    progress,
    [start, end],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );
  const ghostOpacity = useTransform(
    progress,
    [Math.max(0, end - 0.035), end],
    [0.045, 0],
  );
  const className =
    token.tone === "accent"
      ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
      : "hero-thesis-v4__word";

  return (
    <>
      <span className={className} style={{ fontSize: `${token.scale}em` }}>
        <motion.span
          className="hero-thesis-v4__ghost"
          style={{ opacity: ghostOpacity }}
        >
          {token.word}
        </motion.span>
        <motion.span
          className="hero-thesis-v4__ink"
          style={{ clipPath }}
          aria-hidden
        >
          {token.word}
        </motion.span>
      </span>{" "}
    </>
  );
}

export function HeroThesis({ progress }: { progress: MotionValue<number> }) {
  // ONE continuous, scroll-linked translate — the entrance IS the movement, no opacity fade:
  //  • rise in from ENTER_FROM (below, off-screen at rest) and settle into place by ENTER_END,
  //  • hold at rest through the short read,
  //  • then continue up and off the top to SCROLL_LIFT (easing into scroll-rate over SCROLL_EASE_RAMP).
  const liftVh = useTransform(
    progress,
    [0, ENTER_END, SCROLL_START, 1],
    [ENTER_FROM, 0, 0, SCROLL_LIFT],
    { ease: [reveal, (t) => t, easedScrollStart(SCROLL_EASE_RAMP)] },
  );
  const lift = useTransform(liftVh, (v) => `${v}vh`);

  return (
    <motion.p
      className="hero-thesis-v4"
      style={{ "--thesis-lift": lift } as MotionStyle}
    >
      {/* The decorative ghost/ink word split is for the eye only — hide it from AT so the sentence
          isn't read word-by-word or doubled. The real value-prop sentence is exposed once below,
          so screen readers and SEO get the pitch (PRODUCT.md: real text exists even where the
          visible type is decorative). Appended LAST (it's position:absolute) so the
          .hero-thesis-v4__line:nth-child(3) "into" rule still targets the right line. */}
      {INDEXED_LINES.map((line, li) => (
        <span className="hero-thesis-v4__line" key={li} aria-hidden>
          {line.map((token) => (
            <Word key={token.index} token={token} progress={progress} />
          ))}
        </span>
      ))}
      <span className="visually-hidden">
        Turning rough ideas into polished products.
      </span>
    </motion.p>
  );
}
