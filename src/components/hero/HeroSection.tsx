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

  // The cue dies the moment the reader obeys it.
  const cueFade = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // The same gravity that takes the name drags the light with it: the warm pool slides
  // from the upper-left toward the landing zone, so the settled PROJECTS frame is lit
  // instead of stranded in a flat field.
  const glowX = useTransform(scrollYProgress, [0.14, 0.78], ["0vw", "36vw"], {
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
            {/* Minimal right-rail cue: a warm highlight travels down the stacked letters.
                The outer node keeps the CSS entrance gate; the inner one carries the
                scroll-out fade — separate nodes, so the opacities compose. */}
            <div className="hero-scroll-cue-v4" aria-hidden>
              <motion.div className="hero-scroll-cue-v4__inner" style={{ opacity: cueFade }}>
                <span className="hero-scroll-cue-v4__letter">S</span>
                <span className="hero-scroll-cue-v4__letter">C</span>
                <span className="hero-scroll-cue-v4__letter">R</span>
                <span className="hero-scroll-cue-v4__letter">O</span>
                <span className="hero-scroll-cue-v4__letter">L</span>
                <span className="hero-scroll-cue-v4__letter">L</span>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>
    </div>
  );
}
