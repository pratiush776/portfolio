"use client";

import { memo, useLayoutEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";

import { FEATURED_IN, STAGE0, STAGE1 } from "@/components/hero/heroTimeline";
import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE } from "@/lib/intro";

/**
 * The hero name — and the landing's one big move, now a CHAIN. PRATIUSH is real text (Bricolage
 * Light/300 caps in the brand terracotta) so it can transform IN PLACE while the hero is pinned:
 * the word holds its left anchor (the P never moves) and rolls per-letter through the landing's
 * whole story — PRATIUSH → PERSONA (the "what I'm made of" beat) → PROJECTS (the title for the
 * work below) — without ever travelling across the stage. The two morphs are scheduled on the
 * shared beat sheet (heroTimeline STAGE0 / STAGE1); between them the word simply holds while the
 * persona content lives beside it.
 *
 * VARIABLE LENGTH — PRATIUSH and PROJECTS are 8 letters; PERSONA is 7. The 8th slot therefore
 * COLLAPSES: in MORPH 1 the H rolls out while its slot's width interpolates to zero, and in
 * MORPH 2 the slot re-opens as the S rises in. Nothing special-cased — an empty glyph measures
 * 0 wide and carries no kerning, so the same width/kern interpolation that keeps the letterfit
 * true also closes and opens the slot.
 *
 * TYPE FIDELITY — each slot stacks its three glyphs (one per word), and a naive stack sizes the
 * slot to the WIDEST of them, which wrecked the resting letterfit ("PRA TI USH"). Splitting a word
 * into flex children also disables the font's normal pair kerning. Every slot therefore measures
 * all three glyph widths AND each word's preceding-pair kerning correction, then interpolates both
 * during its rolls, so the word stays correctly fit AND left-anchored at every frame of the chain.
 *
 * What makes each morph read as a deliberate transformation rather than a flat crossfade:
 *  • ROLL — each CHANGING slot rolls its glyph (old up, new rises from below — the site's mask
 *    language) in a tight window centred on its own moment. The P (identical in all three words)
 *    never rolls: it holds dead still, so the left edge is anchored by real, un-moving type.
 *  • SEQUENCED — a LEFT-TO-RIGHT stagger walks the roll across the changing letters, so each
 *    morph reads as one continuous wave settling into the next word.
 *
 * The intro entrance (mask-rise on the foreground gate, BEAT.wordmark) lives on a wrapper node,
 * so it never fights the scrub on the letters.
 */
const WORDS = ["PRATIUSH", "PERSONA", "PROJECTS"] as const;
const SLOTS = Math.max(...WORDS.map((w) => w.length)); // 8
// Per-word glyph per slot; the shorter word pads its tail with "" — that slot collapses to zero
// width while the word reads PERSONA (see the width/kern interpolation below).
const GLYPHS: string[][] = WORDS.map((w) =>
  Array.from({ length: SLOTS }, (_, i) => w[i] ?? ""),
);

/*
 * Per-pair optical tracking nudges (in em, applied to the gap BEFORE each letter) to even out the
 * counter-space at wordmark scale. A gentle uniform NEGATIVE tracking (−0.01em per gap), tuned for
 * the old heavy caps; the name is Light (300) now, which generally wants MORE open tracking —
 * revisit toward 0 or positive if a word reads tight at 300. Index 0 has no preceding gap, and an
 * empty (collapsed) slot carries none.
 */
const OPTICAL_FIT: number[][] = GLYPHS.map((glyphs) =>
  glyphs.map((ch, i) => (i === 0 || !ch ? 0 : -0.01)),
);

/* ── The chain's two stages, from the shared beat sheet ─────────────────────────────────────── */
const STAGES = [STAGE0, STAGE1] as const;

/*
 * Roll order per stage, walked LEFT-TO-RIGHT across only the letters that actually change in that
 * stage. A slot whose glyph is identical across the stage gets `null` — it holds. (In this chain
 * only the P is fully static; every other slot rolls in both stages, including the collapsing H.)
 */
const ROLL_ORDERS: (number | null)[][] = STAGES.map((_, s) => {
  let seen = 0;
  return GLYPHS[s].map((ch, i) => (ch === GLYPHS[s + 1][i] ? null : seen++));
});
const CHANGE_COUNTS = ROLL_ORDERS.map(
  (order) => order.filter((r) => r !== null).length,
);
// Spatial index of each stage's first changing letter — the wave's crest is timed off this.
const FIRST_CHANGES = ROLL_ORDERS.map((order) =>
  order.findIndex((r) => r !== null),
);

/* ── Choreography pacing (derived per stage from its window on the beat sheet) ────────────────
 *
 * The wave is parameterised by TWO knobs, derived so the whole wave exactly fills each stage's
 * window regardless of how many letters change:
 *   • dur     — how long ONE letter takes to roll its glyph (its start→finish window).
 *   • stagger — the slight delay between consecutive letters' STARTS.
 * Keeping stagger well under dur is the whole trick: the next letter kicks off when the previous
 * has only just begun moving up (STAGGER_PER_DUR ≈ 24% through it), so several letters are mid-roll
 * at once and each morph reads as one smooth, wavy gesture instead of a letter-at-a-time relay. */
const STAGGER_PER_DUR = 0.24;
const PACES = STAGES.map((win, s) => {
  const width = win.end - win.start;
  const dur =
    width / (1 + STAGGER_PER_DUR * Math.max(0, CHANGE_COUNTS[s] - 1));
  return { start: win.start, dur, stagger: dur * STAGGER_PER_DUR };
});

/* ── Roll geometry: the gap between the stacked glyphs (the "make room ahead" trick) ──────────
 *
 * Each changing slot stacks three 1em glyphs (one per word) inside a 1em clip box, and the box
 * gains vertical HEADROOM (padding) so the elastic stretch + incoming tilt have room before the
 * hard clip edge — no sliced glyph tops. To stop that headroom from revealing a NEIGHBOUR glyph at
 * rest, the glyphs are separated by an equal vertical gap. ROLL_GAP is the single source of truth:
 * it is pushed to CSS as `--roll-gap` (the column's `gap` AND the slot's padding/margin derive from
 * it) and the roll travel below is computed from it, so the two can never desync. In em. */
const ROLL_GAP = 0.3;
// The column is (3 + 2·gap) em tall and showing word w means sliding it by w·(1 + gap) em — so each
// step lands the next glyph dead-centre in the clip box. As a percentage of the column's height:
const rollY = (w: number) =>
  `${(-(w * (1 + ROLL_GAP)) / (3 + 2 * ROLL_GAP)) * 100}%`;

// The shared anchor letter (P — the slot that never rolls) stands slightly TALLER than the
// changing glyphs: a subtle accent that weights the word's left edge. Vertical stretch only, grown
// from the baseline so the letter keeps its horizontal fit and the bottom line stays dead level.
const STATIC_STRETCH = 1.02;

// A smooth, premium ease-in-out cubic for width/kerning + the incoming rotation — gentler than the
// site's hard-landing INTRO_EASE so those glide rather than snap.
const MORPH_EASE = [0.65, 0, 0.35, 1] as const;
const reveal = cubicBezier(...MORPH_EASE);

// The outgoing letters exit on a FAST-START ease — quick off the mark, then a long settle — so the
// old glyph shoots up immediately while the new one eases in beneath it.
const OUTGOING_EASE = [0.16, 1, 0.3, 1] as const;
const outgoingEase = cubicBezier(...OUTGOING_EASE);

// Between the two morphs (and after the second) the keyframed values simply hold — the "ease" for
// those flat segments is identity.
const hold = (v: number) => v;

// The incoming glyph enters TILTED and rotates to 0° (properly aligned) as it lands. It pivots from
// the TOP of the box (transform-origin 50% 0%): caps sit high in the slot with the empty descender
// room below, so a top pivot swings the letter DOWN into that room instead of up past the roll
// mask's clip edge. Keep the angle modest for the same reason.
const INCOMING_ROT = -3; // degrees — a gentle tilt, not a showy swing (premium-subtle)

/* ── Travelling ELASTIC wave (the "force") ───────────────────────────────────────────────────
 *
 * A SECOND motion layer, independent of the glyph roll: a force that travels left→right through
 * the word like a whip/elastic crack — once per morph. As the crest APPROACHES a slot it loads
 * TENSION — the whole slot LIFTS (a rigid bob, no deformation) over a slow build, and the OUTGOING
 * glyph stretches taller as it leaves. When the tension maxes out it RELEASES: the slot settles
 * back in a fast beat, and because every slot's release is staggered, it reads as energy thrown
 * into the next letter.
 *
 * IMPORTANT: only the OUTGOING glyph stretches, and it stretches from its CENTRE so it elongates
 * evenly and never looks deformed. The INCOMING glyph is never scaled — it arrives clean.
 *
 * Tension τ ∈ [0,1] per slot is a piecewise curve over `d = progress − peak`:
 *   • BUILD  d ∈ [−build, 0]        : τ = n²  (ease-in) — slow load.
 *   • HOLD   d ∈ [0, hold]          : τ = 1   — the stretch lingers at full before releasing.
 *   • SNAP   d ∈ [hold, hold+snap]  : τ = (1−n)²  (fast settle) — the shoot-back.
 * The curve's widths are expressed as multiples of each stage's stagger, so the wave's reach stays
 * ~6 letters and its release stays a soft settle at ANY stage pacing. The static P feels the force
 * but is pinned — only WAVE_STATIC_DAMP of the motion (a held tremor). Each stage's crest line
 * `peak = start + (i − firstChange)·stagger + dur/2` rides its roll and extrapolates LEFT onto the
 * P (the force reaches it first). Premium-subtle values (lift/stretch 0.08) — an elegant settle,
 * not letters crashing. */
const WAVE_LIFT = 0.08; // em — peak upward lift (rigid bob of the whole slot) at full tension
const WAVE_STRETCH_Y = 0.08; // peak vertical stretch of the OUTGOING glyph only (scaleY = 1 + this)
const WAVE_BUILD_X = 5.9; // × stagger — the force's reach (≈6 letters loading at once)
const WAVE_HOLD_X = 0.75; // × stagger — the stretch lingers at full before the release
const WAVE_SNAP_X = 2.6; // × stagger — the release; ≫1 keeps it a settle, not a crack
const WAVE_STATIC_DAMP = 0.1; // the P feels the force but is held to this small fraction

// Tension load → hold → release curve for one slot, given its distance from a stage's crest.
function waveTension(d: number, stagger: number): number {
  const build = WAVE_BUILD_X * stagger;
  const holdW = WAVE_HOLD_X * stagger;
  const snap = WAVE_SNAP_X * stagger;
  if (d <= -build || d >= holdW + snap) return 0;
  if (d <= 0) {
    const n = (d + build) / build; // 0 → 1 across the build
    return n * n; // ease-in: load accelerates
  }
  if (d <= holdW) return 1; // hold at full stretch
  const n = (d - holdW) / snap; // 0 → 1 across the snap
  const k = 1 - n;
  return k * k; // fast release, settling into rest
}

// Memoized: every prop is a primitive derived from the constant word tables or the identity-stable
// `progress` MotionValue, so MorphLetter never needs to re-render once mounted — the scrubbed
// motion values update through the compositor, not React. memo keeps a stray parent render from
// cascading. (Glyphs/prevs/fits are passed as per-word primitives, not arrays, for that reason.)
const MorphLetter = memo(function MorphLetter({
  glyph0,
  glyph1,
  glyph2,
  prev0,
  prev1,
  prev2,
  fit0,
  fit1,
  fit2,
  index,
  roll0,
  roll1,
  progress,
}: {
  glyph0: string;
  glyph1: string;
  glyph2: string;
  prev0: string;
  prev1: string;
  prev2: string;
  fit0: number;
  fit1: number;
  fit2: number;
  index: number;
  roll0: number | null;
  roll1: number | null;
  progress: MotionValue<number>;
}) {
  // Per-word tables for the metrics-row JSX below (the effect builds its own from the primitives).
  const glyphs = [glyph0, glyph1, glyph2];
  const prevs = [prev0, prev1, prev2];

  // The fully static slot (the P — identical in all three words) never rolls; it just holds.
  const isStatic = roll0 === null && roll1 === null;

  // This slot's roll window within each stage: roll = 0 leads (the stage's first changing letter),
  // each later slot starts `stagger` after the one before it and rolls for `dur` — the windows
  // overlap heavily, so each morph is a smooth wave rather than a letter-at-a-time relay.
  const [a0, b0] = (() => {
    const s = PACES[0].start + (roll0 ?? 0) * PACES[0].stagger;
    return [s, s + PACES[0].dur];
  })();
  const [a1, b1] = (() => {
    const s = PACES[1].start + (roll1 ?? 0) * PACES[1].stagger;
    return [s, s + PACES[1].dur];
  })();

  // How far down the glyph column the slot sits after each stage (a stage where this slot doesn't
  // change simply holds its position — its two keyframes are equal).
  const pos1 = roll0 !== null ? 1 : 0;
  const pos2 = pos1 + (roll1 !== null ? 1 : 0);

  // The travelling ELASTIC wave — one crest per stage. A τ scalar (damped on the held P) drives
  // the lift, the outgoing stretch and the z-raise; the two crests are far apart in progress, so
  // max() composes them without interference.
  const peak0 =
    PACES[0].start +
    (index - FIRST_CHANGES[0]) * PACES[0].stagger +
    PACES[0].dur / 2;
  const peak1 =
    PACES[1].start +
    (index - FIRST_CHANGES[1]) * PACES[1].stagger +
    PACES[1].dur / 2;
  const damp = isStatic ? WAVE_STATIC_DAMP : 1;
  const tension0 = useTransform(
    progress,
    (p) => waveTension(p - peak0, PACES[0].stagger) * damp,
  );
  const tension1 = useTransform(
    progress,
    (p) => waveTension(p - peak1, PACES[1].stagger) * damp,
  );
  const tensionMax = useTransform(
    progress,
    (p) =>
      Math.max(
        waveTension(p - peak0, PACES[0].stagger),
        waveTension(p - peak1, PACES[1].stagger),
      ) * damp,
  );
  // The whole slot bobs up (rigid translate — no deformation).
  const liftY = useTransform(
    tensionMax,
    (t) => `${(-t * WAVE_LIFT).toFixed(4)}em`,
  );
  // ONLY the current outgoing glyph stretches, from its centre, so it elongates cleanly as it
  // leaves — glyph 0 during MORPH 1, glyph 1 during MORPH 2.
  const outgoingScaleY0 = useTransform(tension0, (t) => 1 + t * WAVE_STRETCH_Y);
  const outgoingScaleY1 = useTransform(tension1, (t) => 1 + t * WAVE_STRETCH_Y);
  // Raise the active letter above its neighbours so it's never occluded while it lifts/tilts.
  const zLift = useTransform(tensionMax, (t) => Math.round(t * 100));

  // Natural advance widths plus each word's real pair-kerning correction. A generic negative
  // margin cannot fit PR, RA, AT, TI, etc. because every pair needs a different adjustment.
  const currentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const previousRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pairRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [metrics, setMetrics] = useState<{
    widths: number[];
    kerns: number[];
  } | null>(null);

  useLayoutEffect(() => {
    // Local per-word tables from the primitive props (which are the effect's real dependencies).
    const glyphs = [glyph0, glyph1, glyph2];
    const prevs = [prev0, prev1, prev2];
    const fits = [fit0, fit1, fit2];

    const visualWidth = (node: HTMLSpanElement | null) =>
      node?.getBoundingClientRect().width ?? 0;

    const measure = () => {
      const samples = currentRefs.current;
      if (WORDS.some((_, w) => !samples[w])) return;

      // All samples live in the hidden, untransformed metrics row, preserving subpixel font
      // metrics. An empty (collapsed-slot) glyph measures 0 wide and carries no kern — which is
      // exactly what closes the slot for PERSONA and re-opens it for PROJECTS.
      const fontSize = Number.parseFloat(
        getComputedStyle(samples[0]!).fontSize,
      );
      const widths = WORDS.map((_, w) => visualWidth(samples[w]));
      const kerns = WORDS.map((_, w) =>
        glyphs[w] && prevs[w]
          ? visualWidth(pairRefs.current[w]) -
            visualWidth(previousRefs.current[w]) -
            widths[w] +
            fits[w] * fontSize
          : 0,
      );

      setMetrics((current) => {
        const next = { widths, kerns };
        if (
          current &&
          widths.every((v, w) => Math.abs(current.widths[w] - v) < 0.01) &&
          kerns.every((v, w) => Math.abs(current.kerns[w] - v) < 0.01)
        ) {
          return current;
        }
        return next;
      });
    };
    measure();

    // Re-measure the instant the web font swaps in. `document.fonts.ready` can resolve BEFORE a
    // cold-loaded `font-display: swap` face actually paints, so the slot widths/kerns stay pinned
    // to the fallback font's metrics while the visible glyphs are the real face — a mismatch that
    // splits the word (e.g. "PRA TIUSH"). A ResizeObserver on the hidden metric samples fires
    // exactly when their advance widths change (fallback → real glyph), guaranteeing the fit uses
    // real metrics. Attach it BEFORE awaiting fonts.ready so a swap that lands during the wait
    // can't slip through the gap between fonts.ready resolving and ro.observe().
    const ro = new ResizeObserver(measure);
    for (const node of currentRefs.current) if (node) ro.observe(node);

    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [glyph0, glyph1, glyph2, prev0, prev1, prev2, fit0, fit1, fit2]);

  // The glyph roll runs on the fast-start ease per stage — the outgoing letter shoots up
  // immediately, the incoming eases in beneath it — and HOLDS flat between the stages.
  // Width/kerning stay on the smooth `reveal`.
  const y = useTransform(
    progress,
    [a0, b0, a1, b1],
    [rollY(0), rollY(pos1), rollY(pos1), rollY(pos2)],
    { ease: [outgoingEase, hold, outgoingEase] },
  );
  // Each incoming glyph enters tilted and rotates to 0° (aligned) over its own stage's window.
  const incomingRotate1 = useTransform(progress, [a0, b0], [INCOMING_ROT, 0], {
    ease: reveal,
  });
  const incomingRotate2 = useTransform(progress, [a1, b1], [INCOMING_ROT, 0], {
    ease: reveal,
  });
  const width = useTransform(
    progress,
    [a0, b0, a1, b1],
    [
      metrics?.widths[0] ?? 0,
      metrics?.widths[1] ?? 0,
      metrics?.widths[1] ?? 0,
      metrics?.widths[2] ?? 0,
    ],
    { ease: [reveal, hold, reveal] },
  );
  const marginLeft = useTransform(
    progress,
    [a0, b0, a1, b1],
    [
      metrics?.kerns[0] ?? 0,
      metrics?.kerns[1] ?? 0,
      metrics?.kerns[1] ?? 0,
      metrics?.kerns[2] ?? 0,
    ],
    { ease: [reveal, hold, reveal] },
  );

  return (
    <motion.span
      className="hero-name-v4__letter"
      style={
        {
          width: metrics ? width : undefined,
          marginLeft: metrics ? marginLeft : undefined,
          y: liftY,
          zIndex: zLift,
        } as MotionStyle
      }
    >
      {isStatic ? (
        // Shared glyph (the P): one static letter, no roll stack — held dead still, but stood 2%
        // taller (from the baseline) so the anchor letter carries a touch more presence.
        <span className="hero-name-v4__roll hero-name-v4__roll--static">
          <span
            style={{
              transform: `scaleY(${STATIC_STRETCH})`,
              transformOrigin: "50% 100%",
            }}
          >
            {glyph0}
          </span>
        </span>
      ) : (
        <motion.span className="hero-name-v4__roll" style={{ y }}>
          {/* Word-0 glyph (PRATIUSH): the OUTGOING glyph of MORPH 1 — stretches (centre origin)
              as it rolls up and out. The slot's vertical headroom (the gap padding in CSS) gives
              that stretch room on both sides so it never clips. */}
          <motion.span style={{ scaleY: outgoingScaleY0 }}>
            {glyph0}
          </motion.span>
          {/* Word-1 glyph (PERSONA): arrives tilted in MORPH 1, then becomes the OUTGOING glyph of
              MORPH 2. The two moves need different origins (the tilt pivots the top, the stretch
              the centre), so they live on nested spans. Empty for the collapsed 8th slot. */}
          <motion.span
            style={{ rotate: incomingRotate1, transformOrigin: "50% 0%" }}
          >
            <motion.span style={{ scaleY: outgoingScaleY1 }}>
              {glyph1}
            </motion.span>
          </motion.span>
          {/* Word-2 glyph (PROJECTS): arrives tilted in MORPH 2 and lands the word. */}
          <motion.span
            style={{ rotate: incomingRotate2, transformOrigin: "50% 0%" }}
          >
            {glyph2}
          </motion.span>
        </motion.span>
      )}
      {/* Offscreen samples: per word, the glyph, its predecessor, and the kerned pair. */}
      <span className="hero-name-v4__metrics" aria-hidden>
        {WORDS.map((_, w) => (
          <span key={w}>
            <span
              ref={(el) => {
                currentRefs.current[w] = el;
              }}
            >
              {glyphs[w]}
            </span>
            <span
              ref={(el) => {
                previousRefs.current[w] = el;
              }}
            >
              {prevs[w]}
            </span>
            <span
              ref={(el) => {
                pairRefs.current[w] = el;
              }}
            >
              {prevs[w]}
              {glyphs[w]}
            </span>
          </span>
        ))}
      </span>
    </motion.span>
  );
});

export function MorphName({
  progress,
  exitY,
}: {
  progress: MotionValue<number>;
  // Velocity-matched release ramp for the landed title as the pin lets go (HeroSection
  // RELEASE_LIFT): 0 through the whole pinned chain, easing the title up to scroll speed at the
  // unpin so it never jolts from held to scrolling.
  exitY: MotionValue<string>;
}) {
  const { foregroundIn, reduce } = useIntro();

  // The "Featured" script eyebrow — the section title's quiet lead-in, in the SAME hand
  // (Style Script) as the hero's "Hi, I'm" greeting — inks in (rise + fade) only AFTER the word
  // has landed as PROJECTS (heroTimeline FEATURED_IN), so nothing floats over the rolling letters.
  // It never fades back out: it simply rides up and away with the title when the pin releases.
  const featuredOpacity = useTransform(progress, [...FEATURED_IN], [0, 1], {
    ease: cubicBezier(...INTRO_EASE),
  });
  const featuredRise = useTransform(
    progress,
    [...FEATURED_IN],
    ["0.5em", "0em"],
    { ease: cubicBezier(...INTRO_EASE) },
  );

  // Reduced motion: the name, plainly — no roll (the intro gate settles it).
  if (reduce) {
    return (
      <p className="hero-name-v4" aria-hidden>
        <span className="hero-name-v4__run">{WORDS[0]}</span>
      </p>
    );
  }

  return (
    <motion.p
      className="hero-name-v4"
      aria-hidden
      // --roll-gap is the single source of truth for the roll's vertical gap (see ROLL_GAP): the
      // slot headroom and column gap derive from it in CSS, the roll travel from it in JS. `y` is
      // the title's velocity-matched release ramp (exitY; see HeroSection RELEASE_LIFT). The EXIT
      // dissolve into the nav band is owned at the cluster level (HeroLede), so the whole lockup —
      // eyebrow + word — melts uniformly rather than the eyebrow hard-cutting against a per-name
      // mask.
      style={{ "--roll-gap": `${ROLL_GAP}em`, y: exitY } as MotionStyle}
    >
      {/* The "Featured" script eyebrow — anchored ABOVE the word and inside this drifting root so
          it rides with the landed title. */}
      <motion.span
        className="hero-name-v4__eyebrow hero-eyebrow-v4"
        style={{ opacity: featuredOpacity, y: featuredRise }}
        aria-hidden
      >
        Featured
      </motion.span>
      {/* Entrance mask: the name rises from behind its baseline on the foreground gate —
          a separate node from the scrubbed letters, so the two never fight. */}
      <span className="hero-name-v4__reveal">
        <motion.span
          className="hero-name-v4__run"
          initial={{ y: "104%", opacity: 0 }}
          animate={
            foregroundIn ? { y: "0%", opacity: 1 } : { y: "104%", opacity: 0 }
          }
          transition={{
            duration: BEAT.wordmark.duration,
            ease: INTRO_EASE,
            delay: BEAT.wordmark.delay,
          }}
        >
          {GLYPHS[0].map((_, i) => (
            <MorphLetter
              key={i}
              glyph0={GLYPHS[0][i]}
              glyph1={GLYPHS[1][i]}
              glyph2={GLYPHS[2][i]}
              prev0={GLYPHS[0][i - 1] ?? ""}
              prev1={GLYPHS[1][i - 1] ?? ""}
              prev2={GLYPHS[2][i - 1] ?? ""}
              fit0={OPTICAL_FIT[0][i]}
              fit1={OPTICAL_FIT[1][i]}
              fit2={OPTICAL_FIT[2][i]}
              index={i}
              roll0={ROLL_ORDERS[0][i]}
              roll1={ROLL_ORDERS[1][i]}
              progress={progress}
            />
          ))}
        </motion.span>
      </span>
    </motion.p>
  );
}
