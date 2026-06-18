"use client";

import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";

import { HeroThesis } from "@/components/hero/HeroThesis";
import { MorphName } from "@/components/hero/MorphName";
import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE, type Beat } from "@/lib/intro";

/**
 * The left-aligned hero lockup: eyebrow → name → role → statement, plus the bottom-right
 * locator. The name is <MorphName/> — real text that the pinned hero transforms into
 * PROJECTS on scroll (the landing's one big move).
 *
 * Motion layers, kept on separate nodes so they compose instead of fighting:
 *  • ENTRANCE — each copy element rises on the shared FOREGROUND gate, keyed to the master
 *    schedule (BEAT), exactly as before.
 *  • EXIT — the COPY peels away on the SAME pinned-track progress that drives the morph, in a
 *    staggered top-down cascade (eyebrow first), each group lifting + blurring + fading out and
 *    fully CLEARING before the name starts to morph (< ROLL_START 0.14). The name is deliberately
 *    outside the wrappers: it holds dead still as the lockup departs around it, so the move reads
 *    as authored against the anchor rather than two clocks drifting apart.
 */
const hidden = (beat: Beat) => ({ y: beat.y, opacity: 0 });
const shown = { y: 0, opacity: 1 } as const;

const exitEase = cubicBezier(...INTRO_EASE);

/* Staggered exit windows (fractions of the pinned track). The peel runs from the first scroll and
   hands straight into the morph (ROLL_START ≈ 0.08) — the tails overlap the leading letters by
   design, so motion is continuous rather than copy-clears-then-name-moves with a dead beat. */
const EXIT = {
  eyebrow: { start: 0.0, end: 0.05, lift: -64 },
  body: { start: 0.015, end: 0.09, lift: -52 },
  meta: { start: 0.03, end: 0.11, lift: -44 },
} as const;

function useExit(
  progress: MotionValue<number>,
  { start, end, lift }: { start: number; end: number; lift: number },
) {
  const opacity = useTransform(progress, [start, end], [1, 0], { ease: exitEase });
  const y = useTransform(progress, [start, end], [0, lift], { ease: exitEase });
  const filter = useTransform(
    progress,
    [start, end],
    ["blur(0px)", "blur(6px)"],
    { ease: exitEase },
  );
  return { opacity, y, filter };
}

export function HeroLede({ progress }: { progress: MotionValue<number> }) {
  const { foregroundIn, reduce } = useIntro();

  const eyebrowExit = useExit(progress, EXIT.eyebrow);
  const bodyExit = useExit(progress, EXIT.body);
  const metaExit = useExit(progress, EXIT.meta);

  // One entrance recipe for every copy element: rise + fade on the foreground gate, on the
  // shared schedule. Reduced motion settles to the final state with no transform/transition.
  const entrance = (beat: Beat) => ({
    initial: reduce ? false : hidden(beat),
    animate: reduce ? shown : foregroundIn ? shown : hidden(beat),
    transition: reduce
      ? { duration: 0 }
      : { duration: beat.duration, ease: INTRO_EASE, delay: beat.delay },
  });

  return (
    <div className="hero-cluster-v4">
      {/* The page's real heading for a11y/SEO — the visible name is decorative text. */}
      <h1 className="visually-hidden">
        Pratiush — Software Engineer, Product &amp; Design
      </h1>

      <motion.div className="hero-exit-v4" style={reduce ? undefined : eyebrowExit}>
        <motion.p
          className="hero-eyebrow-v4"
          aria-hidden
          {...entrance(BEAT.eyebrow)}
        >
          Hi, I&apos;m
        </motion.p>
      </motion.div>

      {/* The name — NOT inside an exit wrapper; it holds dead still as the copy peels away. */}
      <MorphName progress={progress} />

      <motion.div className="hero-exit-v4" style={reduce ? undefined : bodyExit}>
        {/* Role — the credential, set directly beneath the name so it qualifies it at a glance. */}
        <motion.p className="hero-roles-v4" {...entrance(BEAT.roles)}>
          Software Engineer · Product &amp; Design
        </motion.p>

        {/* The serif statement closes the lockup — the lingering, personal voice note. */}
        <motion.p className="hero-tagline-v4" {...entrance(BEAT.tagline)}>
          <span className="hero-tagline-v4__line">Good products feel obvious.</span>
          <span className="hero-tagline-v4__line">Getting there isn&apos;t.</span>
        </motion.p>
      </motion.div>

      {/* The locator is absolutely positioned, so it rides its own full-inset exit wrapper
          (a transformed wrapper becomes the containing block — this keeps its coordinates
          anchored to the cluster, not to the copy column). */}
      <motion.div className="hero-exit-abs-v4" style={reduce ? undefined : metaExit}>
        <motion.span
          className="hero-meta-v4"
          aria-label="Based in USA"
          {...entrance(BEAT.meta)}
        >
          <span>Based in USA</span>
        </motion.span>
      </motion.div>

      {/* The line that frames the work, anchored upper-left — a diagonal thirds composition with
          the landed PROJECTS (mid-right), leaving the lower band free for the first work panel to
          crest into. It inks in as the name brakes into PROJECTS. Only on the morph path: reduced
          motion keeps the name as PRATIUSH, so there is no landed frame to caption. */}
      {!reduce && <HeroThesis progress={progress} />}
    </div>
  );
}
