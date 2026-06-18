"use client";

import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useTransform,
  type MotionStyle,
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

/* ── Roll geometry: the gap between the two stacked glyphs (the "make room ahead" trick) ──────
 *
 * Each changing slot stacks two 1em glyphs (outgoing above, incoming below) inside a 1em clip
 * box, and the box gains vertical HEADROOM (padding) so the elastic stretch + incoming tilt have
 * room before the hard clip edge — no more sliced glyph tops. To stop that headroom from
 * revealing the OTHER stacked glyph at rest, the two glyphs are separated by an equal vertical
 * gap. ROLL_GAP is the single source of truth: it is pushed to CSS as `--roll-gap` (the column's
 * `gap` AND the slot's padding/margin derive from it) and the roll travel below is computed from
 * it, so the two can never desync. In em (of the name's font size). Half of it becomes the
 * headroom on EACH side of the clip box, so the centre-origin stretch (which pokes up AND down)
 * clears the edge symmetrically. */
const ROLL_GAP = 0.3;
// The column is (2 + gap) em tall and the swap slides it by (1 + gap) em, so the roll travels
// this fraction of the column — derived so the incoming glyph lands dead-centre in the clip box.
const ROLL_TRAVEL = ((1 + ROLL_GAP) / (2 + ROLL_GAP)) * 100; // %

// A smooth, premium ease-in-out cubic for width/kerning + the incoming rotation — gentler than the
// site's hard-landing INTRO_EASE so those glide rather than snap.
const MORPH_EASE = [0.65, 0, 0.35, 1] as const;
const reveal = cubicBezier(...MORPH_EASE);

// The outgoing letters exit on a FAST-START ease — quick off the mark, then a long settle — so the
// old glyph shoots up immediately while the new one eases in beneath it.
const OUTGOING_EASE = [0.16, 1, 0.3, 1] as const;
const outgoingEase = cubicBezier(...OUTGOING_EASE);

// The incoming glyph enters TILTED and rotates to 0° (properly aligned) as it lands. It pivots from
// the TOP of the box (transform-origin 50% 0% on the span): caps sit high in the slot with the empty
// descender room below, so a top pivot swings the letter DOWN into that room instead of up past the
// roll mask's clip edge — which is what was slicing the tops off. Keep the angle modest for the same
// reason (the slot must stay overflow-clipped to mask the two stacked glyphs).
const INCOMING_ROT = -8; // degrees

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
 * transform-origin) so it elongates evenly through the middle and never looks deformed — it loads
 * tension in place, then shoots up. The slot now carries vertical headroom (the gap padding) so that
 * stretch clears the clip edge. The INCOMING glyph (the PROJECTS letter rising from below) is never
 * scaled — it arrives clean and undistorted.
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

/* ── Per-letter halo colour: sample the hero's warm field at each letter's position ───────────
 *
 * The separating halo (see .hero-name-v4__roll span) must read as "the background showing
 * through" so overlapping glyphs and the dark "MY" ghost get a clean gap. A single flat cream
 * looked white-ish against the golden glow pooled at the lower-left. Instead each letter samples
 * the colour of the field BEHIND it — the base radial field (.hero-field-v3) PLUS the gold radial
 * glow (.radial-glow-v3) composited over it — so left letters get warm gold and the tone eases to
 * cream toward the right, matching the real background at every letter. (The slow breathe/aurora
 * are diffuse and animated; we approximate with their resting state — close enough to read as bg.)
 */
type RGB = [number, number, number];

// "source over" composite of `src` (alpha `a`) onto opaque `dst`.
function over(dst: RGB, src: RGB, a: number): RGB {
  return [
    src[0] * a + dst[0] * (1 - a),
    src[1] * a + dst[1] * (1 - a),
    src[2] * a + dst[2] * (1 - a),
  ];
}

// Alpha of one radial-gradient stack layer at a normalised point, given centre/radii (in the same
// fraction units as the point) and the stop fraction at which it reaches transparent.
function radialAlpha(
  nx: number,
  ny: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  stop: number,
): number {
  const dx = (nx - cx) / rx;
  const dy = (ny - cy) / ry;
  const r = Math.sqrt(dx * dx + dy * dy);
  return Math.max(0, Math.min(1, 1 - r / stop));
}

// The base field surface (.hero-field-v3): three warm radials over the cream base. Layers are
// listed BOTTOM-to-TOP (reverse of the CSS background order) for compositing.
const FIELD_BASE: RGB = [244, 227, 206]; // #F4E3CE
const FIELD_LAYERS: { c: RGB; cx: number; cy: number; rx: number; ry: number; stop: number }[] = [
  { c: [240, 214, 192], cx: 0.9, cy: 1.0, rx: 0.95, ry: 0.85, stop: 0.58 }, // terracotta, lower-right
  { c: [247, 231, 205], cx: 0.78, cy: 0.44, rx: 0.72, ry: 0.66, stop: 0.62 }, // ambient, centre-right
  { c: [250, 235, 204], cx: 0.16, cy: 0.02, rx: 1.15, ry: 1.0, stop: 0.54 }, // key light, upper-left
];

function sampleField(nx: number, ny: number): RGB {
  let col = FIELD_BASE;
  for (const L of FIELD_LAYERS) {
    col = over(col, L.c, radialAlpha(nx, ny, L.cx, L.cy, L.rx, L.ry, L.stop));
  }
  return col;
}

// The gold glow (.radial-glow-v3): an 84rem circle parked at left:-16rem top:-14rem, so its centre
// sits at (26rem, 28rem) with a 42rem radius. Sampled in viewport px (needs the root rem). The
// breathe animation is approximated at a resting opacity.
const GLOW_C_REM = 26;
const GLOW_CY_REM = 28;
const GLOW_R_REM = 42;
const GLOW_OPACITY = 0.9; // breathe rides 0.82→1; rest ~0.9
const GLOW_STOPS: { o: number; c: RGB; a: number }[] = [
  { o: 0.0, c: [252, 230, 178], a: 0.97 },
  { o: 0.32, c: [250, 224, 170], a: 0.88 },
  { o: 0.6, c: [248, 226, 182], a: 0.5 },
  { o: 0.8, c: [248, 232, 190], a: 0.0 },
];

function sampleGlow(px: number, py: number, rem: number): { c: RGB; a: number } {
  const cx = GLOW_C_REM * rem;
  const cy = GLOW_CY_REM * rem;
  const r = GLOW_R_REM * rem;
  const f = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) / r;
  const last = GLOW_STOPS[GLOW_STOPS.length - 1];
  if (f <= GLOW_STOPS[0].o) return { c: GLOW_STOPS[0].c, a: GLOW_STOPS[0].a * GLOW_OPACITY };
  if (f >= last.o) return { c: last.c, a: 0 };
  for (let i = 0; i < GLOW_STOPS.length - 1; i++) {
    const s = GLOW_STOPS[i];
    const n = GLOW_STOPS[i + 1];
    if (f >= s.o && f <= n.o) {
      const t = (f - s.o) / (n.o - s.o);
      const lerp = (a: number, b: number) => a + (b - a) * t;
      return {
        c: [lerp(s.c[0], n.c[0]), lerp(s.c[1], n.c[1]), lerp(s.c[2], n.c[2])],
        a: lerp(s.a, n.a) * GLOW_OPACITY,
      };
    }
  }
  return { c: last.c, a: 0 };
}

// The composited background colour at a viewport point — field + gold glow over it.
function sampleHalo(px: number, py: number, viewW: number, viewH: number, rem: number): string {
  const field = sampleField(px / viewW, py / viewH);
  const glow = sampleGlow(px, py, rem);
  const [r, g, b] = over(field, glow.c, glow.a);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
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
  // Raise the active letter above its neighbours so it's never occluded while it lifts/tilts —
  // the more tension a slot carries, the higher it stacks; settled letters fall back to 0.
  const zLift = useTransform(tension, (t) => Math.round(t * 100));

  // Natural advance widths plus each word's real pair-kerning correction. A generic negative
  // margin cannot fit PR, RA, AT, TI, etc. because every pair needs a different adjustment.
  const fromPreviousRef = useRef<HTMLSpanElement>(null);
  const toPreviousRef = useRef<HTMLSpanElement>(null);
  const fromCurrentRef = useRef<HTMLSpanElement>(null);
  const toCurrentRef = useRef<HTMLSpanElement>(null);
  const fromPairRef = useRef<HTMLSpanElement>(null);
  const toPairRef = useRef<HTMLSpanElement>(null);
  const letterRef = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState<{
    fromWidth: number;
    toWidth: number;
    fromKern: number;
    toKern: number;
  } | null>(null);
  // The background colour sampled at this letter's resting position (field + gold glow), used as
  // the separating halo so it reads as the real background rather than a flat cream.
  const [halo, setHalo] = useState<string | null>(null);

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

      // Sample the field colour behind this slot at its RESTING position. offsetLeft/offsetTop are
      // layout coords (independent of the run's entrance/scrub transforms), measured against the
      // untransformed .hero-name-v4 container — so the sample point is stable through the morph.
      const slot = letterRef.current;
      const nameEl = slot?.closest(".hero-name-v4") as HTMLElement | null;
      if (slot && nameEl) {
        const nameRect = nameEl.getBoundingClientRect();
        const px = nameRect.left + slot.offsetLeft + slot.offsetWidth / 2;
        const py = nameRect.top + slot.offsetTop + slot.offsetHeight / 2;
        const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const next = sampleHalo(px, py, window.innerWidth, window.innerHeight, rem);
        setHalo((current) => (current === next ? current : next));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [from, fromOpticalFit, previousFrom, previousTo, to, toOpticalFit]);

  // The glyph roll runs on the fast-start ease — the outgoing letter shoots up immediately, the
  // incoming eases in beneath it. Width/kerning stay on the smooth `reveal`.
  const y = useTransform(progress, [start, end], ["0%", `-${ROLL_TRAVEL}%`], {
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
      ref={letterRef}
      className="hero-name-v4__letter"
      style={
        {
          width: metrics ? width : undefined,
          marginLeft: metrics ? marginLeft : undefined,
          y: liftY,
          zIndex: zLift,
          "--halo": halo ?? undefined,
        } as MotionStyle
      }
    >
      {isStatic ? (
        // Shared glyph (P / R): one static letter, no roll stack, no transform — dead still.
        <span className="hero-name-v4__roll hero-name-v4__roll--static">
          <span>{from}</span>
        </span>
      ) : (
        <motion.span className="hero-name-v4__roll" style={{ y }}>
          {/* OUTGOING glyph: stretches (centre origin) as it rolls up and out — it loads tension
              and elongates in place, then shoots up. The slot's vertical headroom (see the gap
              padding in CSS) gives that stretch room on BOTH sides so it no longer clips. */}
          <motion.span style={{ scaleY: outgoingScaleY }}>{from}</motion.span>
          {/* INCOMING glyph: never scaled — enters tilted, rotates to aligned as it lands. Pivots
              from the top so the tilt swings into the descender room, clear of the mask's clip. */}
          <motion.span style={{ rotate: incomingRotate, transformOrigin: "50% 0%" }}>
            {to}
          </motion.span>
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
    <p
      className="hero-name-v4"
      aria-hidden
      // Single source of truth for the roll's vertical gap (see ROLL_GAP): the slot headroom and
      // the column gap derive from it in CSS, and the roll travel above derives from it in JS.
      style={{ "--roll-gap": `${ROLL_GAP}em` } as CSSProperties}
    >
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
