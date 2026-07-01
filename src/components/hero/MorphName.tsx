"use client";

import { memo, useLayoutEffect, useRef, useState } from "react";
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
 * The hero name — and the landing's one big move. PRATIUSH is real text (Bricolage Light/300 caps in
 * the brand terracotta) so it can transform IN PLACE while the hero is pinned: the name holds its
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
 * Per-pair optical tracking nudges (in em, applied to the gap BEFORE each letter) to even out the
 * counter-space at wordmark scale; index 0 has no preceding pair. Per-pair signs: + opens the gap,
 * − tightens. Start near 0 for Bricolage Grotesque; re-tune by eye here if a pair reads loose or
 * tight at hero scale.
 */
// A gentle uniform NEGATIVE tracking (−0.01em per gap). This was tuned for the old heavy (800) caps;
// now the name is Light (300), which generally wants MORE open tracking (light + spacious is the
// mockup's premium register) — revisit toward 0 or positive here if the word reads tight at 300.
// Index 0 has no preceding gap.
//                                P      R      A      T      I      U      S      H
const FROM_OPTICAL_FIT = [0, -0.01, -0.01, -0.01, -0.01, -0.01, -0.01, -0.01];
const TO_OPTICAL_FIT = [0, -0.01, -0.01, -0.01, -0.01, -0.01, -0.01, -0.01];

/* ── Choreography knobs (fractions of the hero's pinned track) ──────────────────────────────
 *
 * The wave is parameterised by TWO independent knobs, so the overlap is set directly rather than
 * falling out of a band width:
 *   • ROLL_DUR     — how long ONE letter takes to roll its glyph (its start→finish window).
 *   • ROLL_STAGGER — the slight delay between consecutive letters' STARTS.
 * Keeping ROLL_STAGGER well under ROLL_DUR is the whole trick: the next letter kicks off when the
 * previous has only just begun moving up (≈ROLL_STAGGER/ROLL_DUR through it, ~24% here), so several
 * letters are mid-roll at once and the morph reads as one smooth, wavy gesture instead of a relay
 * that waits for each glyph to nearly finish before the next starts. */
// Choreography: the morph begins EARLY, overlapping the copy's scroll-out — the elastic force loads on
// the word from the top of the scroll and the first real letter (A→O) starts rolling at ROLL_START. The
// name lands as PROJECTS (~0.33), then drifts UP (see TITLE_DRIFT) as the thesis beat crests in beside
// it (HeroThesisBeat — now its OWN scrolling section, no longer synced to this morph) and the first
// work panel later crests up from below. Tune with ROLL_START (when the wave starts / how much it
// overlaps the copy-out) and ROLL_DUR/STAGGER (how fast it resolves — both cut ~20%).
const ROLL_START = 0.08; // first CHANGING slot (A→O) begins its roll, overlapping the copy-out; lands ~0.33
const ROLL_DUR = 0.116; // duration of a single letter's glyph roll (~20% quicker than before)
const ROLL_STAGGER = 0.027; // delay between consecutive letters' starts (≪ ROLL_DUR → wavy overlap)

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

// The shared anchor letters (P & R — the slots that never roll) stand slightly TALLER than the
// changing glyphs: a subtle accent that weights the word's left edge. Vertical stretch only, grown
// from the baseline so the letters keep their horizontal fit and the bottom line stays dead level.
const STATIC_STRETCH = 1.02;

// PARALLAX PAIR: once the word lands as PROJECTS, it and the thesis both scroll UP and off as the hero
// exits. The title is the STEADIER element — it rides up at scroll speed (1:1) and dissolves into the
// nav band — while the thesis LEADS (rides up faster), so the thesis clears first and the two separate
// cleanly before NILINK. The title can't ride up SLOWER (a lag) because the hero is an overflow:hidden
// sticky box whose rising bottom edge would clip it. `exitY` is a small VELOCITY-MATCHED release ramp
// (HeroSection RELEASE_LIFT) that eases the title out of the pin so it doesn't jolt from held to
// scrolling — applied to the whole title so it moves as one.

// The script "Featured" eyebrow that reveals above PROJECTS — the section title's quiet lead-in, in
// the SAME hand (Style Script) as the hero's "Hi, I'm" greeting. It enters RIGHT AFTER the role +
// tagline copy has cleared (the hero-cluster bodyExit completes at progress 0.18, see HeroLede EXIT.body):
// the eyebrow fills the space the departing copy leaves rather than waiting for the morph to fully
// land. It starts inking over the TAIL of that fade — the bodyExit ease is mostly spent by ~0.13, so
// the copy is visually near-gone there — and finishes well before the word lands as PROJECTS
// (ROLL lands ~0.33), so it leads cleanly into the landed title. Reveal window, in progress:
const FEATURED_IN_START = 0.14;
const FEATURED_IN_END = 0.26;

// THE EXIT. The title holds and owns the frame while it drifts up, then cedes the stage as the NILINK
// laptop bridges in. The image fades in over the card's progress ~0.12→0.24, which maps to p_hero
// ≈ 0.78→1.0 (hero pins over 80vh; the first card sits at doc-Y 30vh over a 300vh scrub). PROJECTS
// begins fading at ~0.73 (as the laptop starts appearing) and is clear by ~0.90, BEFORE the laptop is
// fully legible, so nothing old lingers under it — then NILINK's own title/copy enter (ProjectFeature).
// The "Featured" eyebrow and the PROJECTS word fade on the SAME window, so the two-part lockup leaves
// as one unit (no leading/lagging between them).
const FEATURED_OUT_START = 0.73;
const FEATURED_OUT_END = 0.9;
const PROJECTS_FADE_START = 0.73;
const PROJECTS_FADE_END = 0.9; // gone a touch sooner so it doesn't linger under the arriving laptop
const PROJECTS_FADE_BLUR = 3; // px of blur at full fade

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
const INCOMING_ROT = -3; // degrees — a gentle tilt, not a showy swing (premium-subtle)

/*
 * Roll order, walked LEFT-TO-RIGHT across only the letters that actually change. A slot whose
 * glyph is identical in both words (P at 0, R at 1) gets `null` — it never rolls, it just holds.
 * The changing slots get a 0-based wave position, so the first changing letter (A→O) leads and
 * the last (H→S) lands the word.
 */
let rollSeen = 0;
const ROLL_ORDER: (number | null)[] = FROM.map((ch, i) =>
  ch === TO[i] ? null : rollSeen++,
);

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
 * letters are loading at once (0.16 / 0.034 ≈ 5). WAVE_SNAP ≪ WAVE_BUILD makes the release a snap; the
 * WAVE_HOLD plateau keeps the stretch up a beat longer before it shoots. Static P & R feel it but are
 * pinned — only WAVE_STATIC_DAMP of the motion (a held tremor). The crest line
 * `peak = ROLL_START + (i − FIRST_CHANGE)·ROLL_STAGGER + ROLL_DUR/2` rides the roll and extrapolates
 * LEFT onto P/R (the force reaches them first). */
// Premium-subtle wave: the elastic force is dialled WAY back from its original showy values (lift
// 0.22→0.08, stretch 0.24→0.08) so the morph reads as an elegant settle, not letters crashing/
// stretching. The release is softened (longer SNAP) so it eases home rather than cracking.
const WAVE_LIFT = 0.08; // em — peak upward lift (rigid bob of the whole slot) at full tension
const WAVE_STRETCH_Y = 0.08; // peak vertical stretch of the OUTGOING glyph only (scaleY = 1 + this)
const WAVE_BUILD = 0.16; // progress-width of the tension load (the force's reach)
const WAVE_HOLD = 0.02; // progress-width the stretch lingers at full before the snap
const WAVE_SNAP = 0.07; // progress-width of the release — softened so it settles, doesn't crack
const WAVE_STATIC_DAMP = 0.1; // P & R feel the force but are held to this small fraction

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

// Memoized: every prop is a primitive derived from the constant FROM/TO arrays or the identity-stable
// `progress` MotionValue, so MorphLetter never needs to re-render once mounted — the scrubbed motion
// values update through the compositor, not React. memo keeps a stray parent render from cascading.
const MorphLetter = memo(function MorphLetter({
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
  const peak =
    ROLL_START + (index - FIRST_CHANGE) * ROLL_STAGGER + ROLL_DUR / 2;
  const damp = isStatic ? WAVE_STATIC_DAMP : 1;
  const tension = useTransform(progress, (p) => waveTension(p - peak) * damp);
  // The whole slot bobs up (rigid translate — no deformation).
  const liftY = useTransform(
    tension,
    (t) => `${(-t * WAVE_LIFT).toFixed(4)}em`,
  );
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

    // Re-measure the instant the web font swaps in. `document.fonts.ready` can resolve BEFORE a
    // cold-loaded `font-display: swap` face actually paints, so the slot widths/kerns stay pinned to
    // the fallback font's metrics while the visible glyphs are the real face — a mismatch that splits
    // the word (e.g. "PRA TIUSH"). A ResizeObserver on the hidden metric samples fires exactly when
    // their advance widths change (fallback → real glyph), guaranteeing the fit uses real metrics.
    // Attach it BEFORE awaiting fonts.ready so a swap that lands during the wait can't slip through the
    // gap between fonts.ready resolving and ro.observe().
    const ro = new ResizeObserver(measure);
    if (fromCurrentRef.current) ro.observe(fromCurrentRef.current);
    if (toCurrentRef.current) ro.observe(toCurrentRef.current);

    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [from, fromOpticalFit, previousFrom, previousTo, to, toOpticalFit]);

  // The glyph roll runs on the fast-start ease — the outgoing letter shoots up immediately, the
  // incoming eases in beneath it. Width/kerning stay on the smooth `reveal`.
  const y = useTransform(progress, [start, end], ["0%", `-${ROLL_TRAVEL}%`], {
    ease: outgoingEase,
  });
  // The incoming glyph enters tilted and rotates to 0° (aligned) over the same window.
  const incomingRotate = useTransform(
    progress,
    [start, end],
    [INCOMING_ROT, 0],
    {
      ease: reveal,
    },
  );
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
        // Shared glyph (P / R): one static letter, no roll stack — held dead still, but stood 5%
        // taller (from the baseline) so the anchor letters carry a touch more presence.
        <span className="hero-name-v4__roll hero-name-v4__roll--static">
          <span
            style={{
              transform: `scaleY(${STATIC_STRETCH})`,
              transformOrigin: "50% 100%",
            }}
          >
            {from}
          </span>
        </span>
      ) : (
        <motion.span className="hero-name-v4__roll" style={{ y }}>
          {/* OUTGOING glyph: stretches (centre origin) as it rolls up and out — it loads tension
              and elongates in place, then shoots up. The slot's vertical headroom (see the gap
              padding in CSS) gives that stretch room on BOTH sides so it no longer clips. */}
          <motion.span style={{ scaleY: outgoingScaleY }}>{from}</motion.span>
          {/* INCOMING glyph: never scaled — enters tilted, rotates to aligned as it lands. Pivots
              from the top so the tilt swings into the descender room, clear of the mask's clip. */}
          <motion.span
            style={{ rotate: incomingRotate, transformOrigin: "50% 0%" }}
          >
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
});

// The hero pin is now SHORT — it releases right after PROJECTS lands (see .hero-track-v4 height). We
// feed the morph a slowed-down progress (mp = progress × MORPH_SCALE) so the IDENTICAL morph fills the
// shorter pin and lands at heroProgress ≈ ROLL land ÷ MORPH_SCALE (near the pin's end). Side effect, by
// design: mp never exceeds MORPH_SCALE, so the post-landing TITLE_DRIFT barely moves and the
// PROJECTS_FADE / FEATURED_OUT windows (≥0.73 of mp) never fire — PROJECTS stays lit and simply scrolls
// AWAY when the pin releases (no scripted fade). Tune MORPH_SCALE together with the track height.
const MORPH_SCALE = 0.39;

export function MorphName({
  progress,
  exitY,
}: {
  progress: MotionValue<number>;
  // Parallax lag for the landed title as the hero scrolls OUT (driven off the hero's EXIT scroll in
  // HeroSection, so it's 0 during the pin and only lags once the pin releases). The title rides up
  // with the page minus this offset, so it scrolls SLOWER than the thesis — the parallax pair.
  exitY: MotionValue<string>;
}) {
  const { foregroundIn, reduce } = useIntro();
  const mp = useTransform(progress, (v) => v * MORPH_SCALE);

  // The "Featured" script eyebrow inks in (rise + fade) as the morph resolves into PROJECTS. Hooks run
  // unconditionally; the reduced-motion branch (PRATIUSH, no PROJECTS title) simply never renders it.
  const featuredOpacity = useTransform(
    mp,
    [FEATURED_IN_START, FEATURED_IN_END, FEATURED_OUT_START, FEATURED_OUT_END],
    [0, 1, 1, 0],
    { ease: cubicBezier(...INTRO_EASE) },
  );
  const featuredRise = useTransform(mp, [FEATURED_IN_START, FEATURED_IN_END], ["0.5em", "0em"], {
    ease: cubicBezier(...INTRO_EASE),
  });

  // The landed PROJECTS word fades + softly blurs out as it drifts up, ceding the stage to the first
  // project's title (no collision). Applied to the reveal wrapper so it never fights the entrance
  // mask on the inner run.
  const projectsOpacity = useTransform(mp, [PROJECTS_FADE_START, PROJECTS_FADE_END], [1, 0], {
    ease: cubicBezier(...INTRO_EASE),
  });
  const projectsBlur = useTransform(
    mp,
    [PROJECTS_FADE_START, PROJECTS_FADE_END],
    [0, PROJECTS_FADE_BLUR],
  );
  const projectsFilter = useTransform(projectsBlur, (b) => `blur(${b}px)`);

  // Reduced motion: the name, plainly — no roll (the intro gate settles it).
  if (reduce) {
    return (
      <p className="hero-name-v4" aria-hidden>
        <span className="hero-name-v4__run">PRATIUSH</span>
      </p>
    );
  }

  return (
    <motion.p
      className="hero-name-v4"
      aria-hidden
      // --roll-gap is the single source of truth for the roll's vertical gap (see ROLL_GAP): the slot
      // headroom and column gap derive from it in CSS, the roll travel from it in JS. `y` is the title's
      // velocity-matched release ramp (exitY; see HeroSection RELEASE_LIFT) that eases it out of the pin.
      // The EXIT dissolve into the nav band is owned at the cluster level (HeroLede), so the whole lockup
      // — eyebrow + word — melts uniformly rather than the eyebrow hard-cutting against a per-name mask.
      style={{ "--roll-gap": `${ROLL_GAP}em`, y: exitY } as MotionStyle}
    >
      {/* The "Featured" script eyebrow — same hand as the hero greeting, anchored ABOVE the word and
          inside this drifting root so it parallaxes with PROJECTS. Inks in as the morph resolves. */}
      <motion.span
        className="hero-name-v4__eyebrow hero-eyebrow-v4"
        style={{ opacity: featuredOpacity, y: featuredRise }}
        aria-hidden
      >
        Featured
      </motion.span>
      {/* Entrance mask: the name rises from behind its baseline on the foreground gate —
          a separate node from the scrubbed letters, so the two never fight. The reveal wrapper also
          carries the handoff EXIT (fade + blur) so the landed PROJECTS clears before NILINK reads. */}
      <motion.span
        className="hero-name-v4__reveal"
        style={{ opacity: projectsOpacity, filter: projectsFilter }}
      >
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
              progress={mp}
            />
          ))}
        </motion.span>
      </motion.span>
    </motion.p>
  );
}
