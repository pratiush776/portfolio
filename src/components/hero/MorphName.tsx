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
 *  • ROLL — each CHANGING slot rolls its glyph (old up, new rises from below — the site's mask
 *    language) in a tight window centred on its own moment. The shared P and R (from === to) do
 *    NOT roll: they hold dead still, so the word never animates a letter into itself and the left
 *    edge is anchored by real, un-moving type rather than a glyph rolling over its twin.
 *  • SEQUENCED — a LEFT-TO-RIGHT stagger walks the roll across the changing letters, so the word
 *    reads as one continuous wave settling into PROJECTS rather than every letter flipping at once.
 *
 * The intro entrance (mask-rise on the foreground gate, BEAT.wordmark) lives on a wrapper node,
 * so it never fights the scrub on the letters.
 */
const FROM = "PRATIUSH".split("");
const TO = "PROJECTS".split("");

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

/* ── Choreography knobs (fractions of the hero's pinned track) ──────────────────────────────
 *
 * The wave is parameterised by TWO independent knobs, so the overlap is set directly rather than
 * falling out of a band width:
 *   • ROLL_DUR     — how long ONE letter takes to roll its glyph (its start→finish window).
 *   • ROLL_STAGGER — the slight delay between consecutive letters' STARTS.
 * Keeping ROLL_STAGGER well under ROLL_DUR is the whole trick: the next letter kicks off when the
 * previous has only just begun moving up (≈ROLL_STAGGER/ROLL_DUR through it, ~24% here), so several
 * letters are mid-roll at once and the morph reads as one smooth, wavy gesture instead of a relay
 * that waits for each glyph to nearly finish before the next starts. ROLL_END is DERIVED — the
 * moment the last letter finishes — so the landing-keyed effects stay in sync automatically. */
const ROLL_START = 0.08; // the leader (first CHANGING slot, left) begins its glyph roll
const ROLL_DUR = 0.16; // duration of a single letter's glyph roll
const ROLL_STAGGER = 0.038; // delay between consecutive letters' starts (≪ ROLL_DUR → wavy overlap)

// A smooth, premium ease-in-out cubic for width/kerning + the incoming rotation — gentler than the
// site's hard-landing INTRO_EASE so those glide rather than snap.
const MORPH_EASE = [0.65, 0, 0.35, 1] as const;
const reveal = cubicBezier(...MORPH_EASE);

// The outgoing letters exit on a FAST-START ease — quick off the mark, then a long settle — so the
// old glyph shoots up immediately while the new one eases in beneath it.
const OUTGOING_EASE = [0.16, 1, 0.3, 1] as const;
const outgoingEase = cubicBezier(...OUTGOING_EASE);

// The incoming glyph enters TILTED and rotates to 0° (properly aligned) as it lands.
const INCOMING_ROT = -16; // degrees

/*
 * Roll order, walked LEFT-TO-RIGHT across only the letters that actually change. A slot whose
 * glyph is identical in both words (P at 0, R at 1) gets `null` — it never rolls, it just holds.
 * The changing slots get a 0-based wave position, so the first changing letter (A→O) leads and
 * the last (H→S) lands the word. `ROLL_COUNT` is how many slots are in the wave.
 */
let rollSeen = 0;
const ROLL_ORDER: (number | null)[] = FROM.map((ch, i) =>
  ch === TO[i] ? null : rollSeen++,
);
const ROLL_COUNT = rollSeen;

// Derived: the trailing letter's start + its duration — the instant the word has fully landed.
const ROLL_END = ROLL_START + Math.max(0, ROLL_COUNT - 1) * ROLL_STAGGER + ROLL_DUR;

// Spatial index of the first changing letter (PRATIUSH→PROJECTS: the A at 2). The wave's crest is
// timed off this so each letter's LIFT peaks as it rolls.
const FIRST_CHANGE = ROLL_ORDER.findIndex((r) => r !== null);

/* ── Travelling ELASTIC wave (the "force") ───────────────────────────────────────────────────
 *
 * A SECOND motion layer, independent of the glyph roll: a force that travels left→right through
 * the word like a whip/elastic crack. As the crest APPROACHES a slot it loads TENSION — the whole
 * slot LIFTS (a rigid bob, no deformation) over a slow build, and the OUTGOING glyph — the old
 * letter rolling UP and out — stretches taller as it leaves. When the tension maxes out it RELEASES:
 * the slot snaps back in a fast beat, and because every slot's snap is staggered, that release reads
 * as energy thrown into the next letter — it's already mid-build as this one snaps.
 *
 * IMPORTANT: only the OUTGOING glyph stretches, and it stretches from its CENTRE (the span's default
 * transform-origin) so it elongates evenly through the middle and never looks deformed. The INCOMING
 * glyph (the PROJECTS letter rising from below) is never scaled — it arrives clean and undistorted.
 *
 * Tension τ ∈ [0,1] per slot is a piecewise curve over `d = progress − peak`:
 *   • BUILD  d ∈ [−WAVE_BUILD, 0]         : τ = n²  (ease-in) — slow load.
 *   • HOLD   d ∈ [0, WAVE_HOLD]           : τ = 1   — the stretch lingers at full before releasing.
 *   • SNAP   d ∈ [WAVE_HOLD, +WAVE_SNAP]  : τ = (1−n)²  (fast settle) — the shoot-back.
 * WAVE_BUILD is the REACH of the force: with peaks ROLL_STAGGER apart, ≈ WAVE_BUILD / ROLL_STAGGER
 * letters are loading at once (0.2 / 0.038 ≈ 5). WAVE_SNAP ≪ WAVE_BUILD makes the release a snap; the
 * WAVE_HOLD plateau keeps the stretch up a beat longer before it shoots. Static P & R feel it but are
 * pinned — only WAVE_STATIC_DAMP of the motion (a held tremor). The crest line
 * `peak = ROLL_START + (i − FIRST_CHANGE)·ROLL_STAGGER + ROLL_DUR/2` rides the roll and extrapolates
 * LEFT onto P/R (the force reaches them first). */
const WAVE_LIFT = 0.28; // em — peak upward lift (rigid bob of the whole slot) at full tension
const WAVE_STRETCH_Y = 0.34; // peak vertical stretch of the OUTGOING glyph only (scaleY = 1 + this)
const WAVE_BUILD = 0.2; // progress-width of the tension load (the force's reach)
const WAVE_HOLD = 0.03; // progress-width the stretch lingers at full before the snap
const WAVE_SNAP = 0.05; // progress-width of the fast release (≪ WAVE_BUILD → a snap)
const WAVE_STATIC_DAMP = 0.18; // P & R feel the force but are held to this fraction

// Tension load → hold → release curve for one slot, given its distance from the crest centre.
function waveTension(d: number): number {
  if (d <= -WAVE_BUILD || d >= WAVE_HOLD + WAVE_SNAP) return 0;
  if (d <= 0) {
    const n = (d + WAVE_BUILD) / WAVE_BUILD; // 0 → 1 across the build
    return n * n; // ease-in: load accelerates
  }
  if (d <= WAVE_HOLD) return 1; // hold at full stretch
  const n = (d - WAVE_HOLD) / WAVE_SNAP; // 0 → 1 across the snap
  const k = 1 - n;
  return k * k; // fast release, settling into rest
}

function MorphLetter({
  from,
  to,
  previousFrom,
  previousTo,
  fromOpticalFit,
  toOpticalFit,
  index,
  roll,
  progress,
}: {
  from: string;
  to: string;
  previousFrom: string;
  previousTo: string;
  fromOpticalFit: number;
  toOpticalFit: number;
  index: number;
  roll: number | null;
  progress: MotionValue<number>;
}) {
  // Static slots (P, R) DON'T roll their glyph. Changing slots take a left-to-right roll position:
  // roll = 0 leads (first changing letter), each later slot starts ROLL_STAGGER after the one
  // before it and rolls for ROLL_DUR — so the windows overlap heavily and the word morphs as a
  // smooth wave rather than a letter-at-a-time relay.
  const isStatic = roll === null;
  const start = ROLL_START + (roll ?? 0) * ROLL_STAGGER;
  const end = start + ROLL_DUR;

  // The travelling ELASTIC wave — tension loads as the crest nears this slot, then snaps back. One
  // τ scalar (damped on the held P/R) drives the lift, the vertical stretch, and the volume squeeze.
  const peak = ROLL_START + (index - FIRST_CHANGE) * ROLL_STAGGER + ROLL_DUR / 2;
  const damp = isStatic ? WAVE_STATIC_DAMP : 1;
  const tension = useTransform(progress, (p) => waveTension(p - peak) * damp);
  // The whole slot bobs up (rigid translate — no deformation).
  const liftY = useTransform(tension, (t) => `${(-t * WAVE_LIFT).toFixed(4)}em`);
  // ONLY the outgoing glyph stretches, from its centre, so it elongates cleanly as it leaves.
  const outgoingScaleY = useTransform(tension, (t) => 1 + t * WAVE_STRETCH_Y);

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

  // The glyph roll runs on the fast-start ease — the outgoing letter shoots up immediately, the
  // incoming eases in beneath it. Width/kerning stay on the smooth `reveal`.
  const y = useTransform(progress, [start, end], ["0%", "-50%"], {
    ease: outgoingEase,
  });
  // The incoming glyph enters tilted and rotates to 0° (aligned) over the same window.
  const incomingRotate = useTransform(progress, [start, end], [INCOMING_ROT, 0], {
    ease: reveal,
  });
  const width = useTransform(
    progress,
    [start, end],
    [metrics?.fromWidth ?? 0, metrics?.toWidth ?? 0],
    { ease: reveal },
  );
  const marginLeft = useTransform(
    progress,
    [start, end],
    [metrics?.fromKern ?? 0, metrics?.toKern ?? 0],
    { ease: reveal },
  );

  return (
    <motion.span
      className="hero-name-v4__letter"
      style={{
        width: metrics ? width : undefined,
        marginLeft: metrics ? marginLeft : undefined,
        y: liftY,
      }}
    >
      {isStatic ? (
        // Shared glyph (P / R): one static letter, no roll stack, no transform — dead still.
        <span className="hero-name-v4__roll hero-name-v4__roll--static">
          <span>{from}</span>
        </span>
      ) : (
        <motion.span className="hero-name-v4__roll" style={{ y }}>
          {/* OUTGOING glyph: stretches (centre origin) as it rolls up and out. */}
          <motion.span style={{ scaleY: outgoingScaleY }}>{from}</motion.span>
          {/* INCOMING glyph: never scaled — enters tilted, rotates to aligned as it lands. */}
          <motion.span style={{ rotate: incomingRotate }}>{to}</motion.span>
        </motion.span>
      )}
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

  // The ghosted "MY" graphic behind the LANDED word: an oversized, tonal INK echo of the title
  // (see .hero-name-ghost-v4). It is choreographed to RISE INTO PLACE through the back half of the
  // morph — entering while the letters are still rolling, not after — so the eye always has a second
  // event resolving as the word lands. It rises (y) into its centred rest (-50%, the CSS centring is
  // baked into this value) and inks up to a visible-but-tonal rest opacity. Both ease on INTRO.
  const ghostOpacity = useTransform(
    progress,
    [ROLL_END - 0.18, ROLL_END],
    [0, 0.16],
    { ease: reveal },
  );
  const ghostY = useTransform(
    progress,
    [ROLL_END - 0.18, ROLL_END + 0.02],
    ["-34%", "-50%"],
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
      <motion.span
        className="hero-name-ghost-v4"
        style={{ opacity: ghostOpacity, y: ghostY }}
      >
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
              roll={ROLL_ORDER[i]}
              progress={progress}
            />
          ))}
        </motion.span>
      </span>
    </p>
  );
}
