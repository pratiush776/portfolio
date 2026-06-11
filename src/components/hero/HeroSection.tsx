"use client";

import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroLede } from "@/components/hero/HeroLede";
import { useIntro } from "@/components/intro/IntroProvider";

/**
 * The hero shell. Lives as a client component purely so it can stamp the two intro gates onto
 * the section as data attributes:
 *   • data-backdrop  — drives the decor BLOOM (glow / aurora / smoke / grain fade up) in CSS.
 *   • data-foreground — gates the scroll-cue fade-in (the hero copy + wordmark read the gates
 *     directly via Motion).
 * Everything inside is the same composition as before; only the wrapper moved out of page.tsx.
 */
export function HeroSection() {
  const { backdropIn, foregroundIn } = useIntro();

  return (
    <section
      className="hero-root-v3"
      data-backdrop={backdropIn ? "in" : "out"}
      data-foreground={foregroundIn ? "in" : "out"}
    >
      <HeroAurora />
      <RadialGlow />
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
          {/*
            Left-aligned hero lockup (eyebrow → wordmark → tagline) with a bottom meta strip
            (credential label left / locator right). The wordmark is the layout-level
            <BrandMark/>; HeroLede reserves its slot and fades the intro on scroll.
          */}
          <HeroLede />
          {/* Minimal right-rail cue: a warm highlight travels down the stacked letters. */}
          <div className="hero-scroll-cue-v4" aria-hidden>
            <span className="hero-scroll-cue-v4__letter">S</span>
            <span className="hero-scroll-cue-v4__letter">C</span>
            <span className="hero-scroll-cue-v4__letter">R</span>
            <span className="hero-scroll-cue-v4__letter">O</span>
            <span className="hero-scroll-cue-v4__letter">L</span>
            <span className="hero-scroll-cue-v4__letter">L</span>
          </div>
        </div>
      </div>
      <div className="hero-grain-v3" aria-hidden />
    </section>
  );
}
