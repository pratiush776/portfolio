"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";

import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, easedScrollStart, INTRO_EASE } from "@/lib/intro";

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
// thesis writes itself on in sync (HeroThesis INK_START = ROLL_START), then scrolls off; the name lands
// as PROJECTS (~0.33), then DRIFTS slowly UP as the heaviest parallax layer (see TITLE_DRIFT) while the
// thesis scrolls off fast and the first work panel crests up from below (works enters ≈0.50, as the
// thesis nears the top) — three layers at three speeds. Tune with ROLL_START (when the wave starts /
// how much it overlaps the copy-out) and ROLL_DUR/STAGGER (how fast it resolves — both cut ~20%).
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
const STATIC_STRETCH = 1.05;

// PARALLAX: once the word has LANDED as PROJECTS it drifts slowly UP across the rest of the pin. This
// is the heaviest, SLOWEST layer of the section handoff — the big title trails well behind the thesis
// (which scrolls off ~58vh near scroll-rate) and the first card (full scroll-rate rising from below),
// so the title leads up gently and opens breathing space beneath it before the card arrives (physics:
// bigger = slower). TITLE_DRIFT_START sits just past ROLL_END so the drift never fights the roll; the
// move settles to a constant (linear) parallax rate but launches with a soft CUBIC ease-in over the
// first TITLE_DRIFT_RAMP, so the title accelerates into the drift instead of snapping from held-still
// to full speed. Tune the separation with TITLE_DRIFT.
const TITLE_DRIFT_START = 0.35;
// A SLIGHT upward parallax only — the title separates gently from the faster-scrolling thesis as the
// hero exits, then leaves with the section naturally. (No shrink, no fade: the projects gallery below
// carries the section identity on its own rotated PROJECTS spine.) Tune the differential here.
const TITLE_DRIFT = "-16vh";
const TITLE_DRIFT_RAMP = 0.12; // fraction of the drift spent easing IN before it settles to its rate

// The script "Featured" eyebrow that reveals above the landing PROJECTS — the section title's quiet
// lead-in, in the SAME hand (Style Script) as the hero's "Hi, I'm" greeting, so the work reads
// "Featured Projects" exactly as the hero reads "Hi, I'm Pratiush". It rides the title's parallax drift
// (it lives inside the drifting root) and appears TOGETHER with the thesis statement — its reveal is
// synced to the thesis ink-in (HeroThesis INK_START) / the morph's start (ROLL_START ≈ 0.08), so the
// eyebrow and the pitch wash in as one beat while the name rolls. Reveal window, in progress:
const FEATURED_IN_START = 0.08;
const FEATURED_IN_END = 0.2;

// THE HANDOFF EXIT. Once the morph has landed, PROJECTS is no longer the panels' title — each
// project carries its own. So the word cedes the stage: it fades (with a touch of blur) as it drifts
// up, clearing before the first project's title reads, so the two big titles never collide. The
// "Featured" eyebrow leads the exit a beat earlier (it's the secondary mark). Tuned so the whole
// hero stage is clear by ~p_hero 0.50 (≈90vh page-scroll), before ProjectFeature's title window.
const FEATURED_OUT_START = 0.3;
const FEATURED_OUT_END = 0.44;
const PROJECTS_FADE_START = 0.36;
const PROJECTS_FADE_END = 0.5;
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
const INCOMING_ROT = -8; // degrees

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
const WAVE_LIFT = 0.22; // em — peak upward lift (rigid bob of the whole slot) at full tension
const WAVE_STRETCH_Y = 0.24; // peak vertical stretch of the OUTGOING glyph only (scaleY = 1 + this)
const WAVE_BUILD = 0.16; // progress-width of the tension load (the force's reach)
const WAVE_HOLD = 0.02; // progress-width the stretch lingers at full before the snap
const WAVE_SNAP = 0.045; // progress-width of the fast release (≪ WAVE_BUILD → a snap)
const WAVE_STATIC_DAMP = 0.12; // P & R feel the force but are held to this fraction

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
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    // Re-measure the instant the web font swaps in. `document.fonts.ready` can resolve BEFORE a
    // cold-loaded `font-display: swap` face actually paints, so the slot widths/kerns stay pinned to
    // the fallback font's metrics while the visible glyphs are the real face — a mismatch that splits
    // the word (e.g. "PRA TIUSH"). A ResizeObserver on the hidden metric samples fires exactly when
    // their advance widths change (fallback → real glyph), guaranteeing the fit uses real metrics.
    const ro = new ResizeObserver(measure);
    if (fromCurrentRef.current) ro.observe(fromCurrentRef.current);
    if (toCurrentRef.current) ro.observe(toCurrentRef.current);
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
}

export function MorphName({ progress }: { progress: MotionValue<number> }) {
  const { foregroundIn, reduce } = useIntro();

  // The slow parallax drift of the landed title (see TITLE_DRIFT). Hook runs unconditionally; the
  // reduced-motion branch below simply never reads it.
  const titleDrift = useTransform(progress, [TITLE_DRIFT_START, 1], ["0vh", TITLE_DRIFT], {
    ease: easedScrollStart(TITLE_DRIFT_RAMP),
  });

  // The "Featured" script eyebrow inks in (rise + fade) as the morph resolves into PROJECTS. Hooks run
  // unconditionally; the reduced-motion branch (PRATIUSH, no PROJECTS title) simply never renders it.
  const featuredOpacity = useTransform(
    progress,
    [FEATURED_IN_START, FEATURED_IN_END, FEATURED_OUT_START, FEATURED_OUT_END],
    [0, 1, 1, 0],
    { ease: cubicBezier(...INTRO_EASE) },
  );
  const featuredRise = useTransform(progress, [FEATURED_IN_START, FEATURED_IN_END], ["0.5em", "0em"], {
    ease: cubicBezier(...INTRO_EASE),
  });

  // The landed PROJECTS word fades + softly blurs out as it drifts up, ceding the stage to the first
  // project's title (no collision). Applied to the reveal wrapper so it never fights the entrance
  // mask on the inner run.
  const projectsOpacity = useTransform(progress, [PROJECTS_FADE_START, PROJECTS_FADE_END], [1, 0], {
    ease: cubicBezier(...INTRO_EASE),
  });
  const projectsBlur = useTransform(
    progress,
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
      // headroom and column gap derive from it in CSS, the roll travel from it in JS. `y` is the slow
      // post-landing parallax drift (TITLE_DRIFT) — applied to the whole title so it rides up as one.
      style={{ "--roll-gap": `${ROLL_GAP}em`, y: titleDrift } as MotionStyle}
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
              progress={progress}
            />
          ))}
        </motion.span>
      </motion.span>
    </motion.p>
  );
}
