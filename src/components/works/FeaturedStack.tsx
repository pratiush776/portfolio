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
   ONE float drives the whole section. `u` runs 0 → COUNT across the pin, so each project owns
   exactly one unit — one `--stack-step` of scroll (see globals.css). Project k's window is
   u ∈ [k, k+1); within it the phase p = u - k says where you are in that project.

   Everything below reads from `u` directly. There are no keyframe tables and no hold/swap
   bookkeeping, because there is nothing to keep in sync: two values driven by the same float
   cannot drift. */

/**
 * The fraction of a project's window its curtain takes. Half, so the back half of every window is
 * a genuine still frame — long enough to read the words and click them — while the front half is
 * always actively revealing. A swap that is a fifth of the window leaves the deck frozen most of
 * the time, and a deck that is frozen most of the time reads as a sequence of events rather than
 * as one motion.
 */
const WIPE = 0.5;

/** Middle of project k's still half — where a keyboard focus or a deep link wants to land. */
const holdCenter = (k: number) => (k + (k === 0 ? 0.5 : (1 + WIPE) / 2)) / COUNT;

/* ── the deck ──────────────────────────────────────────────────────────────── */

/**
 * The one thing that is never still: every card's scale is a single straight line through its own
 * window, `1 + DRIFT·(index - u)`, clamped at both ends. A card sits at SCALE_MAX while it waits,
 * passes through exactly 1 the moment its window opens, and keeps receding at a constant rate
 * until it parks at SCALE_MIN.
 *
 * That the ramp is continuous is the point. It means there is no handover to hide — the reference
 * this is drawn from snaps its incoming card from 1.25 to 1 and buries the jump under a closed
 * curtain, which works, but a line that never breaks needs no burying. And because the drift runs
 * on through the still half, nothing on screen is ever completely stopped: the section always has
 * a slow current under it, which is what welds the beats into one motion.
 *
 * The band is tight — the reference spends ±25% against a dark backdrop, where a card can shrink
 * into the void. Ours is a hard-edged frame on bone, so a card that shrank that far would read as
 * a hole opening around it rather than as depth.
 */
const DRIFT = 0.08;
const SCALE_MAX = 1 + DRIFT;
const SCALE_MIN = 1 - DRIFT;

/**
 * How far the develop is carried past colour. Grey → colour is the site's own axis, so the curtain
 * rides that; the small brightness lift on top is what makes the picture read as emerging out of
 * the light rather than merely gaining saturation. Both run on the curtain's own progress, so the
 * reveal is one gesture and not a landing followed by a separate develop.
 */
const LIFT = 0.25;

/* ── the words ─────────────────────────────────────────────────────────────── */

/**
 * The words ride up from behind a clipped edge and drop back out the same way — the site's one
 * expressive gesture (the footer signature does it on mount).
 *
 * The handover fits inside the curtain: the outgoing block clears its mask over the first
 * COPY_OUT of the window, the incoming one rises from there and lands exactly when the curtain
 * finishes at WIPE. So the picture and its line plant on the same frame.
 */
const COPY_OUT = 0.22;
/** Each line leaves the mask a touch after the one above, and they all land together. */
const LINE_STEP = 0.03;

/* ── the rail ──────────────────────────────────────────────────────────────────
   Three marks in a column. The one you are on stretches into a bar and fills as you spend its
   window; the other two stay dots. One mark, two lengths — so the rail says which project without
   a second signal, and how far through it without a second element.

   The fill runs DOWNWARD, unlike the frame's curtain. They are not the same object: the frame is
   being uncovered, so its edge rises; the rail is a track being spent, so it advances toward the
   station below it — the direction the sequence reads. */

const DOT_SIZE = 9;
/** The active mark's length. Roughly five dots, so it is unmistakably the dominant mark. */
const BAR_SIZE = 44;
/** Air between marks. With the dot at 9 this keeps the resting pitch the rail already had. */
const RAIL_GAP = 15;

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

/** How far station `index` has stretched into a bar: 1 through its own window, 0 outside it. */
const shapeAt = (index: number, position: number) => {
  // Station 0 is already a bar when the pin engages — its window starts at u = 0, so it has no
  // handover to grow through.
  const grow = index === 0 ? 1 : clamp01((position - index) / MORPH);
  const shrink = clamp01((position - index - 1) / MORPH);
  return grow - shrink;
};

/* ── the approach ──────────────────────────────────────────────────────────────
   A second clock, running over the viewport-height of scroll BEFORE the pin engages: 0 when the
   section's top edge enters at the bottom of the screen, 1 the moment it reaches the top and the
   deck takes over. The stage assembles on this one — the word out of its clip, the work up
   beneath it, the first curtain opening as it settles — so the section arrives rather than simply
   being there when you get to it.

   The first project is uncovered here rather than on the deck clock on purpose: a pinned section
   that opens on an empty frame has nothing to hold you while the first curtain runs. Its own
   window on the deck clock is therefore all still, which reads as a moment with the first piece. */

/** Linear 0→1 across a window, for the hand-combined values that read from both clocks. */
const ramp = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));

const WORD_IN: [number, number] = [0.18, 0.72];
const ROW_IN: [number, number] = [0.34, 0.86];
const FIRST_OPEN: [number, number] = [0.52, 0.96];
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
  /** The deck clock, 0 → COUNT. */
  u: MotionValue<number>;
  approach: MotionValue<number>;
}) {
  // The curtain. Every card but the first opens on the deck clock; the first opens as the stage
  // assembles, so it is already whole when the pin engages.
  const onDeck = useTransform(u, [index, index + WIPE], [0, 1]);
  const onApproach = useTransform(approach, FIRST_OPEN, [0, 1]);
  const open = index === 0 ? onApproach : onDeck;

  // Bottom edge pinned, top edge rising — the same direction the copy and the footer signature
  // travel, so the picture and the type are doing one gesture at two scales. `inset()` rather
  // than a polygon: identical shape, and the cheaper of the two to animate.
  const edge = useTransform(open, (v) => 100 - 100 * v);
  const clipPath = useMotionTemplate`inset(${edge}% 0% 0% 0%)`;

  // The clip lives on the frame and the scale on the layer inside it. Scaling the clipped element
  // instead would drag the clip line in with it, and a card at 96% would leave a strip of the one
  // behind it showing under its own bottom edge.
  const scale = useTransform(u, [index - 1, index + 1], [SCALE_MAX, SCALE_MIN]);

  const gray = useTransform(open, (v) => 1 - v);
  const lift = useTransform(open, (v) => 1 + (1 - v) * LIFT);
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
    stops.push(index + COPY_OUT + line * LINE_STEP, index + WIPE);
    y.push("125%", "0%");
  }

  if (index < LAST) {
    // Exits go as a block. A staggered one reads as the paragraph coming apart.
    stops.push(index + 1, index + 1 + COPY_OUT);
    y.push("0%", "-125%");
  } else {
    stops.push(COUNT);
    y.push("0%");
  }

  const scrubbed = useTransform(u, stops, y);

  const combined = useTransform([approach, u], ([a, position]: number[]) => {
    const arrived = ramp(a, FIRST_WORDS[0] + line * 0.05, FIRST_WORDS[1]);
    const left = ramp(position, 1, 1 + COPY_OUT);
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
    const filled = clamp01(v - index) * shapeAt(index, v);
    return `inset(0% 0% ${100 - 100 * filled}% 0%)`;
  });

  return (
    <motion.span className="stack-dots__station" style={{ height, y: offset }}>
      <span className="stack-dots__ring" />
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

  // The deck clock. One unit per project — everything on the deck reads from this.
  const u = useTransform(scrollYProgress, [0, 1], [0, COUNT]);

  // Which project owns the pointer. It flips when the outgoing block has cleared its mask, so the
  // clicks change hands exactly as the words do. Guarded by a ref rather than leaning on React's
  // bail-out: this runs on every scroll frame, and even a render that gets dropped costs
  // scheduling work in the middle of the one animation on the page that has no frames to spare.
  const current = useRef(0);
  const sync = (position: number) => {
    const next = Math.min(LAST, Math.max(0, Math.floor(position - COPY_OUT)));
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
      // The section's height is COUNT steps of scroll plus the one viewport the pin occupies;
      // handing the count to CSS keeps the two ends of that sum from drifting if a fourth
      // primary work is added.
      style={{ "--stack-count": COUNT } as React.CSSProperties}
    >
      <div className="stack__pin">
        <div className="stack__inner gutter measure">
          <div className="projects-title">
            <h2 className="projects-word display">
              {/* The J descends well below the baseline at this scale, so the clip carries a
                  little extra room under it and the word starts further down to match. */}
              <span className="stack__word-clip">
                <motion.span className="stack__word" style={{ y: wordY }}>
                  Projects
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
