"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE } from "@/lib/intro";

/**
 * The hero name — and the landing's one big move. PRATIUSH is real text (Pier bold caps in the
 * brand terracotta) so it can transform IN PLACE while the hero is pinned: the name holds its
 * left anchor (the P never moves) and each slot rolls its glyph from the PRATIUSH letter to its
 * PROJECTS replacement, so the word becomes PROJECTS — the section title for the work below —
 * without travelling across the stage. Both words are 8 letters sharing P and R, so this is a
 * per-letter transformation, not a swap (and the shared P/R slots roll glyph→same glyph, so they
 * sit perfectly still — the left edge is rock-steady through the whole move).
 *
 * TYPE FIDELITY — each slot stacks two glyphs (the PRATIUSH letter and its PROJECTS replacement),
 * and a naive stack sizes the slot to the WIDER of the two, which wrecked the resting letterfit
 * ("PRA TI USH"). Splitting a word into flex children also disables the font's normal pair
 * kerning. Every slot therefore measures both glyph widths AND the preceding pair's kerning
 * correction, then interpolates both during its roll, so the word stays correctly fit AND
 * left-anchored at every frame of the handoff.
 *
 * What makes it read as a deliberate transformation rather than a flat crossfade:
 *  • ROLL — each slot rolls its glyph (old up, new rises from below — the site's mask language)
 *    in a tight window centred on its own moment.
 *  • SEQUENCED — a right-to-left stagger walks the roll across the word, so it reads as one
 *    continuous wave settling into PROJECTS rather than every letter flipping at once.
 *
 * The intro entrance (mask-rise on the foreground gate, BEAT.wordmark) lives on a wrapper node,
 * so it never fights the scrub on the letters.
 */
const FROM = "PRATIUSH".split("");
const TO = "PROJECTS".split("");
const N = FROM.length;

/*
 * League Spartan's native kerning is built for normal reading sizes. At this wordmark scale the
 * counter-space goes uneven, so each offset (in em, applied to the gap BEFORE that letter) nudges
 * one pair toward even color rather than imposing uniform tracking; index 0 has no preceding pair.
 * The earlier pass over-opened R|A and A|T, which left the centre loose against the tighter ends —
 * those are eased back, and the naturally gappy T|I (the crossbar leaves air before the I stem) is
 * pulled in. Net result reads as one even-toned word. Per-pair signs: + opens the gap, − tightens.
 */
//                            P  R     A     T      I      U      S  H
const FROM_OPTICAL_FIT = [0, 0, 0.02, 0.025, -0.02, -0.01, 0, 0];
const TO_OPTICAL_FIT = [0, 0, 0, 0, 0, 0, 0, 0];

/* ── Choreography knobs (fractions of the hero's pinned track) ──────────────────────── */
const ROLL_START = 0.16; // the leader (rightmost slot) begins its glyph roll
const ROLL_END = 0.62; // the trailing slot (leftmost) finishes — the word has fully landed
const ROLL_SPAN = 0.07; // half-width of each slot's glyph-roll window, centred on its moment

const reveal = cubicBezier(...INTRO_EASE);

function MorphLetter({
  from,
  to,
  previousFrom,
  previousTo,
  fromOpticalFit,
  toOpticalFit,
  index,
  progress,
}: {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  fromOpticalFit: number;
  toOpticalFit: number;
  index: number;
  progress: MotionValue<number>;
}) {
  // lead = 0 for the rightmost slot: it rolls first; the leftmost (the P) rolls last. The roll
  // centres walk evenly across [ROLL_START, ROLL_END], giving the right-to-left wave.
  const lead = N - 1 - index;
  const mid = ROLL_START + (lead / (N - 1)) * (ROLL_END - ROLL_START);

  // Natural advance widths plus each word's real pair-kerning correction. A generic negative
  // margin cannot fit PR, RA, AT, TI, etc. because every pair needs a different adjustment.
  const fromPreviousRef = useRef<HTMLSpanElement>(null);
  const toPreviousRef = useRef<HTMLSpanElement>(null);
  const fromCurrentRef = useRef<HTMLSpanElement>(null);
  const toCurrentRef = useRef<HTMLSpanElement>(null);
  const fromPairRef = useRef<HTMLSpanElement>(null);
  const toPairRef = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState<{
    fromWidth: number;
    toWidth: number;
    fromKern: number;
    toKern: number;
  } | null>(null);

  useLayoutEffect(() => {
    const visualWidth = (node: HTMLSpanElement | null) =>
      node?.getBoundingClientRect().width ?? 0;

    const measure = () => {
      const f = fromCurrentRef.current;
      const t = toCurrentRef.current;
      if (!f || !t) return;

      // All samples live in the hidden, untransformed metrics row, preserving subpixel font
      // metrics.
      const fromWidth = visualWidth(f);
      const toWidth = visualWidth(t);
      const fontSize = Number.parseFloat(getComputedStyle(f).fontSize);
      const fromKern = previousFrom
        ? visualWidth(fromPairRef.current) -
          visualWidth(fromPreviousRef.current) -
          fromWidth +
          fromOpticalFit * fontSize
        : 0;
      const toKern = previousTo
        ? visualWidth(toPairRef.current) -
          visualWidth(toPreviousRef.current) -
          toWidth +
          toOpticalFit * fontSize
        : 0;

      setMetrics((current) => {
        const next = { fromWidth, toWidth, fromKern, toKern };
        if (
          current &&
          Math.abs(current.fromWidth - next.fromWidth) < 0.01 &&
          Math.abs(current.toWidth - next.toWidth) < 0.01 &&
          Math.abs(current.fromKern - next.fromKern) < 0.01 &&
          Math.abs(current.toKern - next.toKern) < 0.01
        ) {
          return current;
        }
        return next;
      });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [from, fromOpticalFit, previousFrom, previousTo, to, toOpticalFit]);

  // Glyph roll + width/kerning handoff share one window, centred on this slot's moment.
  const y = useTransform(progress, [mid - ROLL_SPAN, mid + ROLL_SPAN], ["0%", "-50%"], {
    ease: reveal,
  });
  const width = useTransform(
    progress,
    [mid - ROLL_SPAN, mid + ROLL_SPAN],
    [metrics?.fromWidth ?? 0, metrics?.toWidth ?? 0],
    { ease: reveal },
  );
  const marginLeft = useTransform(
    progress,
    [mid - ROLL_SPAN, mid + ROLL_SPAN],
    [metrics?.fromKern ?? 0, metrics?.toKern ?? 0],
    { ease: reveal },
  );

  return (
    <motion.span
      className="hero-name-v4__letter"
      style={{
        width: metrics ? width : undefined,
        marginLeft: metrics ? marginLeft : undefined,
      }}
    >
      <motion.span className="hero-name-v4__roll" style={{ y }}>
        <span>{from}</span>
        <span>{to}</span>
      </motion.span>
      <span className="hero-name-v4__metrics" aria-hidden>
        <span ref={fromCurrentRef}>{from}</span>
        <span ref={toCurrentRef}>{to}</span>
        <span ref={fromPreviousRef}>{previousFrom}</span>
        <span ref={fromPairRef}>
          {previousFrom}
          {from}
        </span>
        <span ref={toPreviousRef}>{previousTo}</span>
        <span ref={toPairRef}>
          {previousTo}
          {to}
        </span>
      </span>
    </motion.span>
  );
}

export function MorphName({ progress }: { progress: MotionValue<number> }) {
  const { foregroundIn, reduce } = useIntro();

  // The ghosted "MY" graphic behind the LANDED word: an oversized, faint INK echo of the title
  // (see .hero-name-ghost-v4). It fades to its faint rest opacity as the word finishes landing;
  // positioning lives entirely in CSS (parked at the left, where PROJECTS now lands).
  const ghostOpacity = useTransform(
    progress,
    [ROLL_END - 0.05, ROLL_END + 0.05],
    [0, 0.09],
    { ease: reveal },
  );

  // Reduced motion: the name, plainly — no roll (the intro gate settles it).
  if (reduce) {
    return (
      <p className="hero-name-v4" aria-hidden>
        <span className="hero-name-v4__run">PRATIUSH</span>
      </p>
    );
  }

  return (
    <p className="hero-name-v4" aria-hidden>
      {/* The ghosted "MY" graphic — oversized + faint, parked BEHIND the left-landing PROJECTS
          (CSS) for depth, fading in as the word lands (see ghostOpacity). */}
      <motion.span className="hero-name-ghost-v4" style={{ opacity: ghostOpacity }}>
        My
      </motion.span>

      {/* Entrance mask: the name rises from behind its baseline on the foreground gate —
          a separate node from the scrubbed letters, so the two never fight. */}
      <span className="hero-name-v4__reveal">
        <motion.span
          className="hero-name-v4__run"
          initial={{ y: "104%", opacity: 0 }}
          animate={foregroundIn ? { y: "0%", opacity: 1 } : { y: "104%", opacity: 0 }}
          transition={{
            duration: BEAT.wordmark.duration,
            ease: INTRO_EASE,
            delay: BEAT.wordmark.delay,
          }}
        >
          {FROM.map((ch, i) => (
            <MorphLetter
              key={i}
              from={ch}
              to={TO[i]}
              previousFrom={FROM[i - 1] ?? ""}
              previousTo={TO[i - 1] ?? ""}
              fromOpticalFit={FROM_OPTICAL_FIT[i]}
              toOpticalFit={TO_OPTICAL_FIT[i]}
              index={i}
              progress={progress}
            />
          ))}
        </motion.span>
      </span>
    </p>
  );
}
