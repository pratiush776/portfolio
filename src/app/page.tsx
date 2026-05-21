import About from "@/components/About";
import Contact from "@/components/Contact";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import { RadialGlow } from "@/components/decor/RadialGlow";
import { HeroPhoto } from "@/components/hero/HeroPhoto";
import { HeroPratiushText } from "@/components/hero/HeroPratiushText";
import { WorksBadge } from "@/components/hero/WorksBadge";
import { LocationPin } from "@/components/icons";
import StackingComp from "@/ui/stackingComp";

export default function Home() {
  return (
    <main className="box-border text-navy bg-beige snap-y snap-mandatory max-h-[100svh] scroll-smooth overflow-y-scroll w-[100vw] overflow-x-hidden">
      <StackingComp height="5" id="contact">
        <Contact className="!sticky top-0" />
        <div className="absolute top-0">
          <StackingComp height="4" id="skills">
            <Skills className="!sticky top-0" />
            <div className="absolute top-0">
              <StackingComp height="3" id="projects">
                <Projects className="!sticky top-0" />
                <div className="absolute top-0">
                  <StackingComp height="2" id="about">
                    <About className="!sticky top-0" />
                    <section
                      className="hero-root-v3 !absolute top-0 left-0 z-9 w-full snap-center"
                    >
                      <RadialGlow />
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
                              <li className="hero-domain-v3">Business Analyst</li>
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
                  </StackingComp>
                </div>
              </StackingComp>
            </div>
          </StackingComp>
        </div>
      </StackingComp>
    </main>
  );
}
