"use client";

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
 * Four lines, and the order is the read: what it is, what it does, what I was and when, where to
 * go. The tech stack used to sit at the foot of this block and is gone from it — it is a list of
 * nouns competing with the one line that asks for a click, and the case page already sets it
 * properly as chips (see .case__stack).
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
  /** Per-line motion props, in reading order: title, description, meta, cta. */
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
        <motion.h3 className="work-card__title editorial" {...lines?.[0]}>
          {work.title}
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
        "cta",
        // A cue, not a link: the whole card — frame and words together — is already one anchor, in
        // both layouts. So this is a <p> carrying the affordance, and the hover states it lights up
        // are driven from the anchor above it, exactly as the arrow always was.
        <motion.p className="work-card__cta" {...lines?.[3]}>
          <span className="work-card__cta-label">View case study</span>
          <ArrowUpRight
            className="work-card__arrow"
            width="18"
            height="18"
            aria-hidden
          />
        </motion.p>,
      )}
    </>
  );
}
