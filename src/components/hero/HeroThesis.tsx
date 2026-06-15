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

/* Gate window (fractions of the morph track): opens right as the leader letter brakes. */
const GATE_START = 0.55;
const GATE_END = 0.64;
/* The per-word ink-in spans this slice — it opens as the word lands and finishes before the
   hero unpins, so the line settles and holds on screen. */
const INK_START = 0.62;
const INK_END = 0.96;
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
  // Lift from a faint ghost (not zero) to full — the manifesto's signature ink-in.
  const opacity = useTransform(progress, [start, end], [0.16, 1]);

  return (
    <motion.span
      className={
        token.accent
          ? "hero-thesis-v4__word hero-thesis-v4__word--accent"
          : "hero-thesis-v4__word"
      }
      style={{ opacity }}
    >
      {token.word}{" "}
    </motion.span>
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
