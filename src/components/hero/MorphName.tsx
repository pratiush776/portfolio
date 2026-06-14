"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE, SNAP_EASE } from "@/lib/intro";

/**
 * The hero name — and the landing's one big move. PRATIUSH is real text (Pier bold caps in
 * the brand terracotta), so while the hero is pinned the name itself transforms in place:
 * gravity hauls it from its left anchor to the right edge, and it lands as PROJECTS — the
 * section title for the work below. Both words are 8 letters sharing P and R, so this is a
 * per-letter transformation, not a swap.
 *
 * TYPE FIDELITY — each slot stacks two glyphs (the PRATIUSH letter and its PROJECTS
 * replacement), and a naive stack sizes the slot to the WIDER of the two, which wrecked
 * the resting letterfit ("PRA TI USH"). Splitting a word into flex children also disables
 * the font's normal pair kerning. Every slot therefore measures both glyph widths AND the
 * preceding pair's kerning correction, then interpolates both during its roll. The travel
 * distance re-measures itself (ResizeObserver on the run) as the word's total width changes,
 * so the landing stays exactly right-aligned.
 *
 * What makes the move read physical rather than mechanical:
 *  • REVERSE-STAGGER PULL — the rightmost letter is nearest the pull, so it breaks away
 *    first and lands first; the word stretches in flight and re-compresses as it brakes.
 *    SNAP_EASE gives the dead-stop landing.
 *  • TAFFY STRETCH — each letter scales horizontally on its own triangular curve (peaking
 *    at its own fastest moment, origin on the trailing edge). No whole-word skew.
 *  • ROLL AT SPEED — each slot rolls its glyph (old up, new rises from below — the site's
 *    mask language) at the midpoint of ITS OWN flight, while that letter is moving fastest.
 *
 * The intro entrance (mask-rise on the foreground gate, BEAT.wordmark) lives on a wrapper
 * node, so it never fights the scrub on the letters.
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
const PULL_START = 0.16; // the leader (rightmost letter) breaks away
const START_STAGGER = 0.02; // per letter behind the leader → the stretch
const PULL_END = 0.62; // the leader lands
const END_STAGGER = 0.015; // trailing letters brake in sequence behind it
const STRETCH_MAX = 1.14; // peak taffy stretch per letter
const ROLL_SPAN = 0.07; // half-width of each letter's glyph-roll window

const snap = cubicBezier(...SNAP_EASE);
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
  shift,
}: {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  fromOpticalFit: number;
  toOpticalFit: number;
  index: number;
  progress: MotionValue<number>;
  shift: MotionValue<number>;
}) {
  // lead = 0 for the rightmost letter: it starts first AND lands first.
  const lead = N - 1 - index;
  const start = PULL_START + lead * START_STAGGER;
  const end = PULL_END + lead * END_STAGGER;
  const mid = (start + end) / 2;

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

      // All samples live in the hidden, untransformed metrics row. This preserves subpixel
      // font metrics without allowing the animated slot's scaleX to corrupt the result.
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

  // Eased flight fraction for THIS letter × the measured travel distance.
  const flight = useTransform(progress, [start, end], [0, 1], { ease: snap });
  const x = useTransform(() => flight.get() * shift.get());

  const scaleX = useTransform(progress, [start, mid, end], [1, STRETCH_MAX, 1]);

  // Glyph roll + width handoff share one window, centred on this letter's fastest moment.
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
        x,
        scaleX,
        width: metrics ? width : undefined,
        marginLeft: metrics ? marginLeft : undefined,
        transformOrigin: "0% 50%",
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
  const rowRef = useRef<HTMLParagraphElement>(null);
  const runRef = useRef<HTMLSpanElement>(null);
  const shift = useMotionValue(0);

  useLayoutEffect(() => {
    if (reduce) return;
    const measure = () => {
      const row = rowRef.current;
      const run = runRef.current;
      if (!row || !run) return;
      shift.set(Math.max(0, row.clientWidth - run.offsetWidth));
    };
    measure();
    // The run's width changes as the slots hand off (PRATIUSH → PROJECTS widths), so the
    // observer keeps the travel distance honest mid-flight and the landing right-aligned.
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    if (runRef.current) ro.observe(runRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [reduce, shift]);

  // Reduced motion: the name, plainly — no pull, no roll (the intro gate settles it).
  if (reduce) {
    return (
      <p className="hero-name-v4" aria-hidden>
        <span className="hero-name-v4__run">PRATIUSH</span>
      </p>
    );
  }

  return (
    <p ref={rowRef} className="hero-name-v4" aria-hidden>
      {/* Entrance mask: the name rises from behind its baseline on the foreground gate —
          a separate node from the scrubbed letters, so the two never fight. */}
      <span className="hero-name-v4__reveal">
        <motion.span
          ref={runRef}
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
              shift={shift}
            />
          ))}
        </motion.span>
      </span>
    </p>
  );
}
