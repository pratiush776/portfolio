"use client";

import { memo } from "react";
import {
  cubicBezier,
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import type { Window } from "@/components/hero/heroTimeline";
import { INTRO_EASE } from "@/lib/intro";

/**
 * The site's SCROLL-INK paragraph: a body of copy that clarifies into focus word-by-word as the
 * reader scrolls through a window of the master progress. The text sits in its FINAL layout position
 * the whole time — every word is already set at a low ghost opacity, and each staggers up to full
 * opacity on the hard-landing INTRO_EASE. OPACITY ONLY: no blur (it muddied the type), no transform
 * (the paragraph never moves while revealing).
 *
 * A11Y — the words are aria-hidden decorative spans; a visually-hidden real <p> sibling carries the
 * sentence to assistive tech / SEO as ONE string (never read word-by-word or doubled) — HeroThesis's
 * pattern. Reduced motion renders the plain paragraph at full opacity, no scrub.
 *
 * The word spans are memoized on primitive props (text + window + the identity-stable `progress`), so
 * nothing re-renders on scroll — the values update through the compositor.
 */

// Granularity behind one constant — words today; a per-character split is a future option (split on
// "" instead of " " and rejoin runs), so the pacing math below stays token-agnostic.
const GRANULARITY = "word" as const;

// The floor a not-yet-revealed word sits at — a faint pencil guide (spec: 0.16–0.24), not invisible,
// so the paragraph's full shape is present before the reveal arrives.
const OPACITY_FLOOR = 0.2;

// Each word's reveal takes WORD_SPAN of the window; the starts spread over the remainder so
// consecutive words overlap heavily (the line washes on rather than ticking word-by-word).
const WORD_SPAN = 0.45;

const ease = cubicBezier(...INTRO_EASE);

const InkToken = memo(function InkToken({
  token,
  start,
  end,
  progress,
}: {
  token: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [start, end], [OPACITY_FLOOR, 1], {
    ease,
  });

  return (
    <motion.span className="scroll-ink-v4__word" style={{ opacity }} aria-hidden>
      {token}
    </motion.span>
  );
});

export function ScrollInk({
  text,
  progress,
  window: win,
}: {
  text: string;
  progress: MotionValue<number>;
  window: Window;
}) {
  const reduce = useReducedMotion() ?? false;

  // Reduced motion: the plain paragraph, fully inked, no scrub.
  if (reduce) {
    return <p className="scroll-ink-v4 scroll-ink-v4--static">{text}</p>;
  }

  const tokens =
    GRANULARITY === "word" ? text.split(/(\s+)/) : Array.from(text);
  const inkable = tokens.filter((t) => t.trim().length > 0).length;

  const [W0, W1] = win;
  const span = W1 - W0;
  const wipeDur = span * WORD_SPAN;
  const wipeStagger = inkable > 1 ? (span - wipeDur) / (inkable - 1) : 0;

  // Per-token stagger order, computed purely (only real words advance it; whitespace gets -1), so the
  // wipe walks reading order regardless of spacing — no render-time mutation.
  let seen = 0;
  const orders = tokens.map((token) =>
    token.trim().length === 0 ? -1 : seen++,
  );

  return (
    <>
      <p className="scroll-ink-v4" aria-hidden>
        {tokens.map((token, i) => {
          // Whitespace tokens stay static (they carry no ink of their own).
          if (orders[i] < 0) {
            return (
              <span key={i} className="scroll-ink-v4__space">
                {token}
              </span>
            );
          }
          const start = W0 + orders[i] * wipeStagger;
          return (
            <InkToken
              key={i}
              token={token}
              start={start}
              end={start + wipeDur}
              progress={progress}
            />
          );
        })}
      </p>
      {/* The real sentence, exposed once for AT/SEO — a SIBLING so the decorative spans never get
          read word-by-word or doubled (HeroThesis's a11y pattern). */}
      <p className="visually-hidden">{text}</p>
    </>
  );
}
