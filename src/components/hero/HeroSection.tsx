"use client";

import { useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";

import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroLede } from "@/components/hero/HeroLede";
import {
  DNA_CUE,
  GLOW_DRIFT,
  PERSONA_IN,
  PERSONA_OUT,
  RELEASE,
} from "@/components/hero/heroTimeline";
import { useIntro } from "@/components/intro/IntroProvider";
import { TechDNA } from "@/components/persona/TechDNA";
import { SNAP_EASE } from "@/lib/intro";
import { useScrubReveal } from "@/lib/reveal";

/**
 * The landing is a pinned stage: the section sticks while the opening composition transforms in
 * place — copy dissolves, then the name rolls PRATIUSH → PERSONA (the persona beat holds beside
 * the word: character note left, tech-DNA helix right) → PROJECTS (see MorphName + heroTimeline,
 * the shared beat sheet). The atmosphere (glow, aurora, smoke, grain) holds underneath the whole
 * chain, so every morph happens inside the composition rather than in empty space. One
 * track-level progress drives everything.
 *
 * The section still stamps the two intro gates as data attributes:
 *   • data-backdrop  — drives the decor BLOOM (glow / aurora / smoke / grain fade up).
 *   • data-foreground — gates the copy + name entrance and the scroll cue.
 */
export function HeroSection() {
  const { backdropIn, foregroundIn, reduce } = useIntro();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // SMOOTH PIN RELEASE (exitY). Through the chain the title is sticky-HELD — its screen velocity
  // is 0 — then the pin unpins and it scrolls at full speed. That 0 → full-speed STEP is what reads
  // as a jolt the instant the pin lets go. So the last beat of the pin (heroTimeline RELEASE, sized
  // to ~6vh of scroll) eases the title UP by a hair, VELOCITY-MATCHED: an ease-in ramp that starts
  // from rest (slope 0, matching the held state) and reaches scroll speed exactly at the unpin. It's
  // tiny and slope-matched, so it removes the jolt rather than reading as a visible lift; and it's
  // UPWARD, so it never trips the overflow:hidden bottom-edge clip that forbids a downward lag here.
  const RELEASE_LIFT = "-2.5vh";
  const titleLag = useTransform(scrollYProgress, [...RELEASE], ["0vh", RELEASE_LIFT], {
    ease: cubicBezier(0.4, 0, 1, 1),
  });

  // The name morphs in place (left-anchored), so the light never chases it across the stage.
  // The warm pool eases gently further left as the word lands as PROJECTS (heroTimeline
  // GLOW_DRIFT — timed to MORPH 2), concentrating over the settled lower-left title so it's lit
  // rather than stranded in flat field. It holds centred through the persona beat, lighting both
  // the held word and the DNA.
  const glowX = useTransform(scrollYProgress, [...GLOW_DRIFT], ["0vw", "-5vw"], {
    ease: cubicBezier(...SNAP_EASE),
  });

  // THE PERSONA BEAT'S RIGHT COLUMN — the tech-DNA helix, a layer of the pinned stage (not its own
  // section): it scrub-reveals in after MORPH 1 lands and clears before MORPH 2 rolls. The helix's
  // own draw-on is time-based (connect-the-dots, then it comes alive), so it's TRIGGERED (play)
  // just before the layer becomes visible rather than scrubbed.
  // The draw-on is CUED once the layer is essentially opaque (DNA_CUE sits near the end of
  // PERSONA_IN), so the connect-the-dots inking performs entirely in full view — cueing it during
  // the fade washed the draw out behind low opacity. Lazy init covers a mid-page mount that already
  // sits past the cue (scroll restoration); the change subscription covers the normal ride in.
  // Once true it never resets — the draw plays once.
  const [dnaPlay, setDnaPlay] = useState(() => scrollYProgress.get() >= DNA_CUE);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= DNA_CUE) setDnaPlay(true);
  });
  const dnaIn = useScrubReveal(scrollYProgress, PERSONA_IN, { y: 30, dir: "in" });
  const dnaOut = useScrubReveal(scrollYProgress, PERSONA_OUT, { y: -40, blur: 3, dir: "out" });

  return (
    <div ref={trackRef} className="hero-track-v4">
      <section
        className="hero-root-v3"
        data-backdrop={backdropIn ? "in" : "out"}
        data-foreground={foregroundIn ? "in" : "out"}
      >
        {/* No hero-specific base field — the page-wide SectionAurora shows through as the single
            continuous background. The hero only layers its warm atmosphere (aurora / glow / smoke /
            grain) on top, each feather-masked at the bottom so it dissolves into the scroll. */}
        <HeroAurora />
        <motion.div className="hero-glow-drift-v4" style={{ x: glowX }} aria-hidden>
          <RadialGlow />
        </motion.div>
        <div className="neon-bg-v3">
          <FluidSmoke
            color="#FFF4E6"
            className="fluid-smoke-v3"
            // Elegance pass — tuned for natural smoke over a smooth fluid blob:
            // • curl (vorticity) lifted 1.5 → 2.5 so the field grows fine curling tendrils/filaments
            //   like real smoke, while staying restrained (default is 8, which reads turbulent).
            curl={2.5}
            splatForce={500}
            // • Dye fades on roughly the motion's timescale so wisps disperse WHILE still drifting,
            //   never parking as a static cloud (the old 0.2 lingered ~10–15s and froze into a puff).
            densityDissipation={0.8}
            // • Velocity decays a touch slower (0.35 → 0.30) so the smoke keeps gently drifting and
            //   settles softly instead of stopping — and motion now outlasts the dye fade, so it
            //   always clears while in motion. Lower = drifts longer; higher = settles sooner.
            velocityDissipation={0.3}
            // • Finer dye radius (0.0022 → 0.0020) for more delicate wisps.
            dyeRadius={0.002}
          />
        </div>
        <div className="canvas-v3 canvas-v3--hero">
          <div className="hero-stage-v3">
            {/* The DNA sits in the hero's right-side void — the diagonal counterpoint to the
                lower-left word — BELOW the copy cluster in z. Outer wrapper carries the exit,
                inner the entrance, so the two scrubs compose instead of fighting. Reduced motion:
                no wrappers' motion (styles undefined) — TechDNA renders its static drawn pose. */}
            <motion.div
              className="hero-persona-dna-v4"
              style={reduce ? undefined : dnaOut}
              aria-hidden
            >
              <motion.div
                className="hero-persona-dna-v4__inner"
                style={reduce ? undefined : dnaIn}
              >
                <TechDNA play={dnaPlay} />
              </motion.div>
            </motion.div>
            <HeroLede progress={scrollYProgress} titleLag={titleLag} />
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>
    </div>
  );
}
