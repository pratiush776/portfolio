"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/**
 * The thesis — the page's quiet pinned moment, placed AFTER the work so it reads as a
 * conclusion, not a promise. No label, no eyebrow: the statement is the section. The
 * viewport holds while the words scrub from faint to full ink, so the reader sets the
 * pace. Built on CSS sticky + one section-level `useScroll` (plays nice with Lenis).
 *
 * Copy is deliberately short (a manifesto, not a bio); accents carry the terracotta.
 */
type Segment = { text: string; accent?: boolean };

const SEGMENTS: Segment[] = [
  { text: "Most software works. Less of it feels" },
  { text: "considered.", accent: true },
  { text: "I build the second kind." },
];

type WordToken = { word: string; accent: boolean };

const TOKENS: WordToken[] = SEGMENTS.flatMap(({ text, accent }) =>
  text.split(" ").map((word) => ({ word, accent: accent ?? false })),
);

/** Scrub finishes at 78% of the section so the settled line holds a beat before release. */
const SCRUB_END = 0.78;

function Word({
  token,
  index,
  total,
  progress,
}: {
  token: WordToken;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = (index / total) * SCRUB_END;
  const end = ((index + 1) / total) * SCRUB_END;
  const opacity = useTransform(progress, [start, end], [0.14, 1]);

  return (
    <motion.span
      className={
        token.accent ? "manifesto-v4__word manifesto-v4__word--accent" : "manifesto-v4__word"
      }
      style={{ opacity }}
    >
      {token.word}{" "}
    </motion.span>
  );
}

/* Split from ScrollManifesto so useScroll only ever runs with its target ref mounted. */
function ScrubbedManifesto() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="manifesto-v4" aria-label="What I believe about software">
      {/* The tall track buys the scroll distance; the sticky stage holds the copy. */}
      <div ref={trackRef} className="manifesto-v4__track">
        <div className="manifesto-v4__stage">
          <p className="manifesto-v4__copy">
            {TOKENS.map((token, i) => (
              <Word
                key={i}
                token={token}
                index={i}
                total={TOKENS.length}
                progress={scrollYProgress}
              />
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ScrollManifesto() {
  const reduce = useReducedMotion();

  // Reduced motion: no pin, no scrub — the statement is simply a paragraph.
  if (reduce) {
    return (
      <section
        className="manifesto-v4 manifesto-v4--static"
        aria-label="What I believe about software"
      >
        <p className="manifesto-v4__copy">
          {SEGMENTS.map(({ text, accent }, i) => (
            <span key={i} className={accent ? "manifesto-v4__word--accent" : undefined}>
              {text}{" "}
            </span>
          ))}
        </p>
      </section>
    );
  }

  return <ScrubbedManifesto />;
}
