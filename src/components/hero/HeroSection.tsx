"use client";

import { useRef } from "react";
import { cubicBezier, motion, useScroll, useTransform } from "motion/react";

import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroLede } from "@/components/hero/HeroLede";
import { GLOW_DRIFT, GLOW_PERSONA, RELEASE } from "@/components/hero/heroTimeline";
import { useIntro } from "@/components/intro/IntroProvider";
import { TechDNA } from "@/components/persona/TechDNA";
import { SNAP_EASE } from "@/lib/intro";

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
  const { backdropIn, foregroundIn } = useIntro();
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

  // The name morphs in place (left-anchored), so the light never chases it across the stage — but
  // the warm pool DOES move with the narrative, in two eased sweeps with a flat rest between:
  //   1. GLOW_PERSONA — it eases RIGHT (→ 7vw) to sit BETWEEN the note (left) and the enlarged
  //      helix (right) through the persona beat, heating the cold middle band and bridging the two
  //      halves into one composition.
  //   2. hold — it RESTS at 7vw from GLOW_PERSONA[1] to GLOW_DRIFT[0] (identity ease on that flat
  //      segment so the value doesn't drift).
  //   3. GLOW_DRIFT — it sweeps back LEFT (→ −5vw) as the word lands as PROJECTS, concentrating
  //      over the settled lower-left title so it's lit rather than stranded in flat field.
  // A per-segment ease array (snap / hold / snap) drives one keyframed transform over both windows.
  // (Sanity: GLOW_PERSONA[1] < GLOW_DRIFT[0], so the keyframe inputs are strictly increasing.)
  const snap = cubicBezier(...SNAP_EASE);
  const hold = (v: number) => v; // identity — the flat middle rest segment
  const glowX = useTransform(
    scrollYProgress,
    [GLOW_PERSONA[0], GLOW_PERSONA[1], GLOW_DRIFT[0], GLOW_DRIFT[1]],
    ["0vw", "7vw", "7vw", "-5vw"],
    { ease: [snap, hold, snap] },
  );

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
            {/* The DNA is a PERMANENT fixture of the pinned stage — the diagonal counterpoint to
                the lower-left word, in the right-side void, BELOW the copy cluster in z. It's no
                longer faded in/out with the persona beat: TechDNA reads the hero gates itself and
                inks its bare SKELETON on during the intro, then the icons FLOW THROUGH it (pouring
                in / draining off the base) and it dims to a watermark, all keyed off `progress`. */}
            <div className="hero-persona-dna-v4" aria-hidden>
              <TechDNA progress={scrollYProgress} />
            </div>
            <HeroLede progress={scrollYProgress} titleLag={titleLag} />
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>
    </div>
  );
}
