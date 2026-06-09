import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { SectionAurora } from "@/components/decor/SectionAurora";
// TEMP (layout rework): portrait disabled — re-enable by uncommenting this import + re-adding it
// to the hero cluster (it will need re-fitting to the new left-aligned layout).
// import { HeroPortrait } from "@/components/hero/HeroPortrait";
// The hero wordmark now lives in the layout-level <BrandMark/> (morphs into the nav on scroll),
// so the in-flow <HeroPratiushText/> is no longer rendered here.
import { HeroLede } from "@/components/hero/HeroLede";
// TEMP (layout rework): "See my works" CTA removed for now — re-add <WorksBadge/> to bring it back.
// import { WorksBadge } from "@/components/hero/WorksBadge";
// Signature Statement section removed — its copy ("I like turning early ideas into polished
// experiences people can use.") now lives as the hero tagline in HeroLede. Component file kept.
// import { SignatureStatement } from "@/components/statement/SignatureStatement";
import { FeaturedWorks } from "@/components/works/FeaturedWorks";

export default function Home() {
  return (
    <main className="page-v4 text-navy">
      {/* One continuous, slowly drifting warm field behind everything past the hero. */}
      <SectionAurora />
      <section className="hero-root-v3">
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
              TEMP (layout rework): portrait + "See my works" CTA removed for now — see imports.
              The old centered cqi composition (.hero-composition-v3 etc.) is superseded by this.
            */}
            <HeroLede />
            {/* One subtle right-side element: vertical scroll cue (also signposts the scroll-morph). */}
            <div className="hero-scroll-cue-v4" aria-hidden>
              <span className="hero-scroll-cue-v4__label">Scroll</span>
              <span className="hero-scroll-cue-v4__track">
                <span className="hero-scroll-cue-v4__thumb" />
              </span>
            </div>
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>

      <FeaturedWorks />

      <footer className="footer-v4" aria-hidden />
    </main>
  );
}
