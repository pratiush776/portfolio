"use client";

import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";

import { INTRO_EASE } from "@/lib/intro";

/**
 * The big thesis statement that fills the RIGHT HALF beside the landed PROJECTS — a typographic
 * composition, not a caption. Set in Anton (a heavy condensed display grotesque) with per-word SIZE
 * variation so the six words both fit the column and read as a designed, rhythmic stack (small →
 * LARGE → tiny → LARGEST → medium, with "polished" as the visual payoff). Right-aligned, ink-only —
 * emphasis comes from scale, not colour.
 *
 * Two layers compose the reveal: a block GATE (opacity 0→1, so the faint ghost never shows over the
 * resting hero) and the per-word ink-in inside it — each word is a faint GHOST guide with an INK
 * layer wiping across it (clip-path), windows overlapping so the statement washes in as one gesture.
 * Re-ordered choreography: the thesis LEADS — it inks in first (≈0.12–0.34), and the name only morphs
 * into PROJECTS once this is ~80% formed (MorphName ROLL_START ≈ 0.30), so the pitch reads, then the
 * word transforms beneath it.
 */
type ThesisWord = { word: string; scale: number };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier
   (em) off the container's base clamp, so the whole block scales together and the rhythm is tunable
   here by eye. */
const LINES: ThesisWord[][] = [
  [{ word: "Turning", scale: 0.6 }],
  [{ word: "rough", scale: 1 }, { word: "ideas", scale: 1 }],
  [{ word: "into", scale: 0.46 }],
  [{ word: "polished", scale: 1.15 }],
  [{ word: "products", scale: 0.88 }],
];

// Flatten once for global ink-in ordering (the wipe walks the words in reading order), keeping each
// word's line grouping for layout.
let counter = 0;
const INDEXED_LINES = LINES.map((line) => line.map((tok) => ({ ...tok, index: counter++ })));
const TOTAL = counter;

const reveal = cubicBezier(...INTRO_EASE);

const GATE_START = 0.08;
const GATE_END = 0.16;
/* The per-word ink-in spans this slice — it washes in as ONE quick gesture and COMPLETES (~0.34)
   well before the morph finishes (~0.65), so the full statement is formed and HOLDING as the name
   transforms beneath it. The morph begins at ~80% of this window (0.12 + 0.8·0.22 ≈ 0.30). */
const INK_START = 0.12;
const INK_END = 0.34;
/* Each word's window is this multiple of its bare share of the band, so adjacent words overlap
   (≈3 in transit at once) and the line washes in instead of ticking word by word. */
const OVERLAP = 1.15;

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
  // Written-on, not faded-on: a faint GHOST of the whole word is always present (sets the box and
  // the guide), and an INK layer wipes across it left-to-right (clip-path) — so each word is drawn
  // over its guide rather than showing the broken fragments a single clipped layer would. Windows
  // overlap so the statement washes in as one gesture.
  const clipPath = useTransform(
    progress,
    [start, end],
    ["inset(0 100% -0.14em 0)", "inset(0 0% -0.14em 0)"],
  );

  return (
    <>
      <span className="hero-thesis-v4__word" style={{ fontSize: `${token.scale}em` }}>
        <span className="hero-thesis-v4__ghost">{token.word}</span>
        <motion.span className="hero-thesis-v4__ink" style={{ clipPath }} aria-hidden>
          {token.word}
        </motion.span>
      </span>{" "}
    </>
  );
}

export function HeroThesis({ progress }: { progress: MotionValue<number> }) {
  const gate = useTransform(progress, [GATE_START, GATE_END], [0, 1], { ease: reveal });

  return (
    <motion.p className="hero-thesis-v4" style={{ opacity: gate }} aria-hidden>
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
