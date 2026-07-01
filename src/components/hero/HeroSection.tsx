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
 * The landing is a pinned stage: the section sticks for ~0.8 extra viewports while the
 * opening composition transforms in place — copy dissolves, then the name itself rolls
 * in place, holding its left anchor, and lands as PROJECTS (see MorphName). The atmosphere (glow,
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

  // SMOOTH PIN RELEASE (exitY). Through the morph the title is sticky-HELD — its screen velocity is 0 —
  // then the pin unpins and it scrolls at full speed. That 0 → full-speed STEP is what reads as a jolt
  // ("abrupt") the instant the roll settles. The post-landing window (morph lands ≈0.85, pin ends at
  // 1.0) is otherwise a FROZEN hold, which only makes the jump more obvious.
  //
  // So we spend that window easing the title UP by a hair, VELOCITY-MATCHED: an ease-in ramp that starts
  // from rest (slope 0, matching the held state) and reaches scroll speed exactly at the unpin, so the
  // title is already moving at 1:1 when the pin lets go — the handoff is continuous, no step. It's tiny
  // (~RELEASE_LIFT) and slope-matched, so it removes the jolt rather than reading as a visible lift; and
  // it's UPWARD, so it never trips the overflow:hidden bottom-edge clip that forbids a downward lag here.
  // Tune RELEASE_LIFT by eye: too little and a faint step remains; too much and the pre-roll gets visible.
  const RELEASE_LIFT = "-2.5vh";
  const titleLag = useTransform(scrollYProgress, [0.85, 1], ["0vh", RELEASE_LIFT], {
    ease: cubicBezier(0.4, 0, 1, 1),
  });

  // The name morphs in place (left-anchored), so the light no longer chases it across the
  // stage. Instead the warm pool eases gently further left as the word lands, concentrating
  // over the lower-left PROJECTS so the settled title is lit rather than stranded in flat field.
  // Drifts with the morph: the name rolls into PROJECTS across ROLL_START ≈ 0.08 → ROLL_END ≈ 0.33
  // (running as the copy exits and the thesis writes on), so the warm pool eases left over that same
  // window to light the lower-left PROJECTS as it lands.
  // Eases the warm pool LEFT as the word lands as PROJECTS. The pin is now short and the morph lands
  // near heroProgress ≈0.85 (MorphName MORPH_SCALE), so this window is pushed later to land the glow
  // move WITH the word rather than well before it.
  const glowX = useTransform(scrollYProgress, [0.3, 0.85], ["0vw", "-5vw"], {
    ease: cubicBezier(...SNAP_EASE),
  });

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
            <HeroLede progress={scrollYProgress} titleLag={titleLag} />
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>
    </div>
  );
}
