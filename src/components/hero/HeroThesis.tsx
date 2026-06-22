"use client";

import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";

import { INTRO_EASE } from "@/lib/intro";

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
 * Re-ordered choreography: the thesis LEADS — it inks in first (≈0.10–0.30), and the name morphs
 * into PROJECTS once this is ~80% formed (MorphName ROLL_START ≈ 0.26), so the pitch reads, then the
 * word transforms beneath it.
 */
type ThesisWord = { word: string; scale: number; tone?: "accent" };

/* The composition: each inner array is one right-aligned line; `scale` is a font-size multiplier
   (em) off the container's base clamp, so the whole block scales together and the rhythm is tunable
   here by eye. */
const LINES: ThesisWord[][] = [
  [{ word: "Turning", scale: 0.6 }],
  [{ word: "rough", scale: 1 }, { word: "ideas", scale: 1 }],
  [{ word: "into", scale: 0.46 }],
  [{ word: "polished", scale: 1.15, tone: "accent" }],
  [{ word: "products", scale: 0.88 }],
];

// Flatten once for global ink-in ordering (the wipe walks the words in reading order), keeping each
// word's line grouping for layout.
let counter = 0;
const INDEXED_LINES = LINES.map((line) => line.map((tok) => ({ ...tok, index: counter++ })));
const TOTAL = counter;

const reveal = cubicBezier(...INTRO_EASE);

const GATE_START = 0.07;
const GATE_END = 0.12;
/* The per-word ink-in spans this slice — it washes in as ONE quick gesture and completes around
   0.30, so the statement is mostly formed before the name starts rolling and fully formed while
   PROJECTS lands. The morph begins around 80% of this window (0.10 + 0.80·0.20 ≈ 0.26). */
const INK_START = 0.1;
const INK_END = 0.3;
/* Each word's window is this multiple of its bare share of the band, so adjacent words overlap
   (≈3 in transit at once) and the line washes in instead of ticking word by word. */
const OVERLAP = 1.3;

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
  const ghostOpacity = useTransform(progress, [Math.max(0, end - 0.035), end], [0.1, 0]);
  const className =
    token.tone === "accent"
      ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
      : "hero-thesis-v4__word";

  return (
    <>
      <span className={className} style={{ fontSize: `${token.scale}em` }}>
        <motion.span className="hero-thesis-v4__ghost" style={{ opacity: ghostOpacity }}>
          {token.word}
        </motion.span>
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
