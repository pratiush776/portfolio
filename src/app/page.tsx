import { CloudDeck } from "@/components/decor/CloudDeck";
import { DuotoneFilter } from "@/components/decor/DuotoneFilter";
import { FluidSmoke } from "@/components/decor/FluidSmoke";
import { MeshGrain } from "@/components/decor/MeshGrain";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroPhoto } from "@/components/hero/HeroPhoto";
import { HeroPratiushText } from "@/components/hero/HeroPratiushText";
import { WorksBadge } from "@/components/hero/WorksBadge";
import { LocationPin } from "@/components/icons";
import { PortraitScrollChoreography } from "@/components/landing/PortraitScrollChoreography";
import { RecentWorks } from "@/components/landing/RecentWorks";
import { SkillsSection } from "@/components/landing/SkillsSection";
import { NavThemeObserver } from "@/components/layout/NavThemeObserver";

export default function Home() {
  return (
    <main className="landing-root-v3 text-navy w-[100vw] overflow-x-hidden">
      <DuotoneFilter />
      <div className="landing-stage-v3">
        <div className="landing-bg-v3" aria-hidden>
          <RadialGlow />
          <div className="neon-bg-v3">
            <FluidSmoke
              color="#3D3A36"
              className="fluid-smoke-v3"
              dyeRadius={0.007}
              splatForce={950}
              densityDissipation={0.45}
              velocityDissipation={0.7}
              curl={5}
            />
          </div>
        </div>
        {/* The "sky" — viewport-FIXED layers driven by PortraitScrollChoreography
            so they NEVER scroll with a box (no purple/cloud slide). The twilight
            surface (base + mesh/grain/vignette + keylight) fades in on --sky as
            the clouds condense it, holds through the pin, then fades out on exit.
            The clouds sit just above it. Both desktop-only (mesh/clouds gate
            themselves; the surface is hidden < 1100px, where the section paints
            its own static twilight). z: surface (1) < clouds (2) < skills
            content (3) < hero + portrait (5). */}
        <div className="skills-sky-surface-v3" aria-hidden>
          <MeshGrain variant="twilight" className="skills-sky-mesh-v3" />
          <div className="skills-spotlight-v3" />
        </div>
        <CloudDeck className="cloud-deck-v3" />
        <section className="hero-root-v3">
        <div className="canvas-v3 canvas-v3--hero">
          <div className="hero-stage-v3">
            <div className="hero-composition-v3">
              <p className="hero-greeting-v3">Hi, I&apos;M</p>
              <div className="hero-pratiush-photo-v3">
                <HeroPhoto />
              </div>
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
        </section>
        <SkillsSection />
        <RecentWorks />
        <PortraitScrollChoreography />
        <NavThemeObserver />
      </div>
    </main>
  );
}
