import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { HeroAurora } from "@/components/decor/HeroAurora";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { SectionAurora } from "@/components/decor/SectionAurora";
// TEMP (layout rework): portrait disabled — re-enable by uncommenting this import + its usage below.
// import { HeroPortrait } from "@/components/hero/HeroPortrait";
import { HeroPratiushText } from "@/components/hero/HeroPratiushText";
import { WorksBadge } from "@/components/hero/WorksBadge";
import { LocationPin } from "@/components/icons";
import { SignatureStatement } from "@/components/statement/SignatureStatement";
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
            <div className="hero-composition-v3">
              <p className="hero-greeting-v3">Hi, I&apos;M</p>
              {/*
                TEMP (layout rework): portrait disabled.
                <HeroPortrait /> = the cursor-parallax photo composition that sat between the
                greeting and the PRATIUSH wordmark — one image (no second copy) split into two
                independent parallax layers: a warm disc behind (hero-portrait-disc) and the
                masked figure in front (hero-portrait-figure), each drifting at a different rate
                so the figure passes THROUGH the disc with real depth. Desktop/fine-pointer only,
                off under reduced-motion. Positioned via .hero-pratiush-photo-v3 in globals.css.
                Re-enable: uncomment the import above + the line below.
              */}
              {/* <HeroPortrait /> */}
              <HeroPratiushText />
              <ul className="hero-domains-v3" aria-label="Roles">
                <li className="hero-domain-v3">Software Engineer</li>
                <li className="hero-domain-v3">UI/UX Designer</li>
              </ul>
              <WorksBadge />
              <span className="hero-locator-v3" aria-label="Based in USA">
                <LocationPin aria-hidden />
                <span>Based in USA</span>
              </span>
            </div>
          </div>
        </div>
        <div className="hero-grain-v3" aria-hidden />
      </section>

      <SignatureStatement />
      <FeaturedWorks />

      <footer className="footer-v4" aria-hidden />
    </main>
  );
}
