"use client";

import { useRef } from "react";
import { cubicBezier, motion, useScroll, useTransform } from "motion/react";

import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroLede } from "@/components/hero/HeroLede";
import { useIntro } from "@/components/intro/IntroProvider";
import { SNAP_EASE } from "@/lib/intro";

/**
 * The landing is a pinned stage: the section sticks for ~1.2 extra viewports while the
 * opening composition transforms in place — copy dissolves, then the name itself is
 * pulled across the stage and lands as PROJECTS (see MorphName). The atmosphere (glow,
 * aurora, smoke, grain) holds underneath the whole move, so the morph happens inside the
 * composition rather than in empty space. One track-level progress drives everything.
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

  // The name morphs in place (left-anchored), so the light no longer chases it across the
  // stage. Instead the warm pool eases gently further left as the word lands, concentrating
  // over the lower-left PROJECTS so the settled title is lit rather than stranded in flat field.
  // Drifts with the (now later) morph: the thesis leads, then the name rolls into PROJECTS
  // (ROLL_START ≈ 0.30 → ROLL_END ≈ 0.65), so the warm pool eases left across that window to light
  // the lower-left PROJECTS as it lands.
  const glowX = useTransform(scrollYProgress, [0.3, 0.72], ["0vw", "-5vw"], {
    ease: cubicBezier(...SNAP_EASE),
  });

  return (
    <div ref={trackRef} className="hero-track-v4">
      <section
        className="hero-root-v3"
        data-backdrop={backdropIn ? "in" : "out"}
        data-foreground={foregroundIn ? "in" : "out"}
      >
        {/* The hero's warm field, feather-masked at the bottom so the section dissolves into
            the page's continuous aurora instead of cutting off on a hard seam. */}
        <div className="hero-field-v3" aria-hidden />
        <HeroAurora />
        <motion.div className="hero-glow-drift-v4" style={{ x: glowX }} aria-hidden>
          <RadialGlow />
        </motion.div>
        <div className="neon-bg-v3">
          <FluidSmoke
            color="#FFF4E6"
            className="fluid-smoke-v3"
            curl={1.5}
            splatForce={500}
            densityDissipation={0.2}
            velocityDissipation={0.35}
            dyeRadius={0.0022}
          />
        </div>
        <div className="canvas-v3 canvas-v3--hero">
          <div className="hero-stage-v3">
            <HeroLede progress={scrollYProgress} />
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>
    </div>
  );
}
