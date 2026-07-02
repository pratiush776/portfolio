"use client";

import { useRef } from "react";
import {
  cubicBezier,
  motion,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";

import {
  HERO_EXIT,
  PERSONA_IN,
  PERSONA_OUT,
  THESIS_IN,
} from "@/components/hero/heroTimeline";
import { HeroThesis } from "@/components/hero/HeroThesis";
import { MorphName } from "@/components/hero/MorphName";
import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE, type Beat } from "@/lib/intro";
import { useNavDissolveMask } from "@/lib/navDissolve";
import { useScrubReveal } from "@/lib/reveal";

/**
 * The left-aligned hero lockup: eyebrow → name → role → statement, plus the bottom-right
 * locator. The name is <MorphName/> — real text that the pinned hero rolls through the landing's
 * whole chain (PRATIUSH → PERSONA → PROJECTS, scheduled on heroTimeline).
 *
 * Motion layers, kept on separate nodes so they compose instead of fighting:
 *  • ENTRANCE — each copy element rises on the shared FOREGROUND gate, keyed to the master
 *    schedule (BEAT), exactly as before.
 *  • EXIT — the COPY peels away on the SAME pinned-track progress that drives the morphs, in a
 *    staggered top-down cascade (eyebrow first). MORPH 1 begins early and OVERLAPS this exit: the
 *    name starts rolling into PERSONA while the copy is still clearing, a deliberate premium
 *    overlap. The name sits outside the exit wrappers so the copy departs around it.
 *  • PERSONA NOTE — the character note fades into the SLOT the role/tagline vacated (the two share
 *    one grid cell, .hero-swap-v4) during the persona beat, then clears before MORPH 2.
 */
const hidden = (beat: Beat) => ({ y: beat.y, opacity: 0 });
const shown = { y: 0, opacity: 1 } as const;

export function HeroLede({
  progress,
  titleLag,
}: {
  progress: MotionValue<number>;
  titleLag: MotionValue<string>;
}) {
  const { foregroundIn, reduce } = useIntro();

  // EXIT DISSOLVE — owned here at the CLUSTER level so the whole lockup (the "Featured" eyebrow + the
  // landed PROJECTS word + any copy still in frame) melts into the fixed band just below the nav as a
  // SINGLE unit, the same viewport-anchored top feather the thesis uses. Reading the cluster's real top
  // each frame keeps the band pinned at the nav line through the pin AND the exit (the static CSS mask
  // only stayed anchored while pinned, which let the unpinning title wipe/​hard-cut under the nav).
  const clusterRef = useRef<HTMLDivElement>(null);
  const dissolveMask = useNavDissolveMask(clusterRef);

  const eyebrowExit = useScrubReveal(progress, HERO_EXIT.eyebrow.window, {
    y: HERO_EXIT.eyebrow.lift,
    blur: 4,
    dir: "out",
  });
  const bodyExit = useScrubReveal(progress, HERO_EXIT.body.window, {
    y: HERO_EXIT.body.lift,
    blur: 4,
    dir: "out",
  });
  const metaExit = useScrubReveal(progress, HERO_EXIT.meta.window, {
    y: HERO_EXIT.meta.lift,
    blur: 4,
    dir: "out",
  });

  // The persona note's own beat: in under MORPH 1's settling letters, out into MORPH 2's wind-up
  // (heroTimeline). Entrance on the inner node, exit on the outer, so the two scrubs compose.
  const noteIn = useScrubReveal(progress, PERSONA_IN, { y: 28, blur: 3, dir: "in" });
  const noteOut = useScrubReveal(progress, PERSONA_OUT, { y: -36, blur: 4, dir: "out" });

  // The thesis layer's small crest — a gentle rise under the per-word ink wash (HeroThesis owns the
  // wipe itself), so the statement still arrives from below without the old full viewport travel.
  const thesisRise = useTransform(progress, [...THESIS_IN], ["6vh", "0vh"], {
    ease: cubicBezier(...INTRO_EASE),
  });

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
    <motion.div
      ref={clusterRef}
      className="hero-cluster-v4"
      style={
        reduce
          ? undefined
          : ({ WebkitMaskImage: dissolveMask, maskImage: dissolveMask } as MotionStyle)
      }
    >
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

      {/* The name — NOT inside an exit wrapper; it holds still (pinned at its place) through the
          whole chain as the copy and the persona beat come and go around it, then rides up on the
          release ramp (exitY) once the pin lets go. */}
      <MorphName progress={progress} exitY={titleLag} />

      {/* The role/tagline block and the persona character note occupy the SAME slot under the name
          at different beats: the copy (in flow — it alone sizes the slot, keeping the name's
          resting position untouched) peels away, then the note fades in overlaid where it stood.
          Under reduced motion the note re-enters flow and reads after the tagline (see CSS). */}
      <div className="hero-swap-v4">
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

        {/* The persona beat's voice — the user's own words (grammar-fixed only), in the same
            editorial serif as the tagline it replaces, so the beat reads as the lockup speaking. */}
        <motion.div className="hero-swap-v4__note" style={reduce ? undefined : noteOut}>
          <motion.div style={reduce ? undefined : noteIn}>
            <p className="hero-persona-note-v4">
              A curious person, hungry for growth and driven by intellect. A resilient
              individual, ready to face problems never seen before and persevere through them
              intellectually.
            </p>
          </motion.div>
        </motion.div>
      </div>

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

      {/* The thesis — a layer of the pinned stage (upper-right, the diagonal counterpoint to the
          lower-left word): it inks in per-word AS the word lands as PROJECTS (heroTimeline
          THESIS_IN), then RESTS beside it as the composed projects frame and rides out with the
          whole stage at the unpin. Inside the cluster so it shares the nav dissolve feather. */}
      <div className="hero-thesis-layer-v4">
        <motion.div style={reduce ? undefined : { y: thesisRise }}>
          <HeroThesis progress={progress} />
        </motion.div>
      </div>
    </motion.div>
  );
}
