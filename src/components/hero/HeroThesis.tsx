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
 * Two layers compose the reveal: a block GATE (opacity 0→1, so the faint ghost never shows over the
 * resting hero) and the per-word ink-in inside it — each word is a faint GHOST guide with an INK
 * layer wiping across it (clip-path), windows overlapping so the statement washes in as one gesture.
 * Choreography: the thesis inks in the INSTANT the name's first real letter changes (A→O) — INK_START
 * is synced to MorphName ROLL_START — so the statement writes itself on AS the morph rolls. It then
 * SCROLLS normally up and off the top at scroll rate once read (~0.27), so the pitch reads in full,
 * then scrolls away like ordinary content while PROJECTS settles and the first work panel later crests.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier
   (em) off the container's base clamp, so the whole block scales together and the rhythm is tunable
   here by eye. */
const LINES: ThesisWord[][] = [
  [{ word: "Turning", scale: 0.6 }],
  [
    { word: "rough", scale: 1 },
    { word: "ideas", scale: 1 },
  ],
  [{ word: "into", scale: 0.46 }],
  [{ word: "polished", scale: 1.15, tone: "accent" }],
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

const GATE_START = 0.07;
const GATE_END = 0.12;
/* The per-word ink-in begins the instant the name's first real letter changes (INK_START =
   MorphName ROLL_START) and washes in as ONE quick gesture. As it completes the statement SCROLLS up
   and off the top (see SCROLL below): the pitch reads, then scrolls away while the name finishes
   morphing into PROJECTS. */
const INK_START = 0.08; // = MorphName ROLL_START — the thesis writes on the instant A→O begins to roll
const INK_END = 0.3;

/* The thesis writes on, then SCROLLS normally up and off the top the instant it's read (~0.27) — not a
   designed drift, just a plain scroll-rate lift, so it reads as ordinary content scrolling away while
   the name morphs on the left and the first work panel crests. The pin spans ~120vh of scroll (track
   220vh − 100vh sticky) = 1.0 of progress, so a slope of ~120vh per progress matches the true scroll
   rate. The lift rides a CSS var so the box keeps its translateY(-50%) centring (.hero-thesis-v4) and
   the scroll stacks on top of it. */
const SCROLL_START = 0.27; // begins the instant the ink is done
const SCROLL_LIFT = "-82.8vh"; // (1 − SCROLL_START) × ~120vh pin → tracks scroll 1:1 out to progress 1.0
const SCROLL_EASE_RAMP = 0.12; // fraction of the move spent easing IN before it settles to scroll-rate
/* Each word's window is this multiple of its bare share of the band, so adjacent words overlap
   (≈3 in transit at once) and the line washes in instead of ticking word by word. */
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
    [0.1, 0],
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
  // Entrance gate only — no exit fade; the statement scrolls off the top at full opacity like normal
  // content (the hero's overflow:hidden clips it as it leaves).
  const opacity = useTransform(progress, [GATE_START, GATE_END], [0, 1], {
    ease: reveal,
  });
  // Tracks the scroll ~1:1 (ordinary scroll-away), but with a soft CUBIC launch easing into that rate
  // over the first SCROLL_EASE_RAMP of the move — so it accelerates into the scroll instead of snapping
  // from held-still to full speed the instant SCROLL_START is crossed.
  const lift = useTransform(progress, [SCROLL_START, 1], ["0vh", SCROLL_LIFT], {
    ease: easedScrollStart(SCROLL_EASE_RAMP),
  });

  return (
    <motion.p
      className="hero-thesis-v4"
      style={{ opacity, "--thesis-lift": lift } as MotionStyle}
      aria-hidden
    >
      {INDEXED_LINES.map((line, li) => (
        <span className="hero-thesis-v4__line" key={li}>
          {line.map((token) => (
            <Word key={token.index} token={token} progress={progress} />
          ))}
        </span>
      ))}
    </motion.p>
  );
}
