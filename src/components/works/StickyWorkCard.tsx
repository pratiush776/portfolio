"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import type { Work } from "@/data/works";

/**
 * One card in the stacking gallery. Every card is a CENTERED card that shares the same
 * sticky `top`, so as you scroll each card rises and pins ON TOP of the previous one — they
 * pile up (true stack, not a slide-and-replace). Faithful to Skiper34 / StickyCard_003:
 * covered cards shrink + tilt slightly and peek out behind the top card (a layered deck);
 * the image counter-rotates so the photo stays visually level while the frame tilts.
 *
 * Everything is driven off ONE section-level scroll progress (`progress`, a MotionValue in
 * 0..1 from FeaturedWorks' useScroll). This is deterministic — no inView/margin gating — so
 * the recede and caption cross-fade always run. Mechanics: v4-handbook/featured-works/01.
 *
 * - `start = index / total`, `end = (index + 1) / total` — this card's "active" window.
 * - recede = progress mapped from `end`→1, so earlier cards (longer span) recede further →
 *   the deck layers. The last card never recedes; it pins and stays on top.
 * - caption opacity is tied to progress so only the active (top) card's caption shows.
 */
export function StickyWorkCard({
  work,
  index,
  total,
  progress,
}: {
  work: Work;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const isLast = index === total - 1;

  const start = index / total;
  const end = (index + 1) / total;
  const span = 1 / total;

  // A card holds (full, readable) for the first part of its stage; then the NEXT card rises
  // and covers it over [coverStart, end]. The recede (shrink + tilt) is mapped across that
  // SAME window, so the rotate and the incoming card move TOGETHER, then the card holds its
  // receded angle. Each card settles one step deeper per card stacked on top → a persistent
  // fanned deck (faithful to Skiper34). The last card is never covered, so it never recedes.
  const coverStart = start + 0.55 * span;
  const stepsOnTop = total - 1 - index;
  const scaleMv = useTransform(progress, [coverStart, end], [1, 1 - 0.045 * stepsOnTop]);
  const rotateMv = useTransform(progress, [coverStart, end], [0, -4 * stepsOnTop]);
  const counterRotateMv = useTransform(rotateMv, (v) => -v);

  // Caption fades in on arrival, holds through the read window, then fades out as the card is
  // covered (same window as the recede). The last card never gets covered → its caption stays.
  const captionInput = isLast
    ? [start, start + 0.08 * span]
    : [start, start + 0.08 * span, coverStart, end];
  const captionOutput = isLast ? [0, 1] : [0, 1, 1, 0];
  const textOpacityMv = useTransform(progress, captionInput, captionOutput);

  const cardStyle = reduce || isLast ? undefined : { scale: scaleMv, rotate: rotateMv };
  const imgStyle = reduce || isLast ? undefined : { rotate: counterRotateMv };
  const captionStyle = reduce ? undefined : { opacity: textOpacityMv };

  return (
    <div className="work-card-v4" style={{ zIndex: index }}>
      <motion.div className="work-card-v4__card" style={cardStyle}>
        <motion.div className="work-card-v4__img-wrap" style={imgStyle}>
          <Image
            src={work.image}
            alt={work.alt ?? work.title}
            fill
            sizes="(max-width: 1100px) 100vw, 60rem"
            className="work-card-v4__img"
            priority={index === 0}
          />
        </motion.div>

        <div className="work-card-v4__scrim" aria-hidden />

        <motion.div className="work-card-v4__caption" style={captionStyle}>
          <span className="work-card-v4__index">
            {String(index + 1).padStart(2, "0")} — {String(total).padStart(2, "0")}
          </span>
          <h3 className="work-card-v4__name">{work.title}</h3>
          <p className="work-card-v4__meta">
            {work.category} · {work.year}
          </p>
          <p className="work-card-v4__desc">{work.description}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
