"use client";

import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";

import { INTRO_EASE } from "@/lib/intro";

/**
 * The line that frames the work, revealed beside the LANDED PROJECTS. It anchors in the
 * lower-left — echoing the hero lockup's corner rather than floating level with the title, so
 * the landed frame reads as a composed thirds layout (anchored copy + display + negative space),
 * not an odd two-column split. It inks in word by word as the name brakes into PROJECTS.
 *
 * Two layers compose: a block GATE (opacity 0→1 right as the word lands, so the faint ghost
 * never shows over the resting hero) and the per-word ink-in inside it (each word lifts from a
 * faint ghost to full, windows overlapping so the line washes in rather than ticking word by
 * word). The accent word carries the terracotta, tying the copy to PROJECTS.
 */
type Segment = { text: string; accent?: boolean };

const SEGMENTS: Segment[] = [
  { text: "Turning rough ideas into" },
  { text: "polished", accent: true },
  { text: "products" },
];

type WordToken = { word: string; accent: boolean };

const TOKENS: WordToken[] = SEGMENTS.flatMap(({ text, accent }) =>
  text.split(" ").map((word) => ({ word, accent: accent ?? false })),
);

const reveal = cubicBezier(...INTRO_EASE);

/* Gate window (fractions of the morph track): opens right as the word brakes into PROJECTS
   (ROLL_END ≈ 0.44). */
const GATE_START = 0.38;
const GATE_END = 0.46;
/* The per-word ink-in spans this slice — it opens as the word lands and washes on through the
   back half of the pin, so the reader always has copy resolving while PROJECTS holds. */
const INK_START = 0.44;
const INK_END = 0.92;
/* Each word's window is this multiple of its bare share of the band, so adjacent words overlap
   (≈3 in transit at once) and the line washes in instead of ticking word by word. */
const OVERLAP = 1.15;

function Word({
  token,
  index,
  total,
  progress,
}: {
  token: WordToken;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const slice = (INK_END - INK_START) / total;
  const center = INK_START + (index + 0.5) * slice;
  const start = Math.max(0, center - slice * OVERLAP);
  const end = Math.min(1, center + slice * OVERLAP);
  // Written-on, not faded-on. Two layers, exactly overlaid: a faint GHOST of the whole word that
  // is always present (it sets the box and the guide), and an INK layer that wipes across it
  // left-to-right (clip-path). So the full line is faintly there from the start and each word is
  // drawn over its guide — never the broken fragments a single clipped layer would show. Windows
  // overlap (≈3 words in transit) so the statement washes in as one gesture.
  const clipPath = useTransform(
    progress,
    [start, end],
    ["inset(0 100% -0.14em 0)", "inset(0 0% -0.14em 0)"],
  );
  const className = token.accent
    ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
    : "hero-thesis-v4__word";

  return (
    <>
      <span className={className}>
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
      {TOKENS.map((token, i) => (
        <Word key={i} token={token} index={i} total={TOKENS.length} progress={progress} />
      ))}
    </motion.p>
  );
}
