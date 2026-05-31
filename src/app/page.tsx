import { FluidSmoke } from "@/components/decor/FluidSmoke";
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
      <div className="landing-stage-v3">
        <div className="landing-bg-v3" aria-hidden>
          <RadialGlow />
          <div className="neon-bg-v3">
            <FluidSmoke
              color="#3D3A36"
              className="fluid-smoke-v3"
              dyeRadius={0.003}
              splatForce={950}
              densityDissipation={0.85}
              velocityDissipation={1.3}
              curl={5}
            />
          </div>
        </div>
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
