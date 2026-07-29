"use client";

import { Fragment } from "react";
import Image from "next/image";
import { motion, type MotionProps } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import type { FeaturedWork } from "@/data/works";

/**
 * The two halves of a featured work — its media and its words — as pieces both landing layouts
 * share. The flat grid stacks them inside one link; the pinned stack scrubs them on separate
 * clocks. Keeping the markup here is what stops the two layouts drifting apart.
 */

/**
 * Frames are 16/10, because the stills are wide: the covers run 1.33 to 1.89, so any single ratio
 * has to crop something, and this is the one that takes the least from the set. A narrower frame
 * cut a quarter off the left and right of the two widest shots, which on a UI screenshot is the
 * interface itself.
 *
 * They sit greyscale until hovered (see .frame__media) — in the stack, until scrolled to.
 */
export function Cover({ work }: { work: FeaturedWork }) {
  // A dedicated still where one exists, else whatever the media itself can stand in with — a
  // video's poster frame, or, for a work whose media IS a still, that still.
  const still =
    work.media.kind === "video"
      ? work.cover ?? work.media.poster
      : work.media.kind === "image"
        ? work.cover ?? work.media.src
        : work.cover;

  if (work.media.kind === "poster") {
    return (
      <div className="plate" aria-hidden>
        <span className="plate__word">{work.media.word}</span>
        <span className="plate__caption">{work.media.caption}</span>
      </div>
    );
  }

  // No usable still (and not an intentional poster) — fall back to a typographic plate rather than a blank frame. Honest media, never an empty box.
  if (!still) {
    return (
      <div className="plate" aria-hidden>
        <span className="plate__word">{work.title}</span>
        <span className="plate__caption">{work.tagline ?? work.role}</span>
      </div>
    );
  }

  return (
    // Optimised, not raw. The two real covers are a 1.9MB and a 1.5MB PNG on disk, and shipped
    // as-is they were the landing page's single largest cost by a wide margin — enough that the
    // intro could not honestly wait for them.
    //
    // There is no wrapper to fight: with `fill`, next/image positions the image element itself
    // absolutely inside the nearest positioned ancestor, which is the .frame. So the crop still
    // comes from the frame's overflow and the hover transform still drives this element directly,
    // exactly as they did with a bare tag.
    //
    // `loading="eager"` because these are below the fold and would otherwise be lazy — and a lazy
    // image is one the intro can never see start, let alone finish. Next 16's guidance is to reach
    // for eager/fetchPriority here and reserve `preload` for the one true LCP image, which is the
    // hero portrait.
    <Image
      className="frame__media"
      src={still}
      alt={work.coverAlt ?? `${work.title} — project cover`}
      fill
      sizes="(max-width: 767px) 100vw, 52vw"
      loading="eager"
      draggable={false}
    />
  );
}

/**
 * The words: the title in the serif, a claim under it, the credit line, then the way in.
 *
 * The order is the read: what it is, what it does, what I was and when, where to go. The tech stack
 * used to sit at the foot of this block and is gone from it — it is a list of nouns competing with
 * the one line that asks for a click, and the case page already sets it in the opening context and
 * the How narrative.
 *
 * `lines` lets the pinned stack drive each of the four lines on its own scroll window, so they
 * cascade rather than moving as one slab. The flat grid passes nothing and the elements render
 * inert — a motion component with no animation props costs nothing.
 *
 * `clip` wraps each line in a masked edge so it can ride in and out from behind one, the way the
 * footer signature does. The wrapper goes outside the existing tag rather than inside it, so the
 * heading, the paragraphs and every class they carry are identical in both layouts.
 *
 * Each wrapper is named after the line it holds, because a clipped line has to hand its top margin
 * up to the wrapper: a translate is a percentage of the ELEMENT, so any margin left inside the clip
 * makes the clip taller than the thing riding in it and the ride can't clear the edge.
 */
export function WorkCopy({
  work,
  lines,
  clip = false,
  credit = true,
}: {
  work: FeaturedWork;
  /** Per-line motion props, in the order the rows below actually render — which is three long
      rather than four when `credit` is off. */
  lines?: MotionProps[];
  clip?: boolean;
  /** Whether the role/year line belongs in this column. The pinned deck sets it false and sets the
      same two facts on their side in the page's left margin instead (see StackCredit), where they
      read as the frame's caption rather than as a third line of the paragraph. The flat layout has
      no margin to put them in, so it keeps them here. */
  credit?: boolean;
}) {
  // Both branches have to carry the key, because both are returned into the same `.map()` below.
  // The unclipped one takes a Fragment purely to hold it: the flat layout's whole point is that its
  // rows sit directly in the card body with no wrapper of their own, and a Fragment keeps that true
  // while still giving React something to key. Keying only the clipped branch left the flat spread
  // warning on every load — and on EVERY viewport, since `useMediaQuery` reads false until
  // hydration, so the flat layout is what renders first even on a desktop that is about to swap to
  // the pinned deck.
  const wrap = (index: number, name: string, node: React.ReactNode) =>
    clip ? (
      <div key={index} className={`work-card__clip work-card__clip--${name}`}>
        {node}
      </div>
    ) : (
      <Fragment key={index}>{node}</Fragment>
    );

  // Built as a list rather than as four literals, because dropping the credit has to renumber
  // everything under it: `lines[2]` is the CTA's window in the deck and the credit's in the grid,
  // and a row taking its motion from a fixed index would quietly ride on its neighbour's clock.
  const rows: { name: string; render: (props?: MotionProps) => React.ReactNode }[] =
    [
      {
        name: "title",
        render: (props) => (
          <motion.h3 className="work-card__title editorial" {...props}>
            {work.title}
          </motion.h3>
        ),
      },
      {
        name: "desc",
        render: (props) => (
          <motion.p className="work-card__desc" {...props}>
            {work.description}
          </motion.p>
        ),
      },
      ...(credit
        ? [
            {
              name: "meta",
              render: (props?: MotionProps) => (
                <motion.p className="work-card__meta" {...props}>
                  {work.role} · {work.year}
                </motion.p>
              ),
            },
          ]
        : []),
      {
        name: "cta",
        // A cue, not a link: the whole card — frame and words together — is already one anchor, in
        // both layouts. So this is a <p> carrying the affordance, and the hover states it lights up
        // are driven from the anchor above it, exactly as the arrow always was.
        render: (props) => (
          <motion.p className="work-card__cta" {...props}>
            View case study
            <ArrowUpRight
              className="work-card__arrow"
              width="18"
              height="18"
              aria-hidden
            />
          </motion.p>
        ),
      },
    ];

  return <>{rows.map((row, i) => wrap(i, row.name, row.render(lines?.[i])))}</>;
}
