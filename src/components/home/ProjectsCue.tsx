"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { featured } from "@/data/works";

/**
 * PR( ◼ )JECTS — the work section's heading. The O is a square slot holding the project
 * stills, cross-fading one into the next, bracketed by two parens.
 *
 * It sits at full display scale, the same as the hero name, and the hero is deliberately
 * short of the fold so this word crops against the viewport edge — the half-word is the
 * invitation to scroll, which is why no separate cue is needed.
 *
 * The heading carries the accessible name; everything inside it is decorative.
 */
const STILL_MS = 1200;

/** The photographed still for each work, or its video's poster. Poster-kind works have
    neither and drop out. */
const STILLS = featured
  .map((work) =>
    work.media.kind === "video" ? work.cover ?? work.media.poster : work.cover,
  )
  .filter((src): src is string => Boolean(src));

export function ProjectsCue() {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || STILLS.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % STILLS.length),
      STILL_MS,
    );
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <h2 className="projects-cue display" aria-label="Projects">
      <span aria-hidden>PR</span>

      <span className="projects-cue__paren--open" aria-hidden>
        )
      </span>

      <span className="projects-cue__slot" aria-hidden>
        {STILLS.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            className="projects-cue__still"
            data-active={i === index}
            src={src}
            alt=""
            draggable={false}
          />
        ))}
      </span>

      <span aria-hidden>)</span>

      <span aria-hidden>JECTS</span>
    </h2>
  );
}
