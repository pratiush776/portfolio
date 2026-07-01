"use client";

import { useRef } from "react";
import { motion, type MotionStyle, type MotionValue } from "motion/react";

import { MorphName } from "@/components/hero/MorphName";
import { useIntro } from "@/components/intro/IntroProvider";
import { BEAT, INTRO_EASE, type Beat } from "@/lib/intro";
import { useNavDissolveMask } from "@/lib/navDissolve";
import { useScrubReveal } from "@/lib/reveal";

/**
 * The left-aligned hero lockup: eyebrow → name → role → statement, plus the bottom-right
 * locator. The name is <MorphName/> — real text that the pinned hero transforms into
 * PROJECTS on scroll (the landing's one big move).
 *
 * Motion layers, kept on separate nodes so they compose instead of fighting:
 *  • ENTRANCE — each copy element rises on the shared FOREGROUND gate, keyed to the master
 *    schedule (BEAT), exactly as before.
 *  • EXIT — the COPY peels away on the SAME pinned-track progress that drives the morph, in a
 *    staggered top-down cascade (eyebrow first). The morph begins EARLY and OVERLAPS this exit
 *    (ROLL_START ≈ 0.08): the name starts rolling into PROJECTS while the copy is still clearing, a
 *    deliberate premium overlap. The name sits outside the exit wrappers so the copy departs around
 *    it — the morph is authored against the left anchor rather than two clocks drifting apart.
 */
const hidden = (beat: Beat) => ({ y: beat.y, opacity: 0 });
const shown = { y: 0, opacity: 1 } as const;

/* Staggered exit windows (fractions of the pinned track). The copy no longer disappears before
   the transition phrase is legible; its tail overlaps the thesis gate, then the morph takes over.
   Each peels away on the shared scrub reveal (fade + lift + a touch of blur). */
// Windows are in raw hero progress. The hero pin was shortened (see .hero-track-v4 / MorphName
// MORPH_SCALE), so these are stretched ~2.3× from their old values to keep the copy clearing over a
// similar SCROLL distance as the morph rolls (the morph now rolls over heroProgress ≈0.2–0.85).
const EXIT = {
  eyebrow: { window: [0.0, 0.16], lift: -54 },
  body: { window: [0.06, 0.42], lift: -44 },
  meta: { window: [0.1, 0.46], lift: -36 },
} as const;

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

  const eyebrowExit = useScrubReveal(progress, EXIT.eyebrow.window, { y: EXIT.eyebrow.lift, blur: 4, dir: "out" });
  const bodyExit = useScrubReveal(progress, EXIT.body.window, { y: EXIT.body.lift, blur: 4, dir: "out" });
  const metaExit = useScrubReveal(progress, EXIT.meta.window, { y: EXIT.meta.lift, blur: 4, dir: "out" });

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

      {/* The name — NOT inside an exit wrapper; it holds still as the copy peels away, then rides up
          with a parallax LAG (exitY) once the hero scrolls out, slower than the thesis. */}
      <MorphName progress={progress} exitY={titleLag} />

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

      {/* The thesis statement no longer lives in the pinned hero — it crests in as its OWN scrolling
          beat (<HeroThesisBeat/>, rendered after the hero in page.tsx) so its entrance is real
          document scroll rather than a scripted move inside the pin. */}
    </motion.div>
  );
}
