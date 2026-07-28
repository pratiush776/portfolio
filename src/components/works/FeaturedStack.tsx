"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import {
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

/**
 * The featured work as a pinned deck. The title and the two-column layout hold still while each
 * project is uncovered in a fixed well: the still is already in place and a curtain opens upward
 * across it, developing out of grey as it goes. The words don't stack — they ride out of and back
 * into their masked edges in the same beat, so the picture and its line land on the same frame.
 *
 * Nothing here travels and nothing here is eased. This is the only scroll-scrubbed thing on the
 * site, and a scrubbed value tracking the finger is direct manipulation, not a transition — so
 * every value below is a straight linear function of one float. The house curve
 * (`--ease` / `EASE`) still governs everything that plays on its own: entrances, hovers, the page
 * transition. It has no business on a wheel.
 *
 * Below 1024px and under `prefers-reduced-motion`, WorkIndex renders the flat grid instead and
 * none of this mounts.
 */

const COUNT = featured.length;
const LAST = COUNT - 1;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

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
 * the copy holds through the whole shrink — a third of a handover, ~46svh of scroll — and only
 * starts leaving once the next curtain is actually rising. The incoming block then takes the rest
 * of the curtain and lands with it.
 *
 * Near half, so the two rides are about the same length. Handing the outgoing block a short exit
 * and the incoming one a long one leaves the column empty for most of the curtain and makes the
 * arrival crawl; even halves keep both moving at the speed the picture is.
 */
const COPY_SWAP = 0.45;

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
 */
const SCALE_FULL = 1;
const SCALE_PAST = 0.86;

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

/* ── the words ─────────────────────────────────────────────────────────────── */

/**
 * The words ride up from behind a clipped edge and drop back out the same way — the site's one
 * expressive gesture (the footer signature does it on mount).
 *
 * They ride the same two phases the picture does: the outgoing block clears its mask across the
 * shrink, the incoming one rises across the curtain and lands exactly as the curtain finishes. So
 * the picture and its line plant on the same frame, and the copy column is never the thing sitting
 * still while the deck moves.
 */
/** Each line leaves the mask a touch after the one above, and they all land together. */
const LINE_STEP = 0.03;

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
 * How much of a window the dot↔bar morph takes, at the handover. Short — it is a change of state,
 * not a journey — but not instant: the outgoing bar collapses and empties while the incoming one
 * stretches and starts filling, and the two are exactly complementary, so the rail's total length
 * never changes and the marks below never jump.
 *
 * It resolves at a quarter of the curtain, so the rail has finished saying which project this is
 * well before the picture finishes arriving. An indicator that lands after the thing it indicates
 * reads as a report; one that lands before it reads as the cause. It is also short enough that the
 * halfway state — two marks of equal length, which says nothing — is over quickly.
 */
const MORPH = 0.12;

const RAIL_HEIGHT =
  COUNT * DOT_SIZE + LAST * RAIL_GAP + (BAR_SIZE - DOT_SIZE);

/** When station `index` takes over: as its card's curtain starts, not when it finishes. */
const stationStart = (index: number) => (index === 0 ? 0 : revealStart(index));
/** When it hands on — the last station holds the mark to the end of the pin. */
const stationEnd = (index: number) =>
  index < LAST ? stationStart(index + 1) : STEPS;

/** How far station `index` has stretched into a bar: 1 through its own tenure, 0 outside it. */
const shapeAt = (index: number, position: number) => {
  // Station 0 is already a bar when the pin engages — its card was uncovered on the approach, so
  // it has no handover to grow through.
  const grow = index === 0 ? 1 : clamp01((position - stationStart(index)) / MORPH);
  const shrink =
    index === LAST ? 0 : clamp01((position - stationStart(index + 1)) / MORPH);
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

/** Linear 0→1 across a window, for the hand-combined values that read from both clocks. */
const ramp = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));

const WORD_IN: [number, number] = [0.18, 0.72];
const ROW_IN: [number, number] = [0.34, 0.86];
/* Opens as the row itself starts fading in, and lands where the words land. Starting later left a
   window in which the row was already visible but the curtain had not moved, so the section
   introduced itself with an empty grey plate; and finishing later than FIRST_WORDS broke this
   file's own rule that the picture and its line plant on the same frame. */
const FIRST_OPEN: [number, number] = [0.38, 0.9];
const FIRST_WORDS: [number, number] = [0.46, 0.9];

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
 * One line's ride. The first project's words come in on the approach and leave on the deck clock,
 * so its two halves are combined by hand; every other line reads from the deck alone.
 */
function useLine(
  u: MotionValue<number>,
  approach: MotionValue<number>,
  index: number,
  line: number,
): MotionProps {
  const stops: number[] = [];
  const y: string[] = [];

  if (index === 0) {
    stops.push(0);
    y.push("0%");
  } else {
    // Rides in across the back of the curtain and lands with it, each line a touch behind the one
    // above — starting only once the block it replaces has cleared its own mask.
    stops.push(copyOutEnd(index - 1) + line * LINE_STEP, index);
    y.push("125%", "0%");
  }

  if (index < LAST) {
    // Holds through the shrink, then leaves across the front of the next curtain — as a block, since
    // a staggered exit reads as the paragraph coming apart.
    stops.push(shrinkEnd(index), copyOutEnd(index));
    y.push("0%", "-125%");
  } else {
    stops.push(STEPS);
    y.push("0%");
  }

  const scrubbed = useTransform(u, stops, y);

  const combined = useTransform([approach, u], ([a, position]: number[]) => {
    const arrived = ramp(a, FIRST_WORDS[0] + line * 0.05, FIRST_WORDS[1]);
    const left = ramp(position, shrinkEnd(0), copyOutEnd(0));
    return `${(1 - arrived) * 125 - left * 125}%`;
  });

  return { style: { y: index === 0 ? combined : scrubbed } };
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
  // Four calls, one per line — a fixed count, so the hook order is stable.
  const lines = [
    useLine(u, approach, index, 0),
    useLine(u, approach, index, 1),
    useLine(u, approach, index, 2),
    useLine(u, approach, index, 3),
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
      <WorkCopy work={work} lines={lines} clip />
    </Link>
  );
}

/**
 * One station on the rail. It is a dot until its project's window opens, then it stretches into a
 * bar and fills top-down as the window is spent — so where you are and how far through it are the
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

  // The approach: the viewport-height of scroll immediately before the pin engages, which the
  // stage uses to assemble itself.
  const { scrollYProgress: approach } = useScroll({
    target: section,
    offset: ["start end", "start start"],
  });

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
      <div className="stack__pin">
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
      </div>
    </div>
  );
}
