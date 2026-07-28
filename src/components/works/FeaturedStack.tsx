"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionProps,
  type MotionValue,
} from "motion/react";

import { featured, type FeaturedWork } from "@/data/works";
import { Cover, WorkCopy } from "@/components/works/WorkCard";
import { kerned } from "@/lib/kerning";
import { EASE, GLIDE, useGlide } from "@/lib/motion";

/**
 * The featured work as a pinned deck. The title and the two-column layout hold still while each
 * project is uncovered in a fixed well: the still is already in place and a curtain opens upward
 * across it, developing out of grey as it goes. The picture is the event; the words and the
 * metadata answer it, a few pixels up and a fade, one element at a time and never all at once.
 *
 * Nothing here travels far and nothing here is on a timer. This is the only scroll-scrubbed thing
 * on the site, and a scrubbed value tracking the finger is direct manipulation, not a transition —
 * so every value below is a function of one float, and scrolling backward reverses the whole
 * section for free rather than needing a second choreography.
 *
 * ONE curve on the site, and this file is no exception to it: where anything here is shaped, it is
 * shaped by the house `EASE`. What differs is WHERE shaping is allowed. The PICTURE — curtain,
 * scale, develop — stays strictly linear, because it is a large object being moved by the wheel and
 * a curve on it is the wheel being disobeyed. The TYPE and the rail are shaped, because their
 * distances are 4–12px and a shaped settle at that scale reads as weight rather than as lag.
 *
 * Below 1024px and under `prefers-reduced-motion`, WorkIndex renders the flat grid instead and
 * none of this mounts.
 */

const COUNT = featured.length;
const LAST = COUNT - 1;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Linear 0→1 across a window. Every clock in this file is read through this. */
const ramp = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));

/** A window on one of the clocks, `[start, end]`. Named rather than written out because almost
    every constant below is one and the pairs are otherwise hard to tell apart. Mutable, not
    `readonly`: `useTransform` takes its input range as a plain array. */
type Span = [number, number];

/* ── the clock ─────────────────────────────────────────────────────────────────
   ONE float drives the whole section, and the thing it counts is TRANSITIONS, not projects. `u`
   runs 0 → STEPS across the pin; three projects are two handovers plus the last card's own shrink.

   Each unit is two phases end to end, and they tile it exactly:

     u ∈ [k,                k + SHRINK_SHARE]  card k shrinks back, its words hold then ride out
     u ∈ [k + SHRINK_SHARE, k + 1          ]  card k+1's curtain rises, its words ride in

   which means that at every scroll position in the pin, something is moving: either the picture
   you are on is receding or the next one is arriving. There is no third state. An earlier cut gave
   each project a still half to be read in, and that hold is what read as lag — a scrubbed section
   that stops responding to the wheel for half of every window feels broken rather than restful,
   and nothing is lost by removing it, because a scrubbed deck already holds perfectly still the
   moment you stop scrolling.

   Everything below reads from `u` directly. There are no keyframe tables and no hold/swap
   bookkeeping, because there is nothing to keep in sync: two values driven by the same float
   cannot drift. */

/**
 * How much of a handover the outgoing card's shrink takes; the curtain gets the rest.
 *
 * The split is uneven on purpose. The two phases cover very different distances — a curtain
 * crosses the whole height of the frame, a shrink moves each edge by a couple of dozen pixels — so
 * splitting the scroll evenly would make the recede crawl and the reveal race. At roughly a third
 * the two read at one speed, which is what lets them pass as a single continuous motion rather
 * than as two effects taking turns.
 */
const SHRINK_SHARE = 0.35;

/**
 * One unit per handover — card 0 is uncovered on the approach, so it needs no unit of its own —
 * plus a tail for the last card's own shrink.
 *
 * The tail is what makes every card's beat identical: land, hold while you recede, hand over.
 * Without it the pin released the instant the last curtain closed, which cost two things. The third
 * project got no readable beat at all, landing and then immediately being carried off by the page
 * while the other two each hold for a third of a handover. And its rail station was being measured
 * against a full unit while only ever receiving 0.65 of one, so the mark stopped filling at two
 * thirds and stuck there.
 *
 * Nothing waits here: the tail is the last picture receding, so the deck closes on a movement
 * rather than on a pause, and the page takes over from there.
 */
const STEPS = LAST + SHRINK_SHARE;

/** When card k's curtain starts and finishes. Card 0's runs on the approach clock instead. */
const revealStart = (k: number) => k - 1 + SHRINK_SHARE;
/** When card k shrinks back — immediately, the instant it has finished arriving. */
const shrinkEnd = (k: number) => k + SHRINK_SHARE;

/**
 * How much of the CURTAIN the outgoing words take to leave, as a fraction of it.
 *
 * The words deliberately do not move during the shrink. The picture receding is already carrying
 * that phase, and a block of copy that leaves the moment its picture starts to recede gives you no
 * window in which the work is on screen and its title is still there to be read and clicked. So
 * the copy holds through the whole shrink — a third of a handover, ~32svh of scroll — and only
 * starts leaving once the next curtain is actually rising. The incoming block then takes the rest
 * of the curtain and lands with it.
 *
 * The split is roughly 1 : 2, and that asymmetry is the point. Leaving is a shorter act than
 * arriving — the outgoing block is only being taken away, while the incoming one has to be read —
 * so the exit runs about half the length of the entrance. In the timings this section was specced
 * against that is ~260ms out against ~485ms in.
 */
const COPY_SWAP = 0.35;

/** The point in card k's window where the words hand over: the outgoing block has cleared its mask
    and the incoming one starts to rise. */
const copyOutEnd = (k: number) =>
  shrinkEnd(k) + COPY_SWAP * (1 - SHRINK_SHARE);

/** Distance from a card landing to its words leaving — the span the pointer belongs to it for. */
const COPY_HANDOVER = copyOutEnd(0);

/** Where a keyboard focus or a deep link wants to land: mid-way through card k's still copy, where
    the work is up and its title is readable. Uniform now that the last card has a hold of its own. */
const holdCenter = (k: number) => (k + SHRINK_SHARE / 2) / STEPS;

/* ── the deck ──────────────────────────────────────────────────────────────── */

/**
 * THE CARD is what scales — the whole rectangle, picture and edges together. Nothing scales inside
 * it, so the crop never changes; the card simply gets smaller, the way a print pushed back on a
 * table does.
 *
 * A card arrives at exactly 1, filling its column, and stays there for its entire time on screen.
 * The scale is spent afterwards: the instant it has finished arriving it begins receding to
 * SCALE_PAST, and the next curtain rises over it only once that recede has completed. So the two
 * sizes you see together mid-handover — the receded band above the curtain line, the full-bleed
 * picture below it — are a settled state rather than something caught in passing.
 *
 * Landing at exactly 1 is what keeps the picture on the page's left edge: a card resting at 0.9
 * would sit ~30px inside its column on every side, putting its left edge that far off the gutter
 * the PROJECTS stem and the archive rows are aligned to. It is off-fill only while it is being
 * covered, where the alignment cannot be read anyway.
 *
 * The card underneath is never exposed. Card k has finished receding to SCALE_PAST before card
 * k+1's curtain moves at all, and k+1 runs the whole reveal at 1 — so the one on top is the larger
 * of the two throughout, and covers the smaller one completely.
 *
 * The recede is a 10% trim rather than the 14% it started at. Fourteen moved each edge by ~44px,
 * which on a frame this size is a travel in its own right — a second event competing with the
 * curtain rather than a depth cue under it. At ten it is ~32px, still unmistakably a print being
 * pushed back and no longer the largest movement on screen.
 */
const SCALE_FULL = 1;
const SCALE_PAST = 0.9;

/**
 * The flash. A card does not merely fade up out of grey — it comes in blown out, as if the light
 * is still on it, and the exposure falls away as the curtain climbs.
 *
 * It resolves at BLOWOUT_END of the reveal rather than at the end of it, and that ordering is the
 * whole trick: the exposure has already settled while the curtain is still running, so the picture
 * finishes arriving CLEAN instead of arriving and then correcting itself. A develop that lands on
 * the same frame as the curtain reads as two events; one that lands early reads as the light
 * settling as the picture emerges.
 */
const BLOWOUT = 0.9;
const BLOWOUT_END = 0.4;

/**
 * Grey → colour is the site's own axis, so the curtain rides that over its whole length. Unlike
 * the flash above, this one is meant to complete exactly as the picture lands: the last of the
 * colour arrives on the same frame as the last of the frame.
 */
const DEVELOP_END = 1;

/* ── the words ──────────────────────────────────────────────────────────────────
   The type answers the picture QUIETLY. The image is the event in this section; every line of copy
   and every piece of metadata is a consequence of it, so nothing here travels far enough to be
   noticed as an effect in its own right.

   Which is a reversal. These lines used to ride a full line-height out from behind a masked edge —
   the footer signature's gesture, at four places at once — and at paragraph scale that gesture has
   a flaw it does not have on a single signature: a four-line claim translated by its own height
   inside a clip reveals ITSELF one line at a time, bottom line first. The block came apart on the
   way in. Now each block moves as one piece, a handful of pixels up, and carries a fade; the clips
   stay, but only as a guarantee that nothing bleeds past its edge.

   Everything below is still a straight read off the scroll clocks — see the note at the top of the
   file. What is new is that these windows are SHAPED rather than linear, on the house curve. The
   distances are small enough that shaping them reads as weight rather than as the wheel being
   disobeyed, which is not true of the curtain, the scale or the develop — those stay linear. */

/**
 * The house curve, evaluated in JS so a scrubbed window can be shaped by the same bezier the CSS
 * transitions use. `--ease` and `EASE` are the one curve on the site and this is that curve, not a
 * second one: consistency of feel across the page is worth more here than a curve tuned to this
 * section's own argument.
 *
 * It is symmetric, so a shaped window eases in as well as out. On a 4–12px move that costs nothing
 * — the first frames of a 12px travel are sub-pixel either way — and what it buys is that the copy
 * settles with exactly the weight a hover or the page transition settles with.
 */
const REVEAL_EASE = cubicBezier(...EASE);

/** The four things that move, in the order the composition ranks them. */
type Role = "title" | "desc" | "cta" | "credit";

/**
 * How far each block travels, in px, coming in and going out.
 *
 * Small and unequal. Unequal because travel is the cheapest way left to say rank once everything
 * shares one direction and one curve: the title moves furthest and so reads as the arrival, the way
 * in barely moves at all and is carried almost entirely by its fade. Small because the frame beside
 * these lines is crossing its own full height in the same window — anything more here and the
 * column starts competing with the picture instead of answering it.
 */
const TRAVEL: Record<Role, { in: number; out: number }> = {
  title: { in: 12, out: 10 },
  desc: { in: 6, out: 8 },
  cta: { in: 4, out: 6 },
  credit: { in: 5, out: 6 },
};

/**
 * WHEN each block moves, as a fraction of the span it belongs to. Three tables, one per span, and
 * they are all read the same way: `[start, end]` inside `[0, 1]` of that span.
 *
 * Stating them normalised rather than in clock units is what keeps the choreography honest across
 * the two clocks. The first project arrives on the approach (100svh) and the other two arrive on a
 * handover (90svh × 0.42), so the same table produces the same SHAPE at two different lengths
 * without anyone having to keep two sets of numbers in step.
 */

/** Arriving on the deck. The credit updates first and quietly — it is the caption changing, which
    is what tells you a handover is underway — then the title, the claim, and the way in. */
const IN_WINDOW: Record<Role, Span> = {
  credit: [0, 0.62],
  title: [0.12, 1],
  desc: [0.27, 0.93],
  cta: [0.43, 1],
};

/** Leaving: the arrival read backwards. The way in goes first because it is the least of them and
    the one thing that must not still be clickable when it no longer belongs to what is on screen;
    the credit goes last, so the frame keeps its caption for as long as the frame is still there. */
const OUT_WINDOW: Record<Role, Span> = {
  cta: [0, 0.46],
  desc: [0.18, 0.64],
  title: [0.36, 0.82],
  credit: [0.54, 1],
};

/**
 * Arriving on the approach, which is the one entrance with no outgoing block to clear first.
 *
 * So the order differs from IN_WINDOW in one place: the credit TRAILS here rather than leading. It
 * leads a handover because it is the caption being corrected on a frame you are already reading;
 * on the approach there is nothing to correct, and a caption that lands before the thing it
 * captions has named the work in 13px grey type before the serif gets to.
 */
const FIRST_WINDOW: Record<Role, Span> = {
  title: [0, 0.87],
  desc: [0.14, 0.78],
  cta: [0.31, 0.88],
  credit: [0.38, 1],
};

/** The absolute span on the deck clock in which card `index`'s block arrives, and the one in which
    it leaves. Card 0 arrives on the approach instead; the last card never leaves. */
const inSpan = (index: number): Span => [copyOutEnd(index - 1), index];
const outSpan = (index: number): Span => [shrinkEnd(index), copyOutEnd(index)];

/** Seat a normalised role window inside an absolute span. */
const place = ([start, end]: Span, [from, to]: Span): Span => [
  start + (end - start) * from,
  start + (end - start) * to,
];

/** How far through a window a clock has got, on the reveal curve. */
const eased = (value: number, [start, end]: Span) =>
  REVEAL_EASE(ramp(value, start, end));

/* ── the rail ──────────────────────────────────────────────────────────────────
   Three marks in a column. The one you are on stretches into a bar and fills as you spend its
   window; the other two stay dots. One mark, two lengths — so the rail says which project without
   a second signal, and how far through it without a second element.

   The fill runs DOWNWARD, unlike the frame's curtain. They are not the same object: the frame is
   being uncovered, so its edge rises; the rail is a track being spent, so it advances toward the
   station below it — the direction the sequence reads. */

/** Small enough that an idle station is a point rather than a control. Below this the mark stops
    registering as deliberate and starts looking like dust. */
const DOT_SIZE = 5;
/** The active mark's length. Eight dots, so it is unmistakably the dominant mark. */
const BAR_SIZE = 40;
/** Air between marks — a little over two and a half dots, so three idle stations read as a
    considered column and not as a dotted line. */
const RAIL_GAP = 14;

/**
 * How much of a handover the dot↔bar morph takes. A change of state, not a journey: the outgoing
 * bar collapses and empties while the incoming one stretches and starts filling, and the two are
 * exactly complementary, so the rail's total length never changes and the marks below never jump.
 *
 * ~275ms at the speed the rest of this section is specced against, which is the same order as the
 * copy's own moves — the rail is the last thing in the hierarchy and has no business being the
 * fastest thing on screen.
 */
const MORPH = 0.24;

/**
 * How far into a handover the rail changes hands, from the outgoing card's landing.
 *
 * The middle of the change, which is later than it used to sit. The rail used to turn over at the
 * very top of the curtain, on the argument that an indicator landing after the thing it indicates
 * reads as a report rather than as a cause. That argument holds for the START of the gesture and
 * this still keeps it: the morph opens while the curtain is a fifth up and has resolved by three
 * fifths, so the rail has said which project this is well before the picture finishes arriving.
 * What it no longer does is say it FIRST, ahead of the copy and almost ahead of the frame — which
 * for the least important mark in the composition was a claim it had not earned.
 */
const MORPH_AT = 0.5;

const RAIL_HEIGHT =
  COUNT * DOT_SIZE + LAST * RAIL_GAP + (BAR_SIZE - DOT_SIZE);

/** When station `index` takes over: as its card's curtain starts, not when it finishes. */
const stationStart = (index: number) => (index === 0 ? 0 : revealStart(index));
/** When it hands on — the last station holds the mark to the end of the pin. */
const stationEnd = (index: number) =>
  index < LAST ? stationStart(index + 1) : STEPS;

/** When station `index` morphs — mid-handover, rather than at the top of its card's curtain. Kept
    apart from stationStart, which is the TENURE boundary the fill is measured against: the mark
    changes shape halfway through a handover, but it owns its project from the moment the curtain
    starts, and the two are not the same fact. */
const morphStart = (index: number) => index - 1 + MORPH_AT;

/** How far station `index` has stretched into a bar: 1 through its own tenure, 0 outside it. */
const shapeAt = (index: number, position: number) => {
  // Station 0 is already a bar when the pin engages — its card was uncovered on the approach, so
  // it has no handover to grow through.
  //
  // Both legs are shaped by the reveal curve, and both are safe to shape because they take the
  // IDENTICAL argument: station k's collapse and station k+1's growth are the same ramp read
  // twice. Any monotonic curve applied to both therefore leaves `grow - shrink` summing to a
  // constant across the column, which is what holds the rail's total length still.
  const grow =
    index === 0 ? 1 : REVEAL_EASE(clamp01((position - morphStart(index)) / MORPH));
  const shrink =
    index === LAST
      ? 0
      : REVEAL_EASE(clamp01((position - morphStart(index + 1)) / MORPH));
  return grow - shrink;
};

/**
 * How far station `index`'s project has been spent, 0 → 1 — the fill inside the bar.
 *
 * Measured against that station's OWN tenure rather than against a nominal unit, which is the only
 * way the mark can be trusted: the three tenures are genuinely different lengths. Station 0's is
 * short because its card was uncovered back on the approach and the deck clock picks it up already
 * on screen — measuring it against a full unit would start the rail a third full at the pin.
 */
const spentAt = (index: number, position: number) =>
  clamp01(
    (position - stationStart(index)) /
      (stationEnd(index) - stationStart(index)),
  );

/* ── the approach ──────────────────────────────────────────────────────────────
   A second clock, running over the viewport-height of scroll BEFORE the pin engages: 0 when the
   section's top edge enters at the bottom of the screen, 1 the moment it reaches the top and the
   deck takes over. The stage assembles on this one — the word out of its clip, the work up
   beneath it, the first curtain opening as it settles — so the section arrives rather than simply
   being there when you get to it.

   The first project is uncovered here rather than on the deck clock on purpose: a pinned section
   that opens on an empty frame has nothing to hold you while the first curtain runs. It is also
   why the deck clock counts handovers rather than projects — card 0 has already arrived by the
   time the pin engages, so the pin has only the two transitions left to spend. */

/**
 * PROJECTS out of its clipped edge. It settles at 0.62 — BEFORE the copy's window opens at 0.64,
 * which is the one ordering constraint the stage's arrival has: the section has to name itself and
 * come to rest before it starts naming the work inside it, or the two headings are moving at once
 * and neither is the anchor.
 *
 * It is also the only element here whose position is permanent. Once it has landed it holds for the
 * whole pin — projects hand over underneath it and it does not reanimate for any of them.
 */
const WORD_IN: Span = [0.2, 0.62];
const ROW_IN: Span = [0.34, 0.86];
/* Opens as the row itself starts fading in. Starting later left a window in which the row was
   already visible but the curtain had not moved, so the section introduced itself with an empty
   grey plate. */
const FIRST_OPEN: Span = [0.38, 0.9];
/**
 * The first project's copy, on the approach.
 *
 * It opens at 0.64, which is half way up the first curtain — late on purpose. The picture has to be
 * established before the type answers it, and by this point the exposure has settled (BLOWOUT_END)
 * and half the frame is up, so there is something on screen for the title to be about. Earlier and
 * the words were arriving over a mostly-grey plate.
 *
 * It closes at 1 — the frame at 0.9 and the last of the copy as the pin engages. The frame and its
 * title no longer plant on the same frame, and that is the change: the picture lands, and the words
 * settle onto it just after. One event with a consequence, rather than two things landing together.
 */
const FIRST_COPY: Span = [0.64, 1];

/* The pin's two seams — where the composition stops dead on arrival and starts dead on the way out
   — are damped by the site's glide (`useGlide`, src/lib/motion.ts). The deck was where that effect
   was worked out and it is still the only place using it, but nothing about it is specific to a
   pinned section, so it lives with the rest of the motion vocabulary rather than here. It runs at
   the house defaults; the one deck-specific fact worth recording is that this section's own ceiling
   is about 0.7, past which the peak displacement lifts PROJECTS into the statement above it at
   mid-approach. */

/* ── components ────────────────────────────────────────────────────────────── */

function StackCard({
  work,
  index,
  u,
  approach,
}: {
  work: FeaturedWork;
  index: number;
  /** The deck clock, 0 → STEPS. */
  u: MotionValue<number>;
  approach: MotionValue<number>;
}) {
  // The curtain. Every card but the first opens on the deck clock; the first opens as the stage
  // assembles, so it is already whole when the pin engages.
  const onDeck = useTransform(u, [revealStart(index), index], [0, 1]);
  const onApproach = useTransform(approach, FIRST_OPEN, [0, 1]);
  const open = index === 0 ? onApproach : onDeck;

  // Bottom edge pinned, top edge rising — the same direction the copy and the footer signature
  // travel, so the picture and the type are doing one gesture at two scales. `inset()` rather
  // than a polygon: identical shape, and the cheaper of the two to animate.
  const edge = useTransform(open, (v) => 100 - 100 * v);
  const clipPath = useMotionTemplate`inset(${edge}% 0% 0% 0%)`;

  // The clip stays on the frame and the scale goes on the layer inside it — that separation is
  // what lets the card scale at all. Putting both on one element would scale the clip rectangle
  // too, so the curtain would shrink along with the card instead of holding its line on the well.
  //
  // The card lands at full and recedes the instant it has landed. The last one has no successor,
  // so its leg runs off the end of the clock and it simply stays at full.
  const scale = useTransform(
    u,
    [index, shrinkEnd(index)],
    [SCALE_FULL, SCALE_PAST],
  );

  // Colour arrives with the last of the frame; the exposure has settled well before it, so the
  // picture finishes arriving clean rather than arriving and then correcting.
  const gray = useTransform(open, (v) => 1 - clamp01(v / DEVELOP_END));
  const lift = useTransform(
    open,
    (v) => 1 + BLOWOUT * (1 - clamp01(v / BLOWOUT_END)),
  );
  const filter = useMotionTemplate`grayscale(${gray}) brightness(${lift})`;

  // No opacity anywhere: a card that has not opened is clipped to nothing, and a card that has
  // been covered sits behind — and smaller than — the one covering it, so it is wholly hidden
  // without being switched off.
  return (
    <motion.div
      className="frame stack-card"
      style={{ clipPath, zIndex: index }}
    >
      {/* The words alongside carry the tab stop and the accessible name; this is the same
          destination reached by clicking the picture, so it stays out of the tab order. */}
      <Link
        href={`/works/${work.slug}`}
        className="stack-card__link"
        tabIndex={-1}
      >
        <motion.div className="stack-card__media" style={{ scale, filter }}>
          <Cover work={work} />
        </motion.div>
      </Link>
    </motion.div>
  );
}

/**
 * One block's reveal — a few pixels up out of nothing, and a few pixels further up into nothing
 * again when its project hands over.
 *
 * Both halves come off ONE pair of ramps, `arrived` and `left`, and `y` and `opacity` are both read
 * from that pair. Two values off one source cannot drift, so a block can never be caught halfway
 * faded at the wrong height — the same reasoning the picture's curtain and develop are built on.
 *
 * The first project is the exception it always was: it arrives on the approach clock, because its
 * card was uncovered before the pin engaged, and leaves on the deck clock like everything else.
 */
function useReveal(
  u: MotionValue<number>,
  approach: MotionValue<number>,
  index: number,
  role: Role,
): MotionProps {
  const travel = TRAVEL[role];

  const first = index === 0;
  const arrive = first
    ? place(FIRST_COPY, FIRST_WINDOW[role])
    : place(inSpan(index), IN_WINDOW[role]);
  // The last card has no successor, so nothing ever takes its column back.
  const depart = index === LAST ? null : place(outSpan(index), OUT_WINDOW[role]);

  const read = (a: number, position: number) => ({
    arrived: eased(first ? a : position, arrive),
    left: depart ? eased(position, depart) : 0,
  });

  // Below at rest, then nothing, then further up as it goes: one direction throughout, so the
  // column only ever reads as moving one way regardless of which project you are between.
  const y = useTransform([approach, u], ([a, position]: number[]) => {
    const { arrived, left } = read(a, position);
    return (1 - arrived) * travel.in - left * travel.out;
  });

  const opacity = useTransform([approach, u], ([a, position]: number[]) => {
    const { arrived, left } = read(a, position);
    return arrived * (1 - left);
  });

  return { style: { y, opacity } };
}

function StackCopy({
  work,
  index,
  u,
  approach,
  active,
  onFocus,
}: {
  work: FeaturedWork;
  index: number;
  u: MotionValue<number>;
  approach: MotionValue<number>;
  active: boolean;
  onFocus: (index: number) => void;
}) {
  // Three calls, one per line the column actually holds — the credit rides the margin rail instead
  // (see StackCredit). Keyed by ROLE rather than by position: the order these three move in is not
  // the order they are stacked in, and naming them is what stops the two being confused.
  const lines = [
    useReveal(u, approach, index, "title"),
    useReveal(u, approach, index, "desc"),
    useReveal(u, approach, index, "cta"),
  ];

  return (
    <Link
      href={`/works/${work.slug}`}
      className="stack-copy__block"
      // Copy that has ridden out of its mask must not swallow clicks meant for whatever is
      // underneath. It stays focusable on purpose: the handler below is what makes tabbing
      // through the deck work.
      style={{ pointerEvents: active ? "auto" : "none" }}
      onFocus={() => onFocus(index)}
    >
      <WorkCopy work={work} lines={lines} clip credit={false} />
    </Link>
  );
}

/**
 * The credit, on its side in the page's left margin: the year above, the role below, both reading
 * bottom-to-top.
 *
 * It is the same two facts the flat layout sets as a line under the claim, moved out of the column
 * because the column has one job here — name the work, say what it is, offer the way in — and a
 * third line of small grey type between the claim and that offer is what stops those two from
 * reading as a pair. In the margin the same facts caption the frame instead, and the copy column is
 * three lines with nothing in it that is not doing one of those three jobs.
 *
 * It rides the deck's own clock, so the credit hands over on the frame its project does rather than
 * sitting still in the margin while the work changes underneath it — but it is the QUIETEST thing
 * that moves here. Five pixels and a fade, and it is last out and first in on a handover: last out
 * because the frame should keep its caption for as long as the frame is still there, first in
 * because a caption correcting itself is the cheapest possible signal that a handover is underway.
 *
 * Both lines take ONE reveal between them, not one each. They are a single caption split across the
 * frame's two ends; giving them separate windows would stagger a two-word unit for no reason a
 * reader could name. The two clips stay — they cost nothing and they guarantee the rotated type
 * cannot bleed past its own edge — but they are no longer doing the work they were built for.
 */
function StackCredit({
  work,
  index,
  u,
  approach,
}: {
  work: FeaturedWork;
  index: number;
  u: MotionValue<number>;
  approach: MotionValue<number>;
}) {
  // One reveal, driving both lines. A MotionValue is free to feed any number of elements, and
  // sharing it is what makes the caption move as a caption.
  const credit = useReveal(u, approach, index, "credit");

  return (
    <div className="stack-credit">
      <span className="stack-credit__clip">
        <motion.span className="stack-credit__line" {...credit}>
          <span className="stack-credit__text">{work.year}</span>
        </motion.span>
      </span>
      <span className="stack-credit__clip">
        <motion.span className="stack-credit__line" {...credit}>
          <span className="stack-credit__text">{work.role}</span>
        </motion.span>
      </span>
    </div>
  );
}

/**
 * One station on the rail. It is a dot until its handover reaches the middle, then it stretches into
 * a bar and fills top-down as its window is spent — so where you are and how far through it are the
 * same mark, and nothing travels between stations to be misread as an in-between state.
 *
 * The fill is scaled by the stretch, which is what makes the collapse read as one gesture: at the
 * handover the outgoing bar empties as it shortens and arrives back at an empty dot, rather than
 * shrinking into a solid one.
 */
function StackDot({ index, u }: { index: number; u: MotionValue<number> }) {
  const height = useTransform(
    u,
    (v) => DOT_SIZE + shapeAt(index, v) * (BAR_SIZE - DOT_SIZE),
  );

  // Stacked, not pitched: a station's offset is everything above it plus the air between. Because
  // the growing and collapsing stations are exactly complementary, this sum is constant at rest
  // and continuous through a handover — the column never jumps. It rides on `y` rather than `top`
  // so the reflow is a transform.
  const offset = useTransform(u, (v) => {
    let top = index * (DOT_SIZE + RAIL_GAP);
    for (let j = 0; j < index; j++) top += shapeAt(j, v) * (BAR_SIZE - DOT_SIZE);
    return top;
  });

  const clipPath = useTransform(u, (v) => {
    const filled = spentAt(index, v) * shapeAt(index, v);
    return `inset(0% 0% ${100 - 100 * filled}% 0%)`;
  });

  return (
    <motion.span className="stack-dots__station" style={{ height, y: offset }}>
      <span className="stack-dots__track" />
      <motion.span className="stack-dots__fill" style={{ clipPath }} />
    </motion.span>
  );
}

export function FeaturedStack() {
  const section = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [active, setActive] = useState(0);

  // 0 when the section's top meets the viewport top — the moment the pin engages — and 1 when its
  // bottom meets the viewport bottom, the moment it lets go. Exactly the pinned duration.
  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });

  // The section's two edges, and the counter-drift across them (see `useGlide`). `approach` is the
  // viewport-height of scroll immediately before the pin engages, which the stage also uses to
  // assemble itself — the glide owns that clock because it needs both edges anyway, and one
  // definition of where this section begins is better than two that can drift apart.
  const { entering: approach, drift } = useGlide(section, GLIDE.seam);

  // The deck clock. One unit per handover — everything on the deck reads from this.
  const u = useTransform(scrollYProgress, [0, 1], [0, STEPS]);

  // Which project owns the pointer. It flips the moment the outgoing block has cleared its mask,
  // so the clicks change hands exactly as the words do — which now means a card keeps its clicks
  // for the whole of its shrink, not just while it is still at full size. Guarded by a ref rather
  // than leaning on React's bail-out: this runs on every scroll frame, and even a render that gets
  // dropped costs scheduling work in the middle of the one animation on the page that has no
  // frames to spare.
  const current = useRef(0);
  const sync = (position: number) => {
    const next = Math.min(
      LAST,
      Math.max(0, Math.floor(position - COPY_HANDOVER) + 1),
    );
    if (next === current.current) return;
    current.current = next;
    setActive(next);
  };

  useMotionValueEvent(u, "change", sync);

  // A reload restores scroll position without firing a change, so read the clock once on mount
  // too. Without this a refresh partway down leaves the visible copy dead to the pointer and an
  // invisible one taking clicks.
  useEffect(() => {
    sync(u.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Pinning hides the later projects from the tab order's point of view — focus one and the deck
      scrolls to it, instantly, so focus is never parked on something invisible. */
  const revealOnFocus = (index: number) => {
    const element = section.current;
    if (!element || index === active) return;

    const top = element.getBoundingClientRect().top + window.scrollY;
    const travel = element.offsetHeight - window.innerHeight;
    const target = top + holdCenter(index) * travel;

    if (lenis) lenis.scrollTo(target, { immediate: true });
    else window.scrollTo({ top: target });
  };

  // The stage's own arrival: the word out of its clipped edge first, then the work up beneath it.
  const wordY = useTransform(approach, WORD_IN, ["125%", "0%"]);
  const rowY = useTransform(approach, ROW_IN, [40, 0]);
  const rowOpacity = useTransform(approach, ROW_IN, [0, 1]);

  return (
    <div
      ref={section}
      className="stack"
      // The section's height is STEPS handovers of scroll plus the one viewport the pin occupies;
      // handing the count to CSS keeps the two ends of that sum from drifting if a fourth
      // primary work is added.
      style={{ "--stack-steps": STEPS } as React.CSSProperties}
    >
      {/* The transform goes on the PIN rather than on the composition inside it, so the clip, the
          rail in the margin and the row all drift as one object — and because the drift is zero for
          the whole of the pinned phase, the sticky element it sits on is never actually displaced
          while it is doing its job. */}
      <motion.div className="stack__pin" style={{ y: drift }}>
        <div className="stack__inner gutter measure">
          <div className="projects-title">
            <h2 className="projects-word display" aria-label="Projects">
              {/* The J descends well below the baseline at this scale, so the clip carries a
                  little extra room under it and the word starts further down to match. */}
              <span className="stack__word-clip">
                <motion.span className="stack__word" style={{ y: wordY }}>
                  {/* Same optical spacing as the flat layout's word — the two are the same
                      heading at the same size, one per breakpoint. */}
                  {kerned("Projects").map(({ char, style }, i) => (
                    <span key={i} style={style}>
                      {char}
                    </span>
                  ))}
                </motion.span>
              </span>
            </h2>
          </div>

          <motion.div
            className="stack__row"
            style={{ y: rowY, opacity: rowOpacity }}
          >
            {/* Both rails sit OUTSIDE the row, one in each page margin: the credit on the left,
                where the frame it captions begins, and the progress rail on the right, where the
                reading ends. Splitting them is what lets each be read as what it is — stacked on
                one edge they were a single column of furniture saying two unrelated things. */}
            <div className="stack-credits">
              {featured.map((work, index) => (
                <StackCredit
                  key={work.slug}
                  work={work}
                  index={index}
                  u={u}
                  approach={approach}
                />
              ))}
            </div>

            <div className="stack-well">
              {featured.map((work, index) => (
                <StackCard
                  key={work.slug}
                  work={work}
                  index={index}
                  u={u}
                  approach={approach}
                />
              ))}
            </div>

            <div className="stack-copy">
              {featured.map((work, index) => (
                <StackCopy
                  key={work.slug}
                  work={work}
                  index={index}
                  u={u}
                  approach={approach}
                  active={index === active}
                  onFocus={revealOnFocus}
                />
              ))}
            </div>

            {/* Back inside the row, which is what centres it on the FRAME rather than on the whole
                pinned screen — the title above is not part of what the rail counts. It reaches out
                to the page's own margin from here; see .stack-dots. */}
            <div
              className="stack-dots"
              aria-hidden="true"
              style={{ height: RAIL_HEIGHT }}
            >
              {featured.map((work, index) => (
                <StackDot key={work.slug} index={index} u={u} />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
