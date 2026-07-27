"use client";

import { motion, type MotionProps } from "motion/react";

import { ArrowUpRight } from "@/components/icons";
import type { FeaturedWork } from "@/data/works";

/**
 * The two halves of a featured work — its media and its words — as pieces both landing layouts
 * share. The flat grid stacks them inside one link; the pinned stack scrubs them on separate
 * clocks. Keeping the markup here is what stops the two layouts drifting apart.
 */

/**
 * Frames are 4/3: the stills are landscape product shots, and a square crop cuts them in half.
 * They sit greyscale until hovered (see .frame__media) — in the stack, until scrolled to.
 */
export function Cover({ work }: { work: FeaturedWork }) {
  // A dedicated still where one exists, else the video's own poster frame.
  const still =
    work.media.kind === "video" ? work.cover ?? work.media.poster : work.cover;

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
    // The frame crops via overflow:hidden and the hover transform drives this element
    // directly; next/image's wrapper fights both.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="frame__media"
      src={still}
      alt={work.coverAlt ?? `${work.title} — project cover`}
      draggable={false}
    />
  );
}

/**
 * The words: a claim, then two meta lines stepped so there is a clear next-read.
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
}: {
  work: FeaturedWork;
  /** Per-line motion props, in reading order: title, description, meta, stack. */
  lines?: MotionProps[];
  clip?: boolean;
}) {
  const wrap = (index: number, name: string, node: React.ReactNode) =>
    clip ? (
      <div key={index} className={`work-card__clip work-card__clip--${name}`}>
        {node}
      </div>
    ) : (
      node
    );

  return (
    <>
      {wrap(
        0,
        "title",
        <motion.h3 className="work-card__title h2" {...lines?.[0]}>
          <span className="underline-link">{work.title}</span>
          <ArrowUpRight
            className="work-card__arrow"
            width="22"
            height="22"
            aria-hidden
          />
        </motion.h3>,
      )}
      {wrap(
        1,
        "desc",
        <motion.p className="work-card__desc" {...lines?.[1]}>
          {work.description}
        </motion.p>,
      )}
      {wrap(
        2,
        "meta",
        <motion.p className="work-card__meta" {...lines?.[2]}>
          {work.role} · {work.year}
        </motion.p>,
      )}
      {wrap(
        3,
        "stack",
        <motion.p className="work-card__stack" {...lines?.[3]}>
          {work.stack.slice(0, 3).join(" · ")}
        </motion.p>,
      )}
    </>
  );
}
